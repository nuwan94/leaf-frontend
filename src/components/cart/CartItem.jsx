import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CartItem({ item, className, ...props }) {
  const { updateCartItem, removeFromCart } = useCart();
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      await updateCartItem(item.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsRemoving(false);
    }
  };

  const incrementQuantity = () => handleQuantityChange(item.quantity + 1);
  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1);
    }
  };

  // Calculate item total
  const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  return (
    <div className={cn("flex gap-3 p-3 border rounded-lg", className)} {...props}>
      {/* Product Image */}
      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
        {item.image_url || item.product?.image ? (
          <img
            src={item.image_url || item.product?.image}
            alt={item.name || item.product?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
            {t('noImage')}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-medium truncate pr-2">
            {item.name || item.product?.name}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            aria-label={t('removeFromCart')}
          >
            {isRemoving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Product metadata */}
        <div className="text-xs text-muted-foreground mb-2">
          {item.brand && (
            <div>{t('by')} {item.brand}</div>
          )}
          {item.unit && (
            <div>{t('per')} {item.unit}</div>
          )}
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            ${parseFloat(item.price).toFixed(2)}
            {item.quantity > 1 && (
              <span className="text-xs text-muted-foreground ml-1">
                × {item.quantity}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={decrementQuantity}
              disabled={isUpdating || item.quantity <= 1}
              className="h-6 w-6 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <div className="w-12 px-1">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1) {
                    handleQuantityChange(value);
                  }
                }}
                disabled={isUpdating}
                className="h-6 text-center text-xs border-0 bg-transparent"
                min="1"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={incrementQuantity}
              disabled={isUpdating}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Item Total */}
        {item.quantity > 1 && (
          <div className="text-right text-sm font-medium mt-1">
            ${itemTotal}
          </div>
        )}
      </div>
    </div>
  );
}
