import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";
import { body, param } from "express-validator";
import {
  createSale,
  deleteSaleDay,
  getSales,
  getSalesByDateMes,
} from "../controllers/SalesController";
const router = Router();

router.post(
  "/create-sale",
  isAuthenticated,
  handleInputErrors,
  body("name").isLength({ min: 3 }).withMessage("Nombre inválido"),
  body("nit").isLength({ min: 3 }).withMessage("NIT inválido"),
  body("metodoPago")
    .isLength({ min: 3 })
    .withMessage("Método de Pago inválido"),
  body("observaciones")
    .isLength({ min: 3 })
    .withMessage("Observaciones inválidas"),
  createSale
);

router.get(
  "/sales-by-date",
  isAuthenticated,
  param("date").isString().withMessage("La fecha no es valida"),
  getSales
);

router.get(
  "/sales-by-date-mes",
  isAuthenticated,
  param("dateFrom").isString().withMessage("La fecha no es valida"),
  param("dateTo").isString().withMessage("La fecha no es valida"),
  getSalesByDateMes
);

router.delete("/delete-sale/:id", isAuthenticated, deleteSaleDay);

export default router;
