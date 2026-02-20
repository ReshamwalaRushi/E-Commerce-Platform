import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Order, User } from '@/types';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Download, TrendingUp, Package, Users, ShoppingBag } from 'lucide-react';

type DateRange = 'today' | '7d' | '30d' | '90d' | 'custom';

interface DailyData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

const generateDailyData = (days: number): DailyData[] =>
  Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      revenue: Math.floor(Math.random() * 10000) + 3000,
      orders: Math.floor(Math.random() * 30) + 5,
      customers: Math.floor(Math.random() * 10) + 1,
    };
  });

const BEST_PRODUCTS = [
  { name: 'Wireless Headphones', category: 'Electronics', unitsSold: 145, revenue: 21750 },
  { name: 'Smart Watch', category: 'Electronics', unitsSold: 55, revenue: 16500 },
  { name: 'Running Shoes', category: 'Sports', unitsSold: 98, revenue: 9800 },
  { name: 'Cotton T-Shirt', category: 'Clothing', unitsSold: 210, revenue: 4200 },
  { name: 'Python Book', category: 'Books', unitsSold: 67, revenue: 2010 },
];

const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const getDays = () => {
    if (dateRange === 'today') return 1;
    if (dateRange === '7d') return 7;
    if (dateRange === '30d') return 30;
    if (dateRange === '90d') return 90;
    return 30;
  };

  const days = getDays();
  const [chartData] = useState<DailyData[]>(() => generateDailyData(90));
  const slicedData = chartData.slice(-days);

  const totalRevenue = slicedData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = slicedData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItems = Math.round(totalOrders * 2.5);

  useEffect(() => {
    adminApi.getOrders().then(res => setOrders((res.data.data as Order[]) || [])).catch(() => {});
    adminApi.getUsers().then(res => setUsers((res.data.data as User[]) || [])).catch(() => {});
  }, []);

  const orderStatusData = [
    { status: 'Pending', count: orders.filter(o => o.status === 'pending').length || 10 },
    { status: 'Processing', count: orders.filter(o => o.status === 'processing').length || 15 },
    { status: 'Shipped', count: orders.filter(o => o.status === 'shipped').length || 8 },
    { status: 'Delivered', count: orders.filter(o => o.status === 'delivered').length || 30 },
    { status: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length || 2 },
  ];

  const dateRangeButtons: { label: string; value: DateRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 3 Months', value: '90d' },
    { label: 'Custom', value: 'custom' },
  ];

  const newCustomersCount = slicedData.reduce((s, d) => s + d.customers, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            {dateRangeButtons.map(btn => (
              <Button
                key={btn.value}
                size="sm"
                variant={dateRange === btn.value ? 'default' : 'outline'}
                onClick={() => setDateRange(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-36 h-8 text-xs" />
                <span className="text-muted-foreground text-sm">to</span>
                <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-36 h-8 text-xs" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Avg Order Value', value: formatPrice(avgOrderValue), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Items Sold', value: totalItems, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <Card key={card.label}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{card.label}</p>
                          <p className="text-2xl font-bold mt-1">{card.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bg}`}>
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Trend</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(slicedData as unknown as Record<string, unknown>[], `sales_report_${new Date().toISOString().split('T')[0]}.csv`)}>
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={slicedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(days / 6)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatPrice(Number(v ?? 0))} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-6 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Best Selling Products</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(BEST_PRODUCTS as unknown as Record<string, unknown>[], `products_report_${new Date().toISOString().split('T')[0]}.csv`)}>
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BEST_PRODUCTS.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>{p.unitsSold}</TableCell>
                        <TableCell>{formatPrice(p.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Revenue by Product (Top 5)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={BEST_PRODUCTS.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(v) => formatPrice(Number(v ?? 0))} />
                    <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'New Customers', value: newCustomersCount },
                { label: 'Total Customers', value: users.length || 0 },
                { label: 'Avg Lifetime Value', value: '$250' },
              ].map(card => (
                <Card key={card.label}>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Growth</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(slicedData as unknown as Record<string, unknown>[], `customers_report_${new Date().toISOString().split('T')[0]}.csv`)}>
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={slicedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(days / 6)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                  <p className="text-2xl font-bold mt-1">2.5 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                  <p className="text-2xl font-bold mt-1">3%</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Order Status Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Trends</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(slicedData as unknown as Record<string, unknown>[], `orders_report_${new Date().toISOString().split('T')[0]}.csv`)}>
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={slicedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(days / 6)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
