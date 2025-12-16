import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { isAuthenticated } from "../middleware/auth";
import {
  createProduct,
  updateProduct,
  uploadImage,
  getProducts,
  getProductById,
  productCount,
  getProductByCategoryId,
} from "../controllers/ProductsStoreController";

const router = Router();

router.post(
  "/create-product",
  body("name").isLength({ min: 1 }).withMessage("Nombre inválido"),
  handleInputErrors,
  isAuthenticated,
  createProduct
);
router.patch(
  "/update-product/:id",
  body("name").isLength({ min: 1 }).withMessage("Nombre inválido"),
  handleInputErrors,
  isAuthenticated,
  updateProduct
);
router.get("/get-product-by-id/:id", isAuthenticated, getProductById);
router.get("/get-products", isAuthenticated, getProducts);
router.get(
  "/get-products-by-category/:id",
  isAuthenticated,
  getProductByCategoryId
);
router.get("/get-products-count", isAuthenticated, productCount);
router.patch("/update-product/:id", isAuthenticated, updateProduct);
router.post("/upload-image/:id", isAuthenticated, uploadImage);
router.post("/upload-image", isAuthenticated, uploadImage);

export default router;
