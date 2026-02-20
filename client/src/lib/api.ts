import axios from './axios';
import { ApiResponse } from '@/types/api.types';
import { User, Product, Cart, Order, Address, DashboardStats } from '@/types';

// Auth API
export const authApi = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => axios.post<ApiResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    axios.post<ApiResponse>('/auth/login', data),
  
  logout: () => axios.post<ApiResponse>('/auth/logout'),
  
  getMe: () => axios.get<ApiResponse<User>>('/auth/me'),
};

// Products API
export const productsApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isFeatured?: boolean;
  }) => axios.get<ApiResponse<Product[]>>('/products', { params }),
  
  getProductById: (id: string) =>
    axios.get<ApiResponse<Product>>(`/products/${id}`),
  
  getProductBySlug: (slug: string) =>
    axios.get<ApiResponse<Product>>(`/products/slug/${slug}`),
  
  getCategories: () => axios.get<ApiResponse<string[]>>('/products/categories'),
  
  createProduct: (data: Partial<Product>) =>
    axios.post<ApiResponse<Product>>('/products', data),
  
  updateProduct: (id: string, data: Partial<Product>) =>
    axios.put<ApiResponse<Product>>(`/products/${id}`, data),
  
  deleteProduct: (id: string) =>
    axios.delete<ApiResponse>(`/products/${id}`),
};

// Cart API
export const cartApi = {
  getCart: () => axios.get<ApiResponse<Cart>>('/cart'),
  
  addToCart: (productId: string, quantity: number) =>
    axios.post<ApiResponse<Cart>>('/cart/items', { productId, quantity }),
  
  updateCartItem: (productId: string, quantity: number) =>
    axios.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity }),
  
  removeFromCart: (productId: string) =>
    axios.delete<ApiResponse<Cart>>(`/cart/items/${productId}`),
  
  clearCart: () => axios.delete<ApiResponse>('/cart'),
};

// Orders API
export const ordersApi = {
  getOrders: () => axios.get<ApiResponse<Order[]>>('/orders'),
  
  getOrderById: (id: string) =>
    axios.get<ApiResponse<Order>>(`/orders/${id}`),
  
  createOrder: (data: { shippingAddress: Address }) =>
    axios.post<ApiResponse<Order>>('/orders', data),
};

// Users API
export const usersApi = {
  getProfile: () => axios.get<ApiResponse<User>>('/users/profile'),
  
  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    axios.put<ApiResponse<User>>('/users/profile', data),
  
  addAddress: (data: Address) =>
    axios.post<ApiResponse<Address[]>>('/users/addresses', data),
  
  updateAddress: (id: string, data: Address) =>
    axios.put<ApiResponse<Address[]>>(`/users/addresses/${id}`, data),
  
  deleteAddress: (id: string) =>
    axios.delete<ApiResponse<Address[]>>(`/users/addresses/${id}`),
};

// Admin API
export const adminApi = {
  getDashboard: () => axios.get<ApiResponse<DashboardStats>>('/admin/dashboard'),

  getOrders: (filters?: { status?: string; startDate?: string; endDate?: string; search?: string }) =>
    axios.get<ApiResponse<Order[]>>('/admin/orders', { params: filters }),

  getOrderById: (id: string) => axios.get<ApiResponse<Order>>(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string, notes?: string) =>
    axios.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status, notes }),

  getUsers: (filters?: { role?: string; status?: string; search?: string }) =>
    axios.get<ApiResponse<User[]>>('/admin/users', { params: filters }),

  getUserById: (id: string) => axios.get<ApiResponse<User>>(`/admin/users/${id}`),

  updateUser: (id: string, data: Partial<User>) =>
    axios.put<ApiResponse<User>>(`/admin/users/${id}`, data),
};
