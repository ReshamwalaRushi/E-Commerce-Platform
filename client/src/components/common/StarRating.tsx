import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) => {
  const sizeClass = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
            interactive && 'cursor-pointer hover:fill-yellow-300 hover:text-yellow-300 transition-colors'
          )}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
    </div>
  );
};
