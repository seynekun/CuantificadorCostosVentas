import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { SaleDetail } from "@prisma/client";
import { endOfDay, isValid, parseISO, startOfDay } from "date-fns";

export const createSale = async (req: Request, res: Response) => {
  try {
    const { name, nit, metodoPago, observaciones, saleDetails, date } =
      req.body;

    await prisma.$transaction(async (tx) => {
      const total = saleDetails.reduce(
        (acc: number, item: any) => acc + item.quantity * item.price,
        0
      );

      await tx.sale.create({
        data: {
          date: date ? new Date(date) : new Date(),
          total,
          name,
          nit,
          metodoPago,
          observaciones,
          organizationId: req.user.organizationId,
          salesDetails: {
            create: saleDetails.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitprice: item.price,
            })),
          },
        },
      });

      for (const item of saleDetails) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Producto no encontrado");
        }

        if (product.inventory < item.quantity) {
          throw new Error(
            `Inventario insuficiente para el producto ${product.name}`
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }
    });

    res.send("Venta realizada correctamente");
  } catch (error) {
    res.status(400).json({
      error: error.message || "Error al crear la venta",
    });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const transactionDate = req.query.date as string;
    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new Error("La fecha no es valida");
      }
      const start = startOfDay(date);
      const end = endOfDay(date);

      const sales = await prisma.sale.findMany({
        where: {
          organizationId: req.user.organizationId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          salesDetails: {
            include: {
              product: true,
            },
          },
        },
      });

      res.send(sales);
    }
  } catch (error) {
    res.status(400).json({
      error: error.message || "Error al obtener las ventas",
    });
  }
};

export const getSalesByDateMes = async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    if (dateFrom && dateTo) {
      const dateFromParsed = parseISO(dateFrom);
      if (!isValid(dateFromParsed)) {
        throw new Error("La fecha no es valida");
      }
      const dateToParsed = parseISO(dateTo);
      if (!isValid(dateToParsed)) {
        throw new Error("La fecha no es valida");
      }
      const startOfDayDate = startOfDay(dateFrom);
      const endOfDayDate = endOfDay(dateTo);

      const sales = await prisma.sale.findMany({
        where: {
          organizationId: req.user.organizationId,
          date: {
            gte: startOfDayDate,
            lte: endOfDayDate,
          },
        },
        include: {
          salesDetails: {
            include: {
              product: true,
            },
          },
        },
      });
      res.send(sales);
    }
  } catch (error) {
    res.status(400).json({
      error: error.message || "Error al obtener las ventas",
    });
  }
};

export const deleteSaleDay = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findFirst({
      where: {
        id: +id,
        organizationId: req.user.organizationId,
      },
    });
    if (!sale) {
      const error = new Error("La venta no existe");
      return res.status(404).json({ error: error.message });
    }
    await prisma.sale.delete({
      where: {
        id: sale.id,
      },
    });
    res.send("Venta eliminada correctamente");
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la venta" });
  }
};
