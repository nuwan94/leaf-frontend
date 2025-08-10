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
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContinueShopping}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('cart')}</h1>
            </div>

            {/* Empty Cart State */}
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardContent className="pt-12 pb-12 px-8 text-center">
                  <div className="mb-6">
                    <ShoppingBag className="h-20 w-20 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      {t('emptyCart')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('emptyCartDescription')}
                    </p>
                  </div>
                  <Button
                    onClick={handleContinueShopping}
                    className="w-full py-3 text-base font-medium"
                    size="lg"
                  >
                    {t('continueShopping')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TopNavLayout>
    );
  }

  return (
    <TopNavLayout>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContinueShopping}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('back')}
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('cart')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 dark:border-red-800"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? t('clearing') : t('clearCart')}
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-3">
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {t('cartItems')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {cart.items.map((item, index) => (
                      <div key={item.id}>
                        <CartItem item={item} className="border-0 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
                        {index < cart.items.length - 1 && (
                          <div className="h-px bg-gray-200 dark:bg-gray-600 my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                      {t('orderSummary')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatPrice(cart.subtotal || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 dark:text-gray-400">{t('tax')}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatPrice(cart.tax || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 dark:text-gray-400">{t('shipping')}</span>
                        <span className="font-medium">
                          {cart.shipping === 0 ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              {t('freeShipping')}
                            </span>
                          ) : (
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatPrice(cart.shipping || 0)}
                            </span>
                          )}
                        </span>
                      </div>

                      {cart.subtotal > 100 && (
                        <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                          ✓ {t('freeShippingApplied')}
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-200 dark:border-gray-600" />

                    {/* Total */}
                    <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-700/50 px-4 rounded-lg">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t('total')}
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(cart.total || 0)}
                      </span>
                    </div>

                    {/* Checkout Actions */}
                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={handleCheckout}
                        className="w-full py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        size="lg"
                      >
                        {t('proceedToCheckout')}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleContinueShopping}
                        className="w-full py-3 text-base border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        size="lg"
                      >
                        {t('continueShopping')}
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 space-y-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        <span>{t('secureCheckout')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        <span>{t('freeShippingOver', { amount: formatPrice(100) })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        <span>{t('returnPolicy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}
