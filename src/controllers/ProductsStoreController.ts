import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import formidable from "formidable";
import cloudinary from "../config/cloudinary";
import { v4 as uuid } from "uuid";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, inventory, image, tipoUnidad, categoryId } = req.body;
    const nameProduct = name.toUpperCase();

    const productExist = await prisma.product.findFirst({
      where: {
        name: nameProduct,
      },
    });
    if (productExist) {
      const error = new Error("El producto ya existe");
      return res.status(409).json({ error: error.message });
    }
    await prisma.product.create({
      data: {
        name,
        price: +price,
        image,
        inventory: +inventory,
        categoryId: +categoryId,
        organizationId: req.user.organizationId,
        tipoUnidad: +tipoUnidad,
      },
    });
    res.send("Producto creado correctamente");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, inventory, image, tipoUnidad, categoryId } = req.body;
    const product = await prisma.product.findFirst({
      where: {
        id: +id,
        organizationId: req.user.organizationId,
      },
    });
    if (!product) {
      const error = new Error("Producto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        name,
        price: +price,
        image,
        inventory: +inventory,
        categoryId: +categoryId,
        organizationId: req.user.organizationId,
        tipoUnidad: +tipoUnidad,
      },
    });
    res.send("Producto actualizado correctamente");
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

export const updatePriceProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    const product = await prisma.product.findFirst({
      where: {
        id: +id,
        organizationId: req.user.organizationId,
      },
    });
    if (!product) {
      const error = new Error("Producto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        price: +price,
      },
    });
    res.send("Producto actualizado correctamente");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: +req.params.id,
        organizationId: req.user.organizationId,
      },
    });
    if (!product) {
      const error = new Error("Producto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = +req.query.page || 1;
    const pageSize = +req.query.limit || 10;
    const skip = (page - 1) * pageSize;
    const products = await prisma.product.findMany({
      where: { organizationId: req.user.organizationId },
      take: pageSize,
      skip,
      include: { category: true },
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

export const getProductByCategoryId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findMany({
      where: {
        categoryId: +id,
        organizationId: req.user.organizationId,
        inventory: { gt: 0 },
      },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

export const productCount = async (req: Request, res: Response) => {
  try {
    const count = await prisma.product.count({
      where: {
        organizationId: req.user.organizationId,
      },
    });
    res.json(count);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: +req.params.id,
        organizationId: req.user.organizationId,
      },
    });
    if (!product) {
      const error = new Error("Producto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    await prisma.product.delete({
      where: {
        id: product.id,
      },
    });
    res.send("Producto eliminado correctamente");
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

const parseForm = (req: Request): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { files } = await parseForm(req);
    if (!files?.file?.[0]) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }
    const filePath = files.file[0].filepath;
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: uuid(),
    });
    if (id) {
      await prisma.product.update({
        where: { id: Number(id) },
        data: { image: result.secure_url },
      });
    }
    return res.json({
      image: result.secure_url,
    });
  } catch (error: any) {
    console.error("Error al subir imagen:", error);
    return res.status(500).json({
      error: "Hubo un error al procesar la imagen",
      details: error?.message,
    });
  }
};
