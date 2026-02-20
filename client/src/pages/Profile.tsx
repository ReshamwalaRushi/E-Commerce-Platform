import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usersApi } from '@/lib/api';
import { Address } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export const Profile = () => {
  const queryClient = useQueryClient();
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressError, setAddressError] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await usersApi.getProfile();
      return response.data.data;
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: 'US' },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setProfileSuccess('Profile updated successfully');
      setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (err: any) => {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
      setProfileSuccess('');
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: Address) => usersApi.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowAddressForm(false);
      addressForm.reset({ country: 'US' });
      setAddressError('');
    },
    onError: (err: any) => {
      setAddressError(err.response?.data?.message || 'Failed to add address');
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Address }) =>
      usersApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditingAddress(null);
      addressForm.reset({ country: 'US' });
      setAddressError('');
    },
    onError: (err: any) => {
      setAddressError(err.response?.data?.message || 'Failed to update address');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleAddressSubmit = (data: AddressFormData) => {
    if (editingAddress?._id) {
      updateAddressMutation.mutate({ id: editingAddress._id, data: data as Address });
    } else {
      addAddressMutation.mutate(data as Address);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
    addressForm.reset({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    addressForm.reset({ country: 'US' });
    setAddressError('');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
            {profileSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {profileError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <Input {...profileForm.register('firstName')} />
                {profileForm.formState.errors.firstName && (
                  <p className="text-sm text-destructive mt-1">
                    {profileForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input {...profileForm.register('lastName')} />
                {profileForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive mt-1">
                    {profileForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input value={profile?.email || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Saved Addresses</h2>
            {!showAddressForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm(true);
                  addressForm.reset({ country: 'US' });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Address
              </Button>
            )}
          </div>

          {(profile?.addresses || []).length === 0 && !showAddressForm && (
            <div className="flex items-center gap-3 text-muted-foreground py-4">
              <MapPin className="h-5 w-5" />
              <p className="text-sm">No saved addresses</p>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {(profile?.addresses || []).map((address, i) => (
              <div key={address._id || i} className="flex items-start justify-between p-3 border rounded-md">
                <div>
                  <p className="text-sm">
                    {address.street}, {address.city}, {address.state} {address.zipCode},{' '}
                    {address.country}
                  </p>
                  {address.isDefault && (
                    <span className="text-xs text-primary">Default</span>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditAddress(address)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => address._id && deleteAddressMutation.mutate(address._id)}
                    disabled={deleteAddressMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {showAddressForm && (
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">
                {editingAddress ? 'Edit Address' : 'New Address'}
              </h3>
              <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-3">
                {addressError && (
                  <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
                    {addressError}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1 block">Street Address</label>
                  <Input placeholder="123 Main St" {...addressForm.register('street')} />
                  {addressForm.formState.errors.street && (
                    <p className="text-sm text-destructive mt-1">
                      {addressForm.formState.errors.street.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">City</label>
                    <Input placeholder="New York" {...addressForm.register('city')} />
                    {addressForm.formState.errors.city && (
                      <p className="text-sm text-destructive mt-1">
                        {addressForm.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">State</label>
                    <Input placeholder="NY" {...addressForm.register('state')} />
                    {addressForm.formState.errors.state && (
                      <p className="text-sm text-destructive mt-1">
                        {addressForm.formState.errors.state.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Zip Code</label>
                    <Input placeholder="10001" {...addressForm.register('zipCode')} />
                    {addressForm.formState.errors.zipCode && (
                      <p className="text-sm text-destructive mt-1">
                        {addressForm.formState.errors.zipCode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Country</label>
                    <Input placeholder="US" {...addressForm.register('country')} />
                    {addressForm.formState.errors.country && (
                      <p className="text-sm text-destructive mt-1">
                        {addressForm.formState.errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                  >
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleCancelAddress}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
