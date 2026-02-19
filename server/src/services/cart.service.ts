import { Cart, ICart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { NotFoundError, ValidationError } from '../utils/apiError.util';

class CartService {
  async getCart(userId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return cart;
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<ICart> {
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].price = product.price;
      } else {
        cart.items.push({
          product: productId as any,
          quantity,
          price: product.price,
        });
      }

      await cart.save();
    }

    return cart.populate('items.product');
  }

  async updateCartItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<ICart> {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      
      if (!product || !product.isActive) {
        throw new NotFoundError('Product not found');
      }

      if (product.stock < quantity) {
        throw new ValidationError('Insufficient stock');
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    return cart.populate('items.product');
  }

  async removeFromCart(userId: string, productId: string): Promise<ICart> {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    return cart.populate('items.product');
  }

  async clearCart(userId: string): Promise<void> {
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );
  }
}

export default new CartService();
