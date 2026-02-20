import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order, User } from '@/types';
import { Search, Package, Eye, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateOrder, setUpdateOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setOrders((res.data.data as Order[]) || []);
    } catch {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateStatus = async () => {
    if (!updateOrder || !newStatus) return;
    try {
      setUpdating(true);
      await adminApi.updateOrderStatus(updateOrder._id, newStatus, notes);
      showToast('Order status updated', 'success');
      setUpdateOrder(null);
      fetchOrders();
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const ITEMS_PER_PAGE = 20;
  const filtered = orders.filter(o => {
    if (!search) return true;
    const orderUser = o.user as User;
    const name = typeof orderUser === 'object' ? `${orderUser.firstName || ''} ${orderUser.lastName || ''}`.toLowerCase() : '';
    return o.orderNumber.toLowerCase().includes(search.toLowerCase()) || name.includes(search.toLowerCase());
  });
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order # or customer..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="sm:w-48">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(order => {
                  const orderUser = order.user as User;
                  return (
                    <TableRow key={order._id}>
                      <TableCell
                        className="font-mono text-sm cursor-pointer text-blue-600 hover:underline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {typeof orderUser === 'object' ? `${orderUser.firstName} ${orderUser.lastName}` : ''}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setUpdateOrder(order); setNewStatus(order.status); setNotes(''); }}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder.status] || ''}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{selectedOrder.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {typeof selectedOrder.user === 'object'
                      ? `${(selectedOrder.user as User).firstName} ${(selectedOrder.user as User).lastName}`
                      : ''}
                  </p>
                </div>
              </div>
              {selectedOrder.shippingAddress && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Shipping Address</p>
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                    {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t pt-4 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatPrice(selectedOrder.tax)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(selectedOrder.shippingCost)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!updateOrder} onOpenChange={() => setUpdateOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          {updateOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[updateOrder.status] || ''}`}>
                  {updateOrder.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">New Status</label>
                <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOrder(null)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>{updating ? 'Updating...' : 'Update'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
