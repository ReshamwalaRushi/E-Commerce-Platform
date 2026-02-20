import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { Review } from '../models/Review.model';
import { Product } from '../models/Product.model';
import { NotFoundError, ValidationError } from '../utils/apiError.util';

export const createReviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Review title is required'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
];

class ReviewsController {
  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const reviews = await Review.find({ product: id })
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, title, comment } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const existingReview = await Review.findOne({
        product: id,
        user: req.user!.userId,
      });

      if (existingReview) {
        throw new ValidationError('You have already reviewed this product');
      }

      const review = await Review.create({
        product: id,
        user: req.user!.userId,
        rating,
        title,
        comment,
      });

      await review.populate('user', 'firstName lastName');

      // Update product rating
      const allReviews = await Review.find({ product: id });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Product.findByIdAndUpdate(id, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      });

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewsController();
