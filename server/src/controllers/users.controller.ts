import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { User } from '../models/User.model';
import { NotFoundError } from '../utils/apiError.util';

export const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
];

export const addAddressValidation = [
  body('street').notEmpty().withMessage('Street is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').notEmpty().withMessage('Zip code is required'),
  body('country').notEmpty().withMessage('Country is required'),
];

class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await User.findById(req.user.userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        success: true,
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          addresses: user.addresses,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { firstName, lastName } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        success: true,
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await User.findById(req.user.userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.addresses.push(req.body);
      await user.save();

      res.json({
        success: true,
        data: user.addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await User.findById(req.user.userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const address = user.addresses.id(req.params.id);
      
      if (!address) {
        throw new NotFoundError('Address not found');
      }

      Object.assign(address, req.body);
      await user.save();

      res.json({
        success: true,
        data: user.addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await User.findById(req.user.userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.addresses.pull(req.params.id);
      await user.save();

      res.json({
        success: true,
        data: user.addresses,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
