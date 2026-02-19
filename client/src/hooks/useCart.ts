import { useCartStore } from '@/store/cartStore';
import { cartApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCart = () => {
  const { cart, itemsCount, total, setCart } = useCartStore();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return response.data.data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.addToCart(productId, quantity),
    onSuccess: (response) => {
      setCart(response.data.data || null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateCartItem(productId, quantity),
    onSuccess: (response) => {
      setCart(response.data.data || null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: string) => cartApi.removeFromCart(productId),
    onSuccess: (response) => {
      setCart(response.data.data || null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      setCart(null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    cart: cart || cartData,
    itemsCount,
    total,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateCart: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
  };
};
