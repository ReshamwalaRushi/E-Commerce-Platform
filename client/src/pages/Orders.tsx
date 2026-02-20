import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.getOrders();
      return response.data.data || [];
    },
  });

  const filteredOrders = (orders || []).filter((order) =>
    statusFilter ? order.status === statusFilter : true
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={statusFilter ? 'No orders match the selected filter.' : "You haven't placed any orders yet."}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          STATUS_STYLES[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.paymentStatus === 'paid' && (
                        <Badge variant="secondary" className="text-xs">Paid</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order._id ? null : order._id)
                      }
                    >
                      {expandedOrder === order._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Details
                    </Button>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md bg-gray-100"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">Shipping to: </span>
                        {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div>
                          <p className="text-xs">Subtotal</p>
                          <p className="font-medium text-foreground">{formatPrice(order.subtotal)}</p>
                        </div>
                        <div>
                          <p className="text-xs">Tax</p>
                          <p className="font-medium text-foreground">{formatPrice(order.tax)}</p>
                        </div>
                        <div>
                          <p className="text-xs">Shipping</p>
                          <p className="font-medium text-foreground">
                            {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
