import { Router } from 'express';
import usersController, {
  updateProfileValidation,
  addAddressValidation,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile.bind(usersController));
router.put(
  '/profile',
  validate(updateProfileValidation),
  usersController.updateProfile.bind(usersController)
);
router.post(
  '/addresses',
  validate(addAddressValidation),
  usersController.addAddress.bind(usersController)
);
router.put('/addresses/:id', usersController.updateAddress.bind(usersController));
router.delete('/addresses/:id', usersController.deleteAddress.bind(usersController));

export default router;
