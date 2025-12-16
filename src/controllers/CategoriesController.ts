import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const nameCategory = name.toUpperCase();
    const categoryExist = await prisma.category.findFirst({
      where: {
        name: nameCategory,
      },
    });
    if (categoryExist) {
      const error = new Error("La categoría ya existe");
      return res.status(409).json({ error: error.message });
    }
    await prisma.category.create({
      data: {
        name: name,
        organizationId: req.user.organizationId,
      },
    });
    res.send("Categoría creada correctamente");
  } catch (error) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.findFirst({
      where: {
        id: +id,
      },
    });
    if (!category) {
      const error = new Error("Categoría no encontrada");
      return res.status(404).json({ error: error.message });
    }
    await prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        name,
      },
    });
    res.send("Categoría actualizada correctamente");
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: +req.params.id,
      },
    });
    if (!category) {
      const error = new Error("Categoría no encontrada");
      return res.status(404).json({ error: error.message });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la categoría" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

export const getCategoriesProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    const categories = await prisma.category.findFirst({
      where: {
        id: +id,
        organizationId: req.user.organizationId,
      },
      include: {
        products: true,
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: +req.params.id,
        organizationId: req.user.organizationId,
      },
    });
    if (!category) {
      const error = new Error("Categoría no encontrada");
      return res.status(404).json({ error: error.message });
    }
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
      },
    });
    if (products.length) {
      const error = new Error(
        "Error, La categoría esta asociada a algún producto"
      );
      return res.status(400).json({ error: error.message });
    }
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
    res.send("Categoría eliminada correctamente");
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};
