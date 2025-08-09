import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/components/cart/CartItem';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import TopNavLayout from '@/components/layouts/TopNavLayout';

export default function CartPage() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { cart, clearCart, isLoading, getCartItemCount } = useCart();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleContinueShopping = () => {
    navigate(-1); // Go back to previous page
  };

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    console.log('Proceeding to checkout with cart:', cart);
    // navigate('/checkout');
  };

  if (!cart || cart.items.length === 0) {
    return (
      <TopNavLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContinueShopping}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back')}
            </Button>
            <h1 className="text-2xl font-bold">{t('cart')}</h1>
          </div>

          {/* Empty Cart State */}
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('emptyCart')}</h2>
              <p className="text-muted-foreground mb-6">{t('emptyCartDescription')}</p>
              <Button onClick={handleContinueShopping} className="w-full">
                {t('continueShopping')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TopNavLayout>
    );
  }

  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContinueShopping}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('cart')}</h1>
              <p className="text-muted-foreground">
                {t('cartItemCount', { count: getCartItemCount() })}
              </p>
            </div>
          </div>

          {/* Clear Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            disabled={isClearing || isLoading}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? t('clearing') : t('clearCart')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {t('cartItems')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(cart.subtotal || 0)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>{t('tax')}</span>
                    <span>{formatPrice(cart.tax || 0)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>{t('shipping')}</span>
                    <span>
                      {cart.shipping === 0 ? (
                        <span className="text-green-600">{t('freeShipping')}</span>
                      ) : (
                        formatPrice(cart.shipping || 0)
                      )}
                    </span>
                  </div>

                  {cart.subtotal > 100 && (
                    <div className="text-xs text-green-600">
                      {t('freeShippingApplied')}
                    </div>
                  )}
                </div>

                <hr />

                {/* Total */}
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('total')}</span>
                  <span>{formatPrice(cart.total || 0)}</span>
                </div>

                {/* Checkout Actions */}
                <div className="space-y-3 pt-4">
                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    {t('proceedToCheckout')}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleContinueShopping}
                    className="w-full"
                  >
                    {t('continueShopping')}
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground pt-4 space-y-1">
                  <p>• {t('secureCheckout')}</p>
                  <p>• {t('freeShippingOver', { amount: formatPrice(100) })}</p>
                  <p>• {t('returnPolicy')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}
