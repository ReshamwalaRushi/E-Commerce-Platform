import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Order } from '../models/Order.model';
import { Product } from '../models/Product.model';
import ordersService from '../services/orders.service';

class AdminController {
  async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalUsers, totalOrders, totalProducts, recentOrders] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName email'),
      ]);

      const totalRevenue = await Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalOrders,
          totalProducts,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentOrders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await ordersService.getAllOrders();

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const order = await ordersService.updateOrderStatus(req.params.id, status);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
