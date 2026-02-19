import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import cartService from '../services/cart.service';

export const addToCartValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

export const updateCartValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be at least 0'),
];

class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const cart = await cartService.getCart(req.user.userId);

      res.json({
        success: true,
        data: cart || { items: [] },
      });
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { productId, quantity } = req.body;
      const cart = await cartService.addToCart(req.user.userId, productId, quantity);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { quantity } = req.body;
      const cart = await cartService.updateCartItem(
        req.user.userId,
        req.params.productId,
        quantity
      );

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const cart = await cartService.removeFromCart(
        req.user.userId,
        req.params.productId
      );

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      await cartService.clearCart(req.user.userId);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
