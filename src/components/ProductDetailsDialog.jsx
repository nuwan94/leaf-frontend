
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import InlineReview from '@/components/InlineReview.jsx';
import { Pencil } from 'lucide-react';
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
  const [ratingSummary, setRatingSummary] = useState({ average_rating: 0, review_count: 0 });

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
    // Fetch rating summary
    reviewService.getProductRatingSummary(productId)
      .then(({ data: summary }) => {
        setRatingSummary(summary && typeof summary === 'object' ? summary : { average_rating: 0, review_count: 0 });
      })
      .catch(() => setRatingSummary({ average_rating: 0, review_count: 0 }));
  }, [open, productId, fetchProductDetails, t]);

  // Helpers for fallback image and error handling
  const fallbackImage = import.meta.env.VITE_IMAGE_HOST_BASE_URL + '/uploads/products/default.jpg';
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };
  // Edit state for user's review
  const [editReviewId, setEditReviewId] = useState(null);

  // Discount logic: only show discounted price if there is a real discount, as in ProductCard
  let hasDiscount = false;
  let priceNum = 0;
  let discountedNum = 0;
  // Prefer localized fields from backend
  const displayName = product?.localized_name || product?.name;
  const displayDescription = product?.localized_description || product?.description;
  if (product) {
    priceNum = Number(product.price);
    discountedNum = Number(product.discounted_price);
    hasDiscount =
      (product.is_seasonal_deal || product.is_flash_deal) &&
      product.discounted_price != null &&
      !isNaN(discountedNum) &&
      !isNaN(priceNum) &&
      priceNum > 0 &&
      discountedNum < priceNum;
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0">
        {product ? (
          <div className="w-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-6 p-6 pb-2 w-full">
              <div className="flex-shrink-0 w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL }/${product.image_url}`}
                  alt={displayName}
                  className="object-cover w-full h-full"
                  onError={handleImgError}
                />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{displayName}</DialogTitle>
                  <DialogDescription>{displayDescription}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-sm line-through text-gray-400 mr-1">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-lg font-semibold text-green-600">
                        {formatPrice(product.discounted_price)} / 1 {product.unit || t('product.unit')}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-green-600">
                      {formatPrice(product.price)} / 1 {product.unit || t('product.unit')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {t('product.available')}: {product.quantity_available} {product.unit || t('product.unit')}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {/* {JSON.stringify(ratingSummary)} */}
                  <Rating value={ratingSummary.average_rating} />
                  <span className="text-xs text-gray-500">{typeof ratingSummary.average_rating === 'number' ? ratingSummary.average_rating.toFixed(2) : '0.00'} / 5</span>
                  <span className="text-xs text-gray-500">({ratingSummary.review_count} {t('product.reviews')})</span>
                </div>
              </div>
            </div>
            <div className="w-full border-t border-gray-200 mt-4 pt-4 px-6 pb-6">
              <h3 className="text-lg font-semibold mb-2">{t('product.reviews')}</h3>
              {/* All reviews for this product, read-only, but show edit icon for logged-in user's review */}
              <div className="flex flex-col gap-3 w-full mt-4">
                {reviewsLoading ? (
                  <div className="text-sm text-gray-500">{t('loading')}</div>
                ) : reviews.length === 0 ? (
                  <div className="text-sm text-gray-500">{t('product.noReviews') || 'No reviews yet.'}</div>
                ) : (
                  reviews.map((review, idx) => {
                    const isMyReview = user && review.user_id === user.id;
                    if (isMyReview && editReviewId === review.id) {
                      // Edit mode for user's review
                      return (
                        <InlineReview
                          key={review.id || idx}
                          productId={productId}
                          userId={user.id}
                          orderItemId={review.order_item_id}
                          existingReview={review}
                          disabled={reviewsLoading}
                          onReviewSubmitted={() => {
                            setEditReviewId(null);
                            reviewService.getProductReviews(productId).then(res => {
                              if (res.success && Array.isArray(res.data)) setReviews(res.data);
                              else if (Array.isArray(res)) setReviews(res);
                            });
                          }}
                          onCancel={() => setEditReviewId(null)}
                        />
                      );
                    }
                    return (
                      <div key={review.id || idx} className="relative group">
                        <ProductReviewCard review={review} />
                        {isMyReview && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 opacity-70 hover:opacity-100 transition-opacity"
                            title={t('edit')}
                            onClick={() => setEditReviewId(review.id)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
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
