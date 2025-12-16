import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { isAuthenticated } from "../middleware/auth";
import {
  createProduct,
  getproductoById,
  getproducts,
  updateproduct,
} from "../controllers/ProductosController";
import { uploadImage } from "../controllers/ProductsStoreController";

const router = Router();

router.post(
  "/create-product",
  body("nombre").isLength({ min: 1 }).withMessage("Nombre inválido"),
  handleInputErrors,
  isAuthenticated,
  createProduct
);
router.patch(
  "/update-product/:id",
  body("nombre").isLength({ min: 1 }).withMessage("Nombre inválido"),
  handleInputErrors,
  isAuthenticated,
  updateproduct
);
router.get("/get-product-by-id/:id", isAuthenticated, getproductoById);
router.get("/get-products", isAuthenticated, getproducts);
router.post("/upload-image/:id", isAuthenticated, uploadImage);
router.post("/upload-image", isAuthenticated, uploadImage);
router.post("/upload-image/:id", isAuthenticated, uploadImage);

export default router;
