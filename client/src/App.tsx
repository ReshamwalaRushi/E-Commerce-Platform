import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Home } from '@/pages/Home';
import { Products } from '@/pages/Products';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { useAuthStore } from '@/store/authStore';
import { ToastProvider } from '@/components/ui/toast';
import Dashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminReports from '@/pages/admin/AdminReports';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route
              path="/profile"
              element={
                <Layout>
                  <PrivateRoute>
                    <div className="container py-8">
                      <h1 className="text-3xl font-bold">Profile</h1>
                      <p className="text-muted-foreground mt-2">Profile page coming soon...</p>
                    </div>
                  </PrivateRoute>
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <PrivateRoute>
                    <div className="container py-8">
                      <h1 className="text-3xl font-bold">My Orders</h1>
                      <p className="text-muted-foreground mt-2">Orders page coming soon...</p>
                    </div>
                  </PrivateRoute>
                </Layout>
              }
            />
            <Route
              path="/cart"
              element={
                <Layout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <p className="text-muted-foreground mt-2">Cart page coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
