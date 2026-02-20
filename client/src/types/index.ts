export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  brand: string;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: User;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

export interface ProductFilters {
  category?: string;
  status?: string;
  stock?: string;
  search?: string;
}
