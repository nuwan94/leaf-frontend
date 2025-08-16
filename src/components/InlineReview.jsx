
import { useState, useEffect } from 'react';
import { reviewService } from '@/lib/services/reviewService';
import { toast } from 'sonner';

// Pass existingReview if present (for edit)
export default function InlineReview({ productId, userId, orderItemId, existingReview, disabled, onReviewSubmitted }) {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  // Only use 'comment' field
  const [comment, setComment] = useState(existingReview ? (typeof existingReview.comment === 'string' ? existingReview.comment : '') : '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(typeof existingReview.comment === 'string' ? existingReview.comment : '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating.');
      return;
    }
    setSubmitting(true);
    try {
      if (existingReview && existingReview.id) {
        await reviewService.updateReview(existingReview.id, {
          user_id: userId,
          rating,
          comment,
        });
        toast.success('Review updated!');
      } else {
        await reviewService.addProductReview(productId, {
          user_id: userId,
          product_id: productId,
          order_item_id: orderItemId,
          rating,
          comment,
        });
        toast.success('Review submitted!');
      }
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      // Try to show backend error message if available
      let msg = 'Failed to submit review';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(star)}
            disabled={submitting || disabled}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="border rounded p-2 text-sm"
        placeholder="Write a review..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={2}
        disabled={submitting || disabled}
      />
      <button
        type="submit"
        className="bg-primary text-white px-3 py-1 rounded disabled:opacity-60"
        disabled={submitting || disabled}
      >
        {submitting ? (existingReview ? 'Updating...' : 'Submitting...') : (existingReview ? 'Update Review' : 'Submit Review')}
      </button>
    </form>
  );
}
