import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductCard({ product, className, ...props }) {
  const { addToCart, updateCartItem, removeFromCart, isInCart, getCartItem, isLoading } = useCart();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cartItem = getCartItem(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = async () => {
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
    if (!cartItem) return;

    try {
      await updateCartItem(cartItem.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveFromCart = async () => {
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

  return (
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
        {!inCart && (product.stock_quantity || product.stock) > 0 && (
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || isLoading}
              className="bg-white/90 hover:bg-white text-black border-0 shadow-lg transition-all duration-200 hover:scale-105 rounded-full"
              size="sm"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Quantity Controls - Bottom Right Corner */}
        {inCart && (product.stock_quantity || product.stock) > 0 && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 bg-white/90 rounded-full p-1 shadow-lg">
              <Button
                onClick={decrementQuantity}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-gray-200 text-black rounded-full"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <div className="flex items-center justify-center min-w-[1.5rem] px-1">
                <span className="text-xs font-medium text-black">
                  {cartItem?.quantity || 0}
                </span>
              </div>

              <Button
                onClick={incrementQuantity}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-gray-200 text-black rounded-full"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {(product.stock_quantity || product.stock) === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
              {t('outOfStock') || 'Out of Stock'}
            </div>
          </div>
        )}

        {/* In Cart Indicator - Top Right Corner */}
        {inCart && (
          <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* Product Name */}
        <h3 className="font-medium text-sm mb-3 line-clamp-2 leading-tight text-gray-800 dark:text-gray-100">
          {product.name}
        </h3>

        {/* Price Only - Localized */}
        <div className="flex items-center justify-center mb-1">
          <span className="font-bold text-primary text-xl tracking-tight">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Out of Stock Warning */}
        {(product.stock_quantity || product.stock) === 0 && (
          <div className="text-xs text-red-500 text-center mt-2 font-medium">
            {t('outOfStock')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
