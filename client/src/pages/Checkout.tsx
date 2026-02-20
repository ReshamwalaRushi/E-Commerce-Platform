import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { usersApi, ordersApi } from '@/lib/api';
import { Address } from '@/types';
import { formatPrice } from '@/lib/utils';
import { CART_CONSTANTS } from '@/lib/utils';

const { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } = CART_CONSTANTS;

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

type Step = 'shipping' | 'review';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [step, setStep] = useState<Step>('shipping');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shipping;

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await usersApi.getProfile();
      return response.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: 'US' },
  });

  const createOrderMutation = useMutation({
    mutationFn: (shippingAddress: Address) => ordersApi.createOrder({ shippingAddress }),
    onSuccess: () => {
      navigate('/orders');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to place order');
    },
  });

  const addresses = profile?.addresses || [];

  const handleShippingSubmit = (data?: AddressFormData) => {
    if (useNewAddress || addresses.length === 0) {
      const values = data || getValues();
      setSelectedAddress(values as Address);
    } else if (!selectedAddress && addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
    setStep('review');
  };

  const handleSelectSavedAddress = (address: Address) => {
    setSelectedAddress(address);
    setUseNewAddress(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;
    createOrderMutation.mutate(selectedAddress);
  };

  if (items.length === 0) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={step === 'shipping' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
          Shipping
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step === 'review' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
          Review & Pay
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

                {addresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium">Saved Addresses</p>
                    {addresses.map((addr, i) => (
                      <div
                        key={addr._id || i}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3 border rounded-md cursor-pointer hover:border-primary transition-colors ${
                          !useNewAddress &&
                          (selectedAddress?._id === addr._id ||
                            (!selectedAddress && i === 0))
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                      >
                        <p className="text-sm">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                        </p>
                        {addr.isDefault && (
                          <span className="text-xs text-primary">Default</span>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setUseNewAddress(!useNewAddress)}
                    >
                      {useNewAddress ? 'Use saved address' : '+ Use a different address'}
                    </button>
                  </div>
                )}

                {(useNewAddress || addresses.length === 0) && (
                  <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Street Address</label>
                      <Input placeholder="123 Main St" {...register('street')} />
                      {errors.street && (
                        <p className="text-sm text-destructive mt-1">{errors.street.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">City</label>
                        <Input placeholder="New York" {...register('city')} />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">State</label>
                        <Input placeholder="NY" {...register('state')} />
                        {errors.state && (
                          <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Zip Code</label>
                        <Input placeholder="10001" {...register('zipCode')} />
                        {errors.zipCode && (
                          <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Country</label>
                        <Input placeholder="US" {...register('country')} />
                        {errors.country && (
                          <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Continue to Review
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}

                {!useNewAddress && addresses.length > 0 && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleShippingSubmit()}
                  >
                    Continue to Review
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'review' && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Review Your Order</h2>

                {selectedAddress && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-1">Delivering to:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}{' '}
                      {selectedAddress.zipCode}, {selectedAddress.country}
                    </p>
                    <button
                      className="text-sm text-primary hover:underline mt-1"
                      onClick={() => setStep('shipping')}
                    >
                      Change
                    </button>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-md bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <Card className="h-fit">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
