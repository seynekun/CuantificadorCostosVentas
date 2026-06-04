import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { format, parseISO, startOfWeek } from "date-fns";

type MateriaPrimaDirectaPayload = {
  name: string;
  unidadMedida: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
};

type DetalleCostoPayload = {
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
};

type ValorTotalPayload = {
  nombre: string;
  valorTotal: number;
};

type ServicioPublicoPayload = {
  nombre: string;
  porcentaje: number;
  vinculadoProduccion: boolean;
};

const normalizeNullableNumber = (value?: number | null) => value ?? null;

export const createCosts = async (req: Request, res: Response) => {
  try {
    const {
      productoId,
      unidadMedida,
      cantidadProducida,
      perdidasEstimadas,
      cantidadesFinales,
      date,
      materiaPrimaDirecta = [],
      manoObraDirecta = [],
      costosIndirectosFabricacion = [],
      manoObraIndirecta = [],
      serviciosPublicos = [],
      costosGenerales = [],
      costosOperacion = [],
      gastosVentas = [],
      costoProduccion,
    } = req.body;

    const organizationId = req.user.organizationId;

    if (!organizationId || !productoId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const registro = await prisma.registroCostoProduccion.create({
      data: {
        date: date ? new Date(date) : new Date(),
        producto: { connect: { id: +productoId } },
        organization: { connect: { id: organizationId } },
        unidadMedida,
        cantidadProducida,
        perdidasEstimadas,
        cantidadesFinales,
        materiaPrimaDirecta: {
          create: materiaPrimaDirecta.map(
            (item: MateriaPrimaDirectaPayload) => ({
              name: item.name,
              unidadMedida: item.unidadMedida,
              cantidad: item.cantidad,
              costoUnitario: item.costoUnitario,
              costoTotal: item.costoTotal,
              organizationId,
            }),
          ),
        },
        manoObraDirecta: {
          create: manoObraDirecta.map((item: any) => ({
            nombre: item.nombre,
            unidadMedida: item.unidadMedida,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            costoTotal: item.costoTotal,
            organizationId,
          })),
        },
        costosIndirectosFabricacion: {
          create: costosIndirectosFabricacion.map((item: any) => ({
            nombre: item.nombre,
            unidadMedida: item.unidadMedida,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            costoTotal: item.costoTotal,
            organizationId,
          })),
        },
        manoObraIndirecta: {
          create: manoObraIndirecta.map((item: any) => ({
            nombre: item.nombre,
            unidadMedida: item.unidadMedida,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            costoTotal: item.costoTotal,
            organizationId,
          })),
        },
        costosGenerales: {
          create: costosGenerales.map((item: any) => ({
            nombre: item.nombre,
            valorTotal: item.valorTotal,
            organizationId,
          })),
        },
        costosOperacion: {
          create: costosOperacion.map((item: any) => ({
            nombre: item.nombre,
            valorTotal: item.valorTotal,
            organizationId,
          })),
        },
        gastosVentas: {
          create: gastosVentas.map((item: any) => ({
            nombre: item.nombre,
            valorTotal: item.valorTotal,
            organizationId,
          })),
        },
        serviciosPublicos: {
          create: serviciosPublicos.map((item: any) => ({
            nombre: item.nombre,
            porcentaje: item.porcentaje,
            vinculadoProduccion: item.vinculadoProduccion,
            organizationId,
          })),
        },
      },
    });

    if (costoProduccion) {
      await prisma.costosProduccion.create({
        data: {
          totalGastosMercadeo: costoProduccion.totalGastosMercadeo,
          totalCostosOperacion: costoProduccion.totalCostosOperacion,
          totalGastosProduccion: costoProduccion.totalGastosProduccion,
          totalCostoProduccionUnitario:
            costoProduccion.totalCostoProduccionUnitario,
          precioVentaUnitario: costoProduccion.precioVentaUnitario,
          precioCalculado: costoProduccion.precioCalculado,
          margenUtilidadUnitario: costoProduccion.margenUtilidadUnitario,
          margenDeseado: costoProduccion.margenDeseado,
          impuestos: costoProduccion.impuestos,
          costosFinancieros: costoProduccion.costosFinancieros,
          otrosGastos: costoProduccion.otrosGastos,
          margenUtilidadNeto: costoProduccion.margenUtilidadNeto,
          organizationId,
          registroId: registro.id,
        },
      });
    }

    return res.send("Registro de costos creado con éxito");
  } catch (error) {
    console.error("Error al crear el registro de costos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateCost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      productoId,
      unidadMedida,
      cantidadProducida,
      perdidasEstimadas,
      cantidadesFinales,
      date,
      materiaPrimaDirecta = [],
      manoObraDirecta = [],
      costosIndirectosFabricacion = [],
      manoObraIndirecta = [],
      serviciosPublicos = [],
      costosGenerales = [],
      costosOperacion = [],
      gastosVentas = [],
      costoProduccion,
    } = req.body;

    const organizationId = req.user.organizationId;

    if (!id || !organizationId || !productoId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const registro = await prisma.registroCostoProduccion.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!registro) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.registroCostoProduccion.update({
        where: { id },
        data: {
          date: date ? new Date(date) : undefined,
          producto: { connect: { id: +productoId } },
          unidadMedida,
          cantidadProducida,
          perdidasEstimadas,
          cantidadesFinales,
        },
      });

      await tx.materiaPrimaDirecta.deleteMany({ where: { registroId: id } });
      await tx.manoObraDirecta.deleteMany({ where: { registroId: id } });
      await tx.costosIndirectosFabricacion.deleteMany({
        where: { registroId: id },
      });
      await tx.manoObraIndirecta.deleteMany({ where: { registroId: id } });
      await tx.servicioPublico.deleteMany({ where: { registroId: id } });
      await tx.costosGenerales.deleteMany({ where: { registroId: id } });
      await tx.costosOperacion.deleteMany({ where: { registroId: id } });
      await tx.gastosVentas.deleteMany({ where: { registroId: id } });

      if (materiaPrimaDirecta.length > 0) {
        await tx.materiaPrimaDirecta.createMany({
          data: materiaPrimaDirecta.map((item: MateriaPrimaDirectaPayload) => ({
            name: item.name,
            unidadMedida: item.unidadMedida,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            costoTotal: item.costoTotal,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (manoObraDirecta.length > 0) {
        await tx.manoObraDirecta.createMany({
          data: manoObraDirecta.map((item: DetalleCostoPayload) => ({
            nombre: item.nombre,
            unidadMedida: item.unidadMedida,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            costoTotal: item.costoTotal,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (costosIndirectosFabricacion.length > 0) {
        await tx.costosIndirectosFabricacion.createMany({
          data: costosIndirectosFabricacion.map(
            (item: DetalleCostoPayload) => ({
              nombre: item.nombre,
              unidadMedida: item.unidadMedida,
              cantidad: item.cantidad,
              costoUnitario: item.costoUnitario,
              costoTotal: item.costoTotal,
              organizationId,
              registroId: id,
            }),
          ),
        });
      }

      if (manoObraIndirecta.length > 0) {
        await tx.manoObraIndirecta.createMany({
          data: manoObraIndirecta.map((item: DetalleCostoPayload) => ({
            nombre: item.nombre,
            unidadMedida: item.unidadMedida,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            costoTotal: item.costoTotal,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (serviciosPublicos.length > 0) {
        await tx.servicioPublico.createMany({
          data: serviciosPublicos.map((item: ServicioPublicoPayload) => ({
            nombre: item.nombre,
            porcentaje: item.porcentaje,
            vinculadoProduccion: item.vinculadoProduccion,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (costosGenerales.length > 0) {
        await tx.costosGenerales.createMany({
          data: costosGenerales.map((item: ValorTotalPayload) => ({
            nombre: item.nombre,
            valorTotal: item.valorTotal,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (costosOperacion.length > 0) {
        await tx.costosOperacion.createMany({
          data: costosOperacion.map((item: ValorTotalPayload) => ({
            nombre: item.nombre,
            valorTotal: item.valorTotal,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (gastosVentas.length > 0) {
        await tx.gastosVentas.createMany({
          data: gastosVentas.map((item: ValorTotalPayload) => ({
            nombre: item.nombre,
            valorTotal: item.valorTotal,
            organizationId,
            registroId: id,
          })),
        });
      }

      if (costoProduccion) {
        await tx.costosProduccion.upsert({
          where: { registroId: id },
          update: {
            totalGastosMercadeo: normalizeNullableNumber(
              costoProduccion.totalGastosMercadeo,
            ),
            totalCostosOperacion: normalizeNullableNumber(
              costoProduccion.totalCostosOperacion,
            ),
            totalGastosProduccion: normalizeNullableNumber(
              costoProduccion.totalGastosProduccion,
            ),
            totalCostoProduccionUnitario: normalizeNullableNumber(
              costoProduccion.totalCostoProduccionUnitario,
            ),
            precioVentaUnitario: normalizeNullableNumber(
              costoProduccion.precioVentaUnitario,
            ),
            precioCalculado: normalizeNullableNumber(
              costoProduccion.precioCalculado,
            ),
            margenUtilidadUnitario: normalizeNullableNumber(
              costoProduccion.margenUtilidadUnitario,
            ),
            margenDeseado: normalizeNullableNumber(
              costoProduccion.margenDeseado,
            ),
            impuestos: normalizeNullableNumber(costoProduccion.impuestos),
            costosFinancieros: normalizeNullableNumber(
              costoProduccion.costosFinancieros,
            ),
            otrosGastos: normalizeNullableNumber(costoProduccion.otrosGastos),
            margenUtilidadNeto: normalizeNullableNumber(
              costoProduccion.margenUtilidadNeto,
            ),
            organizationId,
          },
          create: {
            registroId: id,
            totalGastosMercadeo: normalizeNullableNumber(
              costoProduccion.totalGastosMercadeo,
            ),
            totalCostosOperacion: normalizeNullableNumber(
              costoProduccion.totalCostosOperacion,
            ),
            totalGastosProduccion: normalizeNullableNumber(
              costoProduccion.totalGastosProduccion,
            ),
            totalCostoProduccionUnitario: normalizeNullableNumber(
              costoProduccion.totalCostoProduccionUnitario,
            ),
            precioVentaUnitario: normalizeNullableNumber(
              costoProduccion.precioVentaUnitario,
            ),
            precioCalculado: normalizeNullableNumber(
              costoProduccion.precioCalculado,
            ),
            margenUtilidadUnitario: normalizeNullableNumber(
              costoProduccion.margenUtilidadUnitario,
            ),
            margenDeseado: normalizeNullableNumber(
              costoProduccion.margenDeseado,
            ),
            impuestos: normalizeNullableNumber(costoProduccion.impuestos),
            costosFinancieros: normalizeNullableNumber(
              costoProduccion.costosFinancieros,
            ),
            otrosGastos: normalizeNullableNumber(costoProduccion.otrosGastos),
            margenUtilidadNeto: normalizeNullableNumber(
              costoProduccion.margenUtilidadNeto,
            ),
            organizationId,
          },
        });
      } else {
        await tx.costosProduccion.deleteMany({
          where: { registroId: id },
        });
      }
    });

    return res.send("Registro de costos actualizado con éxito");
  } catch (error) {
    console.error("Error al actualizar el registro de costos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getRegistroCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const registro = await prisma.registroCostoProduccion.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
      include: {
        producto: true,
        organization: true,
        materiaPrimaDirecta: true,
        manoObraDirecta: true,
        costosIndirectosFabricacion: true,
        manoObraIndirecta: true,
        serviciosPublicos: true,
        costosGenerales: true,
        costosOperacion: true,
        gastosVentas: true,
        costoProduccion: true,
      },
    });

    if (!registro) {
      const error = new Error("Registro no encontrado");
      return res.status(404).json({ error: error.message });
    }
    res.send(registro);
  } catch (error) {
    console.error("Error al obtener el registro completo:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getAllRegistrosCostos = async (req: Request, res: Response) => {
  try {
    const registros = await prisma.registroCostoProduccion.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        producto: true,
        organization: true,
        materiaPrimaDirecta: true,
        manoObraDirecta: true,
        costosIndirectosFabricacion: true,
        manoObraIndirecta: true,
        serviciosPublicos: true,
        costosGenerales: true,
        costosOperacion: true,
        gastosVentas: true,
        costoProduccion: true,
      },
      where: {
        organizationId: req.user.organizationId,
      },
    });

    return res.status(200).json(registros);
  } catch (error) {
    console.error("Error al obtener los registros de costos:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener los registros de costos." });
  }
};

export const getEvolucionCostos = async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      modo = "dia",
      productoId,
      tipoConsulta = "costos",
    } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        error:
          "Debe proporcionar 'startDate' y 'endDate' en formato YYYY-MM-DD",
      });
    }
    const start = parseISO(startDate as string);
    const end = parseISO(endDate as string);
    const whereClause = productoId
      ? {
          date: {
            gte: start,
            lte: end,
          },
          productoId: +productoId,
          organizationId: req.user.organizationId,
        }
      : {
          date: {
            gte: start,
            lte: end,
          },
          organizationId: req.user.organizationId,
        };
    const registros = await prisma.registroCostoProduccion.findMany({
      where: whereClause,
      orderBy: {
        date: "asc",
      },
      include: {
        costoProduccion: true,
      },
    });

    // Determinar si se consulta costos o precios
    const consultarPrecios = tipoConsulta === "precios";
    const filtrados = registros.filter((r) => r.costoProduccion);
    if (modo === "semana") {
      const agrupados = filtrados.reduce(
        (acc, r) => {
          const semana = format(
            startOfWeek(r.date, { weekStartsOn: 1 }),
            "yyyy-MM-dd",
          );
          if (!acc[semana])
            acc[semana] = {
              semana,
              total: 0,
              count: 0,
              margenUtilidadUnitario: 0,
              precioVenta: 0,
            };
          acc[semana].total += r.costoProduccion!.totalCostoProduccionUnitario;
          acc[semana].margenUtilidadUnitario +=
            r.costoProduccion.margenUtilidadUnitario;
          acc[semana].precioVenta += r.costoProduccion.precioVentaUnitario;
          acc[semana].count += 1;
          return acc;
        },
        {} as Record<
          string,
          {
            semana: string;
            total: number;
            count: number;
            margenUtilidadUnitario: number;
            precioVenta: number;
          }
        >,
      );

      const datos = Object.values(agrupados).map(
        ({ semana, total, count, margenUtilidadUnitario, precioVenta }) => {
          // Datos comunes
          const datoComun = {
            fecha: semana,
          };

          // Datos específicos según tipo de consulta
          if (consultarPrecios) {
            return {
              ...datoComun,
              precioVenta: precioVenta / count,
              margenUtilidadUnitario: margenUtilidadUnitario / count,
            };
          } else {
            return {
              ...datoComun,
              costoUnitario: total / count,
            };
          }
        },
      );

      return res.json(datos);
    }
    // Por día
    const datos = filtrados.map((r) => {
      // Datos comunes
      const datoComun = {
        fecha: format(r.date, "yyyy-MM-dd"),
      };

      // Datos específicos según tipo de consulta
      if (consultarPrecios) {
        return {
          ...datoComun,
          precioVenta: r.costoProduccion!.precioVentaUnitario,
          margenUtilidadUnitario: r.costoProduccion.margenUtilidadUnitario,
        };
      } else {
        return {
          ...datoComun,
          costoUnitario: r.costoProduccion!.totalCostoProduccionUnitario,
        };
      }
    });
    res.json(datos);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al obtener los registros de costos." });
  }
};

export const deleteCost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    if (!id || !organizationId) {
      const error = new Error("Faltan datos obligatorios");
      return res.status(400).json({ error: error.message });
    }

    const registro = await prisma.registroCostoProduccion.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!registro || registro.organizationId !== organizationId) {
      const error = new Error("Registro no encontrado");
      return res.status(404).json({ error: error.message });
    }

    await prisma.registroCostoProduccion.delete({
      where: { id },
    });

    return res.send("Registro de costos eliminado con éxito");
  } catch (error) {
    console.error("Error al eliminar el registro de costos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
