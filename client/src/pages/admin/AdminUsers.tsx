import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { User } from '@/types';
import { Search, Users, Eye, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editUserSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['customer', 'admin']),
});

type EditUserData = z.infer<typeof editUserSchema>;

interface UserWithDates extends User {
  createdAt?: string;
}

export const AdminUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserWithDates[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithDates | null>(null);
  const [editUser, setEditUser] = useState<UserWithDates | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditUserData>({
    resolver: zodResolver(editUserSchema),
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        role: roleFilter || undefined,
        search: search || undefined,
      });
      setUsers((res.data.data as UserWithDates[]) || []);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEditModal = (user: UserWithDates) => {
    setEditUser(user);
    reset({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
  };

  const onSubmit = async (data: EditUserData) => {
    if (!editUser) return;
    try {
      setSaving(true);
      await adminApi.updateUser(editUser.id, data);
      showToast('User updated successfully', 'success');
      setEditUser(null);
      fetchUsers();
    } catch {
      showToast('User update endpoint not available yet', 'error');
      setEditUser(null);
    } finally {
      setSaving(false);
    }
  };

  const ITEMS_PER_PAGE = 20;
  const filtered = users.filter(u => {
    if (!search) return true;
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
  });
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="sm:w-40">
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
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
              <Users className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                          <Edit className="h-3.5 w-3.5" />
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

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-700">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'default'} className="mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">{selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Addresses</p>
                  <p className="font-medium">{selectedUser.addresses?.length || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">First Name</label>
                <Input {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Last Name</label>
                <Input {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <Input {...register('email')} readOnly className="bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Role</label>
              <Select {...register('role')}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
