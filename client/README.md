# E-Commerce Client

Modern React frontend for the E-Commerce Platform built with React 18, Vite, TypeScript, and Tailwind CSS.

## Features

- **React 18** with hooks and modern patterns
- **Vite** for lightning-fast development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn UI** components
- **React Router v6** for routing
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Hook Form + Zod** for forms
- **Axios** for API calls

## Tech Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Router v6
- TanStack Query (React Query)
- Zustand
- React Hook Form
- Zod
- Axios
- Lucide React (icons)

## Prerequisites

- Node.js 18+ and npm

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
VITE_API_URL=http://localhost:5000/api
```

## Running the Client

### Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── layout/            # Layout components
│   │   ├── products/          # Product components
│   │   ├── cart/              # Cart components
│   │   └── common/            # Common components
│   ├── pages/                 # Page components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities and API client
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   ├── App.tsx                # App component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── Dockerfile
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Pages

- **Home** - Landing page with featured products
- **Products** - Product listing with filters
- **Product Detail** - Individual product page
- **Cart** - Shopping cart
- **Checkout** - Checkout process
- **Login/Register** - Authentication pages
- **Profile** - User profile and settings
- **Orders** - Order history
- **Admin Dashboard** - Admin panel (admin only)

## State Management

### Zustand Stores

- **authStore** - User authentication state
- **cartStore** - Shopping cart state
- **uiStore** - UI state (modals, drawers, etc.)

### React Query

Used for server state management with automatic caching, refetching, and synchronization.

## Custom Hooks

- **useAuth** - Authentication operations
- **useCart** - Cart operations
- **useDebounce** - Debounce value changes

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
