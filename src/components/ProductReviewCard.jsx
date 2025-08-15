import Rating from '@/components/ui/rating';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function ProductReviewCard({ review }) {
  const user = review.user || {};
  const avatarUrl = user.avatar_url || '/default-avatar.png';
  const name = user.name || 'Anonymous';
  // Only use review.comment
  const reviewText = review.comment || '';
  // Defensive: ensure rating is a number or null
  let rating = review.rating;
  if (typeof rating !== 'number') {
    rating = Number(rating);
    if (isNaN(rating)) rating = null;
  }
  return (
    <div className="border rounded-lg p-4 bg-muted/50 w-full min-w-0 flex-grow block">
      <div className="flex items-center gap-3 w-full">
        <Avatar className="w-10 h-10">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>
            {name
              ? name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{name}</span>
          <span className="text-xs text-muted-foreground">{review.timeAgo || ''}</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Rating value={rating} />
          <span className="text-xs text-muted-foreground">{typeof rating === 'number' ? rating.toFixed(1) : ''}</span>
        </div>
      </div>
      <div className="text-sm text-gray-800 dark:text-gray-200 mt-1 w-full">{reviewText}</div>
    </div>
  );
}

export default ProductReviewCard;
