import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import Rating from '@/components/ui/rating';
import ProductReviewCard from '@/components/ProductReviewCard';

export function ProductDetailsDialog({ open, onOpenChange, productId, fetchProductDetails }) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    fetchProductDetails(productId)
      .then(setProduct)
      .catch(err => setError(err.message || t('error')))
      .finally(() => setLoading(false));
  }, [open, productId, fetchProductDetails, t]);

  // Helpers for fallback image and error handling
  const fallbackImage = import.meta.env.VITE_IMAGE_HOST_BASE_URL + '/uploads/products/default.jpg';
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };
  // Mock reviews for demonstration
  const mockReviews = [
    {
      user: { name: 'Nuwan Perera', avatar_url: '/default-avatar.png' },
      timeAgo: '2 days ago',
      rating: 4.5,
      text: 'Very fresh and tasty! Delivery was quick and packaging was great. Will order again.'
    },
    {
      user: { name: 'Ishara Silva', avatar_url: '/default-avatar.png' },
      timeAgo: '1 week ago',
      rating: 5,
      text: 'Absolutely loved the quality. The vegetables were crisp and the price was reasonable.'
    },
    {
      user: { name: 'Kavindu Jayasuriya', avatar_url: '/default-avatar.png' },
      timeAgo: '3 weeks ago',
      rating: 4,
      text: 'Good value for money. Some items were a bit small but overall satisfied.'
    }
  ];

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
              <div className="flex flex-col gap-3 w-full">
                {mockReviews.map((review, idx) => (
                  <ProductReviewCard key={idx} review={review} />
                ))}
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
