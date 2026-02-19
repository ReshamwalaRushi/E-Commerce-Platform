import { Router } from 'express';
import ordersController, {
  createOrderValidation,
} from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ordersController.getOrders.bind(ordersController));
router.get('/:id', ordersController.getOrderById.bind(ordersController));
router.post('/', validate(createOrderValidation), ordersController.createOrder.bind(ordersController));

export default router;
