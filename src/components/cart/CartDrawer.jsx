import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartIcon } from './CartIcon';
import { CartItem } from './CartItem';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CartDrawer({ children, className, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, isLoading, clearCart, getCartItemCount, getCartTotal } = useCart();
  const { t } = useTranslation();

  const itemCount = getCartItemCount();
  const total = getCartTotal();

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout flow
    console.log('Proceeding to checkout...');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <CartIcon />}
      </DialogTrigger>
      
      <DialogContent className={cn("max-w-md w-full h-[80vh] flex flex-col p-0", className)} {...props}>
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('cart')} ({itemCount} {itemCount === 1 ? t('item') : t('items')})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">{t('loadingCart')}</p>
            </div>
          </div>
        ) : !cart?.items?.length ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">{t('emptyCart')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('emptyCartDescription')}</p>
              <Button onClick={() => setIsOpen(false)} size="sm">
                {t('continueShopping')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="border-t p-4 space-y-3">
              {/* Subtotal, Tax, Shipping */}
              {cart.subtotal && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>${cart.subtotal?.toFixed(2)}</span>
                  </div>
                  {cart.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('tax')}</span>
                      <span>${cart.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  {cart.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('shipping')}</span>
                      <span>${cart.shipping?.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>{t('total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full" 
                  size="lg"
                  disabled={itemCount === 0}
                >
                  {t('proceedToCheckout')}
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                    size="sm"
                  >
                    {t('continueShopping')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleClearCart}
                    disabled={itemCount === 0}
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
