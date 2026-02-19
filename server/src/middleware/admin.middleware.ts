import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/apiError.util';
import { USER_ROLES } from '../config/constants';

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};
