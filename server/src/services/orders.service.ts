import { Order, IOrder, IShippingAddress } from '../models/Order.model';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { NotFoundError, ValidationError } from '../utils/apiError.util';
import { ORDER_STATUS } from '../config/constants';

export interface CreateOrderData {
  shippingAddress: IShippingAddress;
}

class OrdersService {
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  async createOrder(userId: string, data: CreateOrderData): Promise<IOrder> {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        throw new NotFoundError(`Product ${item.product} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
      });

      subtotal += product.price * item.quantity;

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shippingCost;

    const order = await Order.create({
      orderNumber: this.generateOrderNumber(),
      user: userId,
      items: orderItems,
      shippingAddress: data.shippingAddress,
      subtotal,
      tax,
      shippingCost,
      total,
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] }
    );

    return order;
  }

  async getOrders(userId: string): Promise<IOrder[]> {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    return orders;
  }

  async getOrderById(userId: string, orderId: string): Promise<IOrder> {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate('items.product');
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async getAllOrders(): Promise<IOrder[]> {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email')
      .populate('items.product');
    
    return orders;
  }

  async updateOrderStatus(
    orderId: string,
    status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS]
  ): Promise<IOrder> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }
}

export default new OrdersService();
