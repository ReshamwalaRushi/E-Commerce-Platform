# E-Commerce Server

Backend API for the E-Commerce Platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **RESTful API** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with secure token handling
- **Role-based Authorization** (Admin/Customer)
- **Input Validation** with express-validator
- **Security** with Helmet and CORS
- **Logging** with Winston
- **Error Handling** with custom error classes

## Tech Stack

- Node.js 20+
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Winston for logging
- Helmet for security headers
- CORS for cross-origin requests

## Prerequisites

- Node.js 18+ and npm
- MongoDB 7+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/ecommerce_db?authSource=admin
JWT_SECRET=your_jwt_secret_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:3000
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Seed Database
```bash
npm run seed
```

This will create:
- Admin user: `admin@ecommerce.com` / `Admin@123`
- Customer user: `customer@ecommerce.com` / `Customer@123`
- 25 sample products across 5 categories

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user (protected)

### Products (`/api/products`)
- `GET /` - Get all products (with filters)
- `GET /:id` - Get product by ID
- `GET /slug/:slug` - Get product by slug
- `GET /categories` - Get all categories
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

### Cart (`/api/cart`)
- `GET /` - Get user cart (protected)
- `POST /items` - Add item to cart (protected)
- `PUT /items/:productId` - Update cart item (protected)
- `DELETE /items/:productId` - Remove item from cart (protected)
- `DELETE /` - Clear cart (protected)

### Orders (`/api/orders`)
- `GET /` - Get user orders (protected)
- `GET /:id` - Get order by ID (protected)
- `POST /` - Create order (protected)

### Users (`/api/users`)
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `POST /addresses` - Add address (protected)
- `PUT /addresses/:id` - Update address (protected)
- `DELETE /addresses/:id` - Delete address (protected)

### Admin (`/api/admin`)
- `GET /dashboard` - Get dashboard stats (admin only)
- `GET /orders` - Get all orders (admin only)
- `PUT /orders/:id/status` - Update order status (admin only)
- `GET /users` - Get all users (admin only)

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   └── constants.ts       # App constants
│   ├── models/
│   │   ├── User.model.ts      # User schema
│   │   ├── Product.model.ts   # Product schema
│   │   ├── Cart.model.ts      # Cart schema
│   │   ├── Order.model.ts     # Order schema
│   │   └── Review.model.ts    # Review schema
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── users.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── cart.service.ts
│   │   └── orders.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── users.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── logger.util.ts
│   │   └── apiError.util.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── seeds/
│   │   └── index.ts           # Database seeder
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example
├── .eslintrc.json
├── .gitignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## License

MIT
