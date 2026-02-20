import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import productsController, {
  createProductValidation,
} from '../controllers/products.controller';
import reviewsController, {
  createReviewValidation,
} from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const reviewRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', productsController.getProducts.bind(productsController));
router.get('/categories', productsController.getCategories.bind(productsController));
router.get('/:id', productsController.getProductById.bind(productsController));
router.get('/slug/:slug', productsController.getProductBySlug.bind(productsController));

router.get('/:id/reviews', reviewRateLimit, reviewsController.getReviews.bind(reviewsController));
router.post(
  '/:id/reviews',
  reviewRateLimit,
  authenticate,
  validate(createReviewValidation),
  reviewsController.createReview.bind(reviewsController)
);

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
