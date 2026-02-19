import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/common/Pagination';

export const Products = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
  }>({});

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, filters],
    queryFn: async () => {
      const response = await productsApi.getProducts({
        page,
        ...filters,
      });
      return response.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productsApi.getCategories();
      return response.data.data;
    },
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sort });
    setPage(1);
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters
            categories={categoriesData || []}
            selectedCategory={filters.category}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            searchQuery={filters.search}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {productsData?.pagination?.total || 0} products found
            </p>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.sort || ''}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>

          <ProductGrid
            products={productsData?.data || []}
            isLoading={isLoading}
          />

          {productsData?.pagination && productsData.pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={productsData.pagination.pages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
