import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  onFilterChange: (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => void;
}

export const ProductFilters = ({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  searchQuery,
  onFilterChange,
}: ProductFiltersProps) => {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || '');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleApplyFilters = () => {
    onFilterChange({
      category: selectedCategory,
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
      search: localSearch,
    });
  };

  const handleReset = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSearch('');
    onFilterChange({});
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-5 w-5" />
        <h3 className="font-semibold">Filters</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedCategory || ''}
            onChange={(e) =>
              onFilterChange({
                category: e.target.value || undefined,
                minPrice: localMinPrice ? Number(localMinPrice) : undefined,
                maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
                search: localSearch,
              })
            }
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Price Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};
