import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/common/StarRating';
import { ProductGrid } from '@/components/products/ProductGrid';
import { productsApi, reviewsApi } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/utils';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsApi.getProductById(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await reviewsApi.getReviews(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: async () => {
      const response = await productsApi.getProducts({ category: product?.category, limit: 4 });
      return (response.data.data || []).filter((p) => p._id !== product?._id).slice(0, 4);
    },
    enabled: !!product?.category,
  });

  const submitReviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.createReview(id!, { rating: reviewRating, title: reviewTitle, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      setReviewError('');
    },
    onError: (err: any) => {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ productId: product._id, quantity });
    navigate('/cart');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitReviewMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/products">
          <Button className="mt-4">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/placeholder.png'];

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
        <Link to="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:underline">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white"
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white"
                  onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{product.brand} · {product.category}</p>

          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <Badge variant="destructive">
                -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          {product.stock > 0 ? (
            <Badge variant="secondary" className="mb-4">In Stock ({product.stock} available)</Badge>
          ) : (
            <Badge variant="destructive" className="mb-4">Out of Stock</Badge>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4 mb-8">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {typeof review.user === 'object'
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : 'Customer'}
                      </p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="font-medium mb-1">{review.title}</p>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">No reviews yet. Be the first to review this product!</p>
        )}

        {isAuthenticated && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewError && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                    {reviewError}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <StarRating
                    rating={reviewRating}
                    size="lg"
                    interactive
                    onRate={setReviewRating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Summarize your review"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Review</label>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" disabled={submitReviewMutation.isPending}>
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={relatedProducts} isLoading={false} />
        </div>
      )}
    </div>
  );
};
