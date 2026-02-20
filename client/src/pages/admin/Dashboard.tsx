import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi, productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { DashboardStats, Order, Product, User } from '@/types';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Package, ShoppingBag, Users } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const generateRevenueData = () => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      revenue: Math.floor(Math.random() * 10000) + 5000,
    };
  });
};

const CATEGORY_DATA = [
  { name: 'Electronics', value: 35, color: '#3B82F6' },
  { name: 'Clothing', value: 25, color: '#8B5CF6' },
  { name: 'Sports', value: 20, color: '#10B981' },
  { name: 'Books', value: 15, color: '#F59E0B' },
  { name: 'Home', value: 5, color: '#EF4444' },
];

const ORDER_STATUS_DATA = [
  { status: 'Pending', count: 10 },
  { status: 'Processing', count: 15 },
  { status: 'Shipped', count: 8 },
  { status: 'Delivered', count: 30 },
  { status: 'Cancelled', count: 2 },
];

const TOP_PRODUCTS = [
  { name: 'Wireless Headphones', category: 'Electronics', unitsSold: 145, revenue: 21750 },
  { name: 'Running Shoes', category: 'Sports', unitsSold: 98, revenue: 9800 },
  { name: 'Cotton T-Shirt', category: 'Clothing', unitsSold: 210, revenue: 4200 },
  { name: 'Python Book', category: 'Books', unitsSold: 67, revenue: 2010 },
  { name: 'Smart Watch', category: 'Electronics', unitsSold: 55, revenue: 16500 },
];

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData] = useState(generateRevenueData);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, ordersRes, productsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getOrders(),
        productsApi.getProducts({ limit: 100 }),
      ]);
      setStats(dashRes.data.data as DashboardStats);
      const allOrders = (ordersRes.data.data as Order[]) || [];
      setOrders(allOrders.slice(0, 5));
      const allProducts = (productsRes.data.data as Product[]) || [];
      setLowStockProducts(allProducts.filter(p => p.stock < 10).slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatPrice(stats.totalRevenue) : '$0',
      change: '+12% from last month',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      change: '+8 from yesterday',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      change: `${lowStockProducts.length} low stock`,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      change: '+23 this month',
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatPrice(Number(v ?? 0))} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name ?? ''}: ${value ?? ''}%`}
                  labelLine={false}
                >
                  {CATEGORY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v ?? ''}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ORDER_STATUS_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const orderUser = order.user as User;
                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                        <TableCell>{typeof orderUser === 'object' ? `${orderUser.firstName} ${orderUser.lastName}` : ''}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_PRODUCTS.map((product, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.unitsSold}</TableCell>
                    <TableCell>{formatPrice(product.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button className="text-xs text-blue-600 hover:underline">Restock</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
