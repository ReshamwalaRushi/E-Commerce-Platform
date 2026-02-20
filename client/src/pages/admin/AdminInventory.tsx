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
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { Search, Package, AlertTriangle } from 'lucide-react';

const getStockColor = (stock: number) => {
  if (stock === 0) return 'text-red-600 font-bold';
  if (stock < 10) return 'text-orange-600 font-semibold';
  if (stock < 50) return 'text-yellow-600';
  return 'text-green-600';
};

export const AdminInventory = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updateModal, setUpdateModal] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState('add');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsApi.getProducts({ limit: 200 });
      setProducts((res.data.data as Product[]) || []);
    } catch {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStock = !stockFilter ||
      (stockFilter === 'out' && p.stock === 0) ||
      (stockFilter === 'low' && p.stock > 0 && p.stock < 10) ||
      (stockFilter === 'good' && p.stock >= 10);
    return matchesSearch && matchesStock;
  });

  const ITEMS_PER_PAGE = 20;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const getNewStock = () => {
    if (!updateModal) return 0;
    if (adjustType === 'add') return updateModal.stock + adjustQty;
    if (adjustType === 'remove') return Math.max(0, updateModal.stock - adjustQty);
    return adjustQty;
  };

  const handleUpdateStock = async () => {
    if (!updateModal) return;
    try {
      setSaving(true);
      const newStock = getNewStock();
      await productsApi.updateProduct(updateModal._id, { stock: newStock });
      showToast('Stock updated successfully', 'success');
      setUpdateModal(null);
      fetchProducts();
    } catch {
      showToast('Failed to update stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>

      {lowStockCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-800">Low Stock Alert</p>
                <p className="text-sm text-orange-700">{lowStockCount} products need restocking</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto border-orange-300 text-orange-700"
                onClick={() => { setStockFilter('low'); setPage(1); }}
              >
                View Low Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or SKU..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }} className="sm:w-48">
              <option value="">All Stock</option>
              <option value="out">Out of Stock</option>
              <option value="low">{'Low Stock (<10)'}</option>
              <option value="good">Good Stock (10+)</option>
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
              <p className="text-lg font-medium">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(product => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <span className={`text-lg ${getStockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setUpdateModal(product); setAdjustType('add'); setAdjustQty(0); setAdjustNotes(''); }}
                      >
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

      <Dialog open={!!updateModal} onOpenChange={() => setUpdateModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          {updateModal && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">{updateModal.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{updateModal.sku}</p>
                <p className={`text-4xl font-bold mt-2 ${getStockColor(updateModal.stock)}`}>
                  {updateModal.stock}
                </p>
                <p className="text-xs text-muted-foreground">Current Stock</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Adjustment Type</label>
                <Select value={adjustType} onChange={e => setAdjustType(e.target.value)}>
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                  <option value="set">Set Stock</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm text-center">
                <p className="text-muted-foreground">
                  {adjustType === 'set'
                    ? `Set to ${adjustQty}`
                    : `${updateModal.stock} ${adjustType === 'add' ? '+' : '-'} ${adjustQty}`}{' '}
                  = <span className="font-bold text-foreground">{getNewStock()}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes (optional)</label>
                <Textarea value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateModal(null)}>Cancel</Button>
            <Button onClick={handleUpdateStock} disabled={saving}>{saving ? 'Updating...' : 'Update Stock'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventory;
