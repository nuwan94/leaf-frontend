import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
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
        image_url: product.image_url,
        brand: product.brand
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
        className={cn("overflow-hidden h-fit group", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Product Image with Floating Controls */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}

          {/* Add to Cart Button - Bottom Right Corner */}
          {(!inCart || !isAuthenticated) && Number(product.quantity_available) > 0 && (
            <div className="absolute bottom-2 right-2">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || isLoading}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-full shadow-lg transition-all duration-200",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                  isHovered && "opacity-100 translate-y-0"
                )}
              >
                {isAdding ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Quantity Controls - Bottom Right Corner (when in cart and authenticated) */}
          {inCart && isAuthenticated && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-full p-1 shadow-lg">
              <Button
                onClick={decrementQuantity}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 rounded-full hover:bg-muted"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[1.5rem] text-center">
                {cartItem?.quantity || 0}
              </span>
              <Button
                onClick={incrementQuantity}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 rounded-full hover:bg-muted"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-3 space-y-2">
          <div>
            <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {product.brand && `${product.brand} • `}
              {product.unit || 'per item'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-semibold text-sm">
                {formatPrice(product.price)}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="text-right">
              {product.quantity_available > 0 ? (
                <div className="flex items-center gap-1">
                  {inCart && isAuthenticated ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="h-3 w-3" />
                      <span>{t('inCart')}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600">
                      {t('inStock')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-red-600">{t('outOfStock')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Required Alert */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('loginRequired')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('loginRequiredToAddToCart')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              {t('login')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
