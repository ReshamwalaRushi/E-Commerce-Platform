import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  sku: z.string().optional(),
  images: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsApi.getProducts({
        page,
        limit: 20,
        search: search || undefined,
        category: categoryFilter || undefined,
      });
      const data = res.data as { data: Product[]; pagination?: { total: number } };
      setProducts(data.data || []);
      if (data.pagination) {
        setTotalPages(Math.ceil(data.pagination.total / 20));
      }
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, showToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    productsApi.getCategories().then(res => {
      setCategories((res.data.data as string[]) || []);
    }).catch(() => {});
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    reset({ name: '', description: '', price: 0, category: '', stock: 0, sku: '', images: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      images: product.images?.[0] || '',
      isActive: product.isActive,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setSaving(true);
      const payload = {
        ...data,
        images: data.images ? [data.images] : [],
      };
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct._id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await productsApi.createProduct(payload);
        showToast('Product created successfully', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch {
      showToast('Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await productsApi.deleteProduct(product._id);
      showToast('Product deleted successfully', 'success');
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
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
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={product.stock === 0 ? 'text-red-600 font-bold' : product.stock < 10 ? 'text-orange-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(product)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(product)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Product Name *</label>
              <Input {...register('name')} placeholder="Product name" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <Textarea {...register('description')} placeholder="Product description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Price *</label>
                <Input type="number" step="0.01" {...register('price')} placeholder="0.00" />
                {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Stock *</label>
                <Input type="number" {...register('stock')} placeholder="0" />
                {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Category *</label>
                <Select {...register('category')}>
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Home">Home</option>
                </Select>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">SKU</label>
                <Input {...register('sku')} placeholder="SKU-001" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Image URL</label>
              <Input {...register('images')} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4" />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
