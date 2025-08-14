import Rating from '@/components/ui/rating';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function ProductReviewCard({ review }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/50 w-full min-w-0 flex-grow block">
      <div className="flex items-center gap-3 w-full">
        <Avatar className="w-10 h-10">
          <AvatarImage src={review.user.avatar_url} alt={review.user.name} />
          <AvatarFallback>
            {review.user.name
              ? review.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{review.user.name}</span>
          <span className="text-xs text-muted-foreground">{review.timeAgo}</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Rating value={review.rating} />
          <span className="text-xs text-muted-foreground">{review.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="text-sm text-gray-800 dark:text-gray-200 mt-1 w-full">{review.text}</div>
    </div>
  );
}

export default ProductReviewCard;
