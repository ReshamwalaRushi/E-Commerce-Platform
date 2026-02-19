# E-Commerce Platform

A complete, production-ready e-commerce platform with modern architecture and best practices. Built with React, Node.js, TypeScript, and MongoDB.

## 🎯 Project Overview

This is a full-stack e-commerce platform featuring:
- Modern React frontend with TypeScript and Tailwind CSS
- RESTful API backend with Express and MongoDB
- JWT-based authentication and authorization
- Shopping cart and order management
- Admin dashboard for managing products, orders, and users
- Docker support for easy deployment
- CI/CD pipeline with GitHub Actions

## 🚀 Features

### Customer Features
- Browse products with advanced filtering and search
- Product categories and featured products
- Shopping cart with real-time updates
- User authentication and profile management
- Order placement and tracking
- Address management

### Admin Features
- Dashboard with statistics
- Product management (Create, Read, Update, Delete)
- Order management and status updates
- User management
- Inventory tracking

## 📚 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
- **React Router v6** - Routing
- **TanStack Query** - Server state
- **Zustand** - Client state
- **React Hook Form + Zod** - Forms and validation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Helmet** - Security
- **CORS** - Cross-origin requests

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- MongoDB 7 or higher
- npm or yarn
- Docker (optional)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/ReshamwalaRushi/E-Commerce-Platform.git
cd E-Commerce-Platform
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

4. **Seed Database**
```bash
cd server
npm run seed
```

### Docker Setup

1. **Start all services**
```bash
docker-compose up -d
```

2. **Seed the database**
```bash
docker-compose exec server npm run seed
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 🔑 Demo Credentials

After running the seed script, you can use these credentials:

**Admin Account:**
- Email: admin@ecommerce.com
- Password: Admin@123

**Customer Account:**
- Email: customer@ecommerce.com
- Password: Customer@123

## 📁 Project Structure

```
E-Commerce-Platform/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities and API
│   │   ├── store/             # Zustand stores
│   │   └── types/             # TypeScript types
│   ├── public/
│   └── package.json
├── server/                     # Node.js Backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── models/            # Mongoose models
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utility functions
│   │   └── seeds/             # Database seeders
│   └── package.json
├── docker-compose.yml          # Docker orchestration
├── .github/workflows/          # CI/CD pipelines
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/ecommerce_db?authSource=admin
JWT_SECRET=your_jwt_secret_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products Endpoints
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productId` - Update cart item
- `DELETE /api/cart/items/:productId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users

## 🔒 Security Considerations

### Implemented Security Features
- JWT-based authentication with token expiration
- Password hashing with bcrypt (10 rounds)
- Helmet for security headers
- CORS configuration
- Input validation with express-validator
- Strict TypeScript mode for type safety
- Environment variable validation for production

### Recommended Additional Security Measures (For Production)
- **Rate Limiting**: Implement rate limiting middleware (e.g., express-rate-limit) to prevent brute-force attacks
- **CSRF Protection**: Add CSRF token protection for state-changing operations
- **HTTP-only Cookies**: Store JWT tokens in HTTP-only cookies instead of localStorage for better XSS protection
- **Content Security Policy**: Implement strict CSP headers
- **API Input Sanitization**: Add additional input sanitization beyond validation
- **Database Query Parameterization**: Already implemented via Mongoose, prevents SQL injection
- **Secrets Management**: Use proper secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- **Regular Dependency Updates**: Keep dependencies updated to patch known vulnerabilities

## 🧪 Testing

### Run Backend Tests
```bash
cd server
npm test
```

### Run Frontend Tests
```bash
cd client
npm test
```

### Run Linting
```bash
# Backend
cd server
npm run lint

# Frontend
cd client
npm run lint
```

## 🚀 Deployment

### Production Build

1. **Build Frontend**
```bash
cd client
npm run build
```

2. **Build Backend**
```bash
cd server
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Rushi Reshamwala**

## 🙏 Acknowledgments

- Shadcn UI for the beautiful component library
- All the open-source libraries used in this project

---

⭐ Star this repository if you found it helpful!
