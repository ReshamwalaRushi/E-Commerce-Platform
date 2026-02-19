import { Router } from 'express';
import cartController, {
  addToCartValidation,
  updateCartValidation,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart.bind(cartController));
router.post('/items', validate(addToCartValidation), cartController.addToCart.bind(cartController));
router.put(
  '/items/:productId',
  validate(updateCartValidation),
  cartController.updateCartItem.bind(cartController)
);
router.delete('/items/:productId', cartController.removeFromCart.bind(cartController));
router.delete('/', cartController.clearCart.bind(cartController));

export default router;
