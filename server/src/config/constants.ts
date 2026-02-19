export const CONSTANTS = {
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: 10,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  TAX_RATE: 0.1, // 10% tax
  FREE_SHIPPING_THRESHOLD: 100, // Free shipping for orders over $100
  SHIPPING_COST: 10, // Standard shipping cost
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;
