import { Router } from "express";

import { isAuthenticated } from "../middleware/auth";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
  getCategoriesProducts,
} from "../controllers/CategoriesController";
import { handleInputErrors } from "../middleware/validation";
import { body, param } from "express-validator";
const router = Router();

router.post(
  "/create-category",
  body("name").isLength({ min: 3 }).withMessage("Nombre inválido"),
  handleInputErrors,
  isAuthenticated,
  createCategory
);
router.get("/get-categories", isAuthenticated, getCategories);
router.get("/get-category-by-id/:id", isAuthenticated, getCategoryById);
router.get("/get-categories-products", isAuthenticated, getCategoriesProducts);
router.put(
  "/update-category/:id",
  param("id").isNumeric().withMessage("Id inválido"),
  body("name").isLength({ min: 1 }).withMessage("Nombre inválido"),
  handleInputErrors,
  isAuthenticated,
  updateCategory
);
router.delete("/delete-category/:id", isAuthenticated, deleteCategory);

export default router;
