import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import InlineReview from '@/components/InlineReview.jsx';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import Rating from '@/components/ui/rating';
import ProductReviewCard from '@/components/ProductReviewCard';
import { reviewService } from '@/lib/services/reviewService';

export function ProductDetailsDialog({ open, onOpenChange, productId, fetchProductDetails }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    fetchProductDetails(productId)
      .then(setProduct)
      .catch(err => setError(err.message || t('error')))
      .finally(() => setLoading(false));
    setReviewsLoading(true);
    reviewService.getProductReviews(productId)
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setReviews(res.data);
        } else if (Array.isArray(res)) {
          setReviews(res);
        } else {
          setReviews([]);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [open, productId, fetchProductDetails, t]);

  // Helpers for fallback image and error handling
  const fallbackImage = import.meta.env.VITE_IMAGE_HOST_BASE_URL + '/uploads/products/default.jpg';
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };
  // No more mock reviews; use actual reviews from backend

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0">
        {product ? (
          <div className="w-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-6 p-6 pb-2 w-full">
              <div className="flex-shrink-0 w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL }/${product.image_url}`}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  onError={handleImgError}
                />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                  <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-semibold text-green-600">{formatPrice(product.discounted_price)}</span>
                  {product.price !== product.discounted_price && (
                    <span className="text-sm line-through text-gray-400">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {t('product.available')}: {product.quantity} {t('product.unit')}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Rating value={product.rating} readOnly />
                  <span className="text-xs text-gray-500">({product.review_count} {t('product.reviews')})</span>
                </div>
              </div>
            </div>
            <div className="w-full border-t border-gray-200 mt-4 pt-4 px-6 pb-6">
              <h3 className="text-lg font-semibold mb-2">{t('product.reviews')}</h3>
              {/* Show InlineReview only for the logged-in user's review, others are not editable */}
              {user && user.role === 'customer' && (() => {
                const myReview = reviews.find(r => r.user_id === user.id);
                return (
                  <>
                    <div className="flex flex-col gap-3 w-full">
                      {reviews.map((review, idx) =>
                        review.user_id === user.id ? (
                          <InlineReview
                            key={review.id || idx}
                            productId={productId}
                            userId={user.id}
                            orderItemId={review.order_item_id}
                            existingReview={review}
                            disabled={reviewsLoading}
                            onReviewSubmitted={() => {
                              reviewService.getProductReviews(productId).then(res => {
                                if (res.success && Array.isArray(res.data)) setReviews(res.data);
                                else if (Array.isArray(res)) setReviews(res);
                              });
                            }}
                          />
                        ) : (
                          <ProductReviewCard key={review.id || idx} review={review} />
                        )
                      )}
                      {/* If user hasn't reviewed yet, show empty InlineReview */}
                      {!myReview && (
                        <InlineReview
                          productId={productId}
                          userId={user.id}
                          orderItemId={undefined}
                          existingReview={null}
                          disabled={reviewsLoading}
                          onReviewSubmitted={() => {
                            reviewService.getProductReviews(productId).then(res => {
                              if (res.success && Array.isArray(res.data)) setReviews(res.data);
                              else if (Array.isArray(res)) setReviews(res);
                            });
                          }}
                        />
                      )}
                    </div>
                  </>
                );
              })()}
              {/* If not logged in or not a customer, show all reviews as read-only */}
              {(!user || user.role !== 'customer') && (
                <div className="flex flex-col gap-3 w-full mt-4">
                  {reviewsLoading ? (
                    <div className="text-sm text-gray-500">{t('loading')}</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-sm text-gray-500">{t('product.noReviews') || 'No reviews yet.'}</div>
                  ) : (
                    reviews.map((review, idx) => (
                      <ProductReviewCard key={review.id || idx} review={review} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[300px]">{loading ? t('loading') : error ? error : null}</div>
        )}
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10"><div className="py-8 text-center">{t('loading')}</div></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10"><div className="py-8 text-center text-destructive">{error}</div></div>}
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
