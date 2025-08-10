import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import { Minus, Plus, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CartItem({ item, className, ...props }) {
  const { updateCartItem, removeFromCart } = useCart();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      await updateCartItem(item.id, newQuantity);
    } catch (error) {
      console.error(t('failedToUpdateQuantity'), error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item.id);
    } catch (error) {
      console.error(t('failedToRemoveItem'), error);
      setIsRemoving(false);
    }
  };

  const decrementQuantity = async () => {
    if (item.quantity > 1) {
      await handleQuantityChange(item.quantity - 1);
    }
  };

  const incrementQuantity = async () => {
    await handleQuantityChange(item.quantity + 1);
  };

  const itemTotal = parseFloat(item.price) * item.quantity;

  return (
    <div className={cn("flex gap-4 p-4 rounded-lg transition-all duration-200", className)} {...props}>
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
        {item.image_url || item.product?.image ? (
          <img
            src={item.image_url || item.product?.image}
            alt={item.name || item.product?.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs font-medium">
            {t('noImage')}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header with name and remove button */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {item.name || item.product?.name}
            </h4>
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-full flex-shrink-0 transition-colors"
            title={t('removeFromCart')}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Price and quantity controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(itemTotal)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatPrice(parseFloat(item.price))} {t('each')}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              disabled={isUpdating || item.quantity <= 1}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <div className="min-w-[3rem] text-center">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                disabled={isUpdating}
                className="h-8 w-12 text-center border-0 bg-transparent text-sm font-medium focus:ring-0 focus:outline-none p-0"
                min="1"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              disabled={isUpdating}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Loading state overlay */}
        {isUpdating && (
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('updating')}
          </div>
        )}
      </div>
    </div>
  );
}
