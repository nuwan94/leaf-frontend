import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ProductCard({ product, className, ...props }) {
  // Only show discount if discounted_price and price are valid numbers, price > 0, and discounted_price < price
  const priceNum = Number(product.price);
  const discountedNum = Number(product.discounted_price);
  const hasDiscount =
    (product.is_seasonal_deal || product.is_flash_deal) &&
    product.discounted_price != null &&
    !isNaN(discountedNum) &&
    !isNaN(priceNum) &&
    priceNum > 0 &&
    discountedNum < priceNum;

  function DiscountBadge() {
    if (!hasDiscount) return null;
    const percent = Math.round((100 * (priceNum - discountedNum)) / priceNum);
    return (
      <span className="absolute top-2 right-2 bg-red-600 text-white text-base font-bold px-3 py-1 rounded-lg shadow-lg z-30 drop-shadow-xl animate-bounce group-hover:animate-none">
        -{percent}%
      </span>
    );
  }
  const { addToCart, updateCartItem, removeFromCart, isInCart, getCartItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const cartItem = getCartItem(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }

    setIsAdding(true);
    try {
      // Pass product data to cart for local storage
      await addToCart(product.id, 1, {
        price: product.price,
        name: product.name,
        unit: product.unit,
        amount_per_unit: product.amount_per_unit,
        image_url: product.image_url,
        brand: product.brand,
        farmer_id: product.farmer_id,
        farmer_name: product.farmer_name || ((product.farmer_first_name && product.farmer_last_name) ? `${product.farmer_first_name} ${product.farmer_last_name}` : undefined),
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }

    if (!cartItem) return;

    try {
      await updateCartItem(cartItem.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }

    if (!cartItem) return;

    try {
      await removeFromCart(cartItem.id);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const incrementQuantity = () => {
    if (cartItem) {
      handleUpdateQuantity(cartItem.quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        // Remove item from cart when quantity would become 0
        handleRemoveFromCart();
      } else {
        handleUpdateQuantity(cartItem.quantity - 1);
      }
    }
  };

  const handleLoginRedirect = () => {
    setShowAlert(false);
    navigate('/auth/login');
  };

  return (
    <>
      <Card
        className={cn('overflow-hidden h-fit group gap-1 relative py-0', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Product Image with Discount Badge */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-t-none p-0 m-0">
          {/* Discount badge: top right of image, animated, red bg */}
          <DiscountBadge />
          {product.image_url ? (
            <img
              src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}
        </div>
        <CardContent className="p-3 flex flex-col gap-4">
          {/* Product Info */}
          <div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
                  {product.name}
                </h3>
              </div>
              {product.category && (
                <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                  {product.category.name || t('unknownCategory')}
                </span>
              )}
              {product.brand && (
                <span className="text-xs text-muted-foreground">{product.brand}</span>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-2">
              {hasDiscount ? (
                <>
                  <span className="font-bold text-xl text-green-700 dark:text-green-400">
                    {formatPrice(product.discounted_price)}
                    <span className="text-base text-gray-500 ml-1">
                      /{product.amount_per_unit ? `${product.amount_per_unit} ` : ''}{product.unit || t('perItem')}
                    </span>
                  </span>
                  <span className="line-through text-gray-400 text-lg">
                    {formatPrice(product.price)}
                    <span className="text-base text-gray-400 ml-1">
                      /{product.amount_per_unit ? `${product.amount_per_unit} ` : ''}{product.unit || t('perItem')}
                    </span>
                  </span>
                </>
              ) : (
                <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  {formatPrice(product.price)}
                  <span className="text-base text-gray-500 ml-1">
                    /{product.amount_per_unit ? `${product.amount_per_unit} ` : ''}{product.unit || t('perItem')}
                  </span>
                </span>
              )}
            </div>
          </div>
          {/* Cart Controls - simple, full width, bottom of card */}
          <div>
            {Number(product.quantity_available) > 0 && !inCart && isAuthenticated && (
              <Button onClick={handleAddToCart} disabled={isAdding || isLoading} className="w-full">
                {isAdding ? (
                  t('adding')
                ) : (
                  <>
                    <ShoppingCart className="inline-block mr-2 h-4 w-4" />
                    {t('addToCart')}
                  </>
                )}
              </Button>
            )}
            {inCart && isAuthenticated && (
              <div className="w-full flex items-center justify-between gap-2 mt-2">
                <Button onClick={decrementQuantity} className="w-10">
                  {' '}
                  <Minus className="h-4 w-4" />{' '}
                </Button>
                <span className="text-base font-medium text-center w-10">
                  {cartItem?.quantity || 0}
                </span>
                <Button onClick={incrementQuantity} className="w-10">
                  {' '}
                  <Plus className="h-4 w-4" />{' '}
                </Button>
              </div>
            )}
            {!isAuthenticated && (
              <Button onClick={() => setShowAlert(true)} className="w-full">
                <ShoppingCart className="inline-block mr-2 h-4 w-4" />
                {t('addToCart')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login Required Alert */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('loginRequired')}</AlertDialogTitle>
            <AlertDialogDescription>{t('loginRequiredToAddToCart')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>{t('login')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
