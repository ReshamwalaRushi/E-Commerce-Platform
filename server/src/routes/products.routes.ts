import { Router } from 'express';
import productsController, {
  createProductValidation,
} from '../controllers/products.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', productsController.getProducts.bind(productsController));
router.get('/categories', productsController.getCategories.bind(productsController));
router.get('/:id', productsController.getProductById.bind(productsController));
router.get('/slug/:slug', productsController.getProductBySlug.bind(productsController));

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductValidation),
  productsController.createProduct.bind(productsController)
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  productsController.updateProduct.bind(productsController)
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productsController.deleteProduct.bind(productsController)
);

export default router;
