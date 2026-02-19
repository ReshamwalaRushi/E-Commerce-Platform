import { Product, IProduct } from '../models/Product.model';
import { NotFoundError } from '../utils/apiError.util';
import { CONSTANTS } from '../config/constants';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

class ProductsService {
  async getProducts(
    filters: ProductFilters = {},
    options: ProductQueryOptions = {}
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const query: any = { isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    const page = options.page || 1;
    const limit = Math.min(
      options.limit || CONSTANTS.DEFAULT_PAGE_SIZE,
      CONSTANTS.MAX_PAGE_SIZE
    );
    const skip = (page - 1) * limit;

    let sortOption: any = { createdAt: -1 };
    if (options.sort) {
      switch (options.sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
      }
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id);
    
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await Product.findOne({ slug, isActive: true });
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async getCategories(): Promise<string[]> {
    const categories = await Product.distinct('category', { isActive: true });
    return categories;
  }

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.create(data);
    return product;
  }

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
  }
}

export default new ProductsService();
