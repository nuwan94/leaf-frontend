import { useState, useEffect } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { orderService } from '@/lib/services';
import TopNavLayout from '@/components/layouts/TopNavLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  // Autofill address from user on mount and when user changes
  useEffect(() => {
    if (user?.address) setAddress(user.address);
  }, [user?.address]);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      if (!user?.id) throw new Error('Not logged in');
      if (!address.trim()) throw new Error('Delivery address required');
      if (!cart.items.length) throw new Error('Cart is empty');

      const orderData = {
        customer_id: user.id,
        delivery_address: address,
        district_id: user.district_id || null,
        total_amount: cart.total,
        items: cart.items.map(item => ({
          product_id: item.product_id,
          farmer_id: item.farmer_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          status: 'pending',
        })),
      };
      const res = await orderService.createOrder(orderData);
      if (res.data && res.data.success) {
        clearCart();
        navigate('/customer/orders');
      } else {
        setError(res.data?.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <TopNavLayout>
      {/* Step Indicator */}
      <div className="w-full flex justify-center py-4">
        <ol className="flex items-center w-full max-w-md mx-auto text-sm font-medium text-gray-500 dark:text-gray-400">
          <li className="flex-1 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">1</span>
            <span className="ml-2">Cart</span>
            <span className="flex-1 h-0.5 bg-blue-600 mx-2" />
          </li>
          <li className="flex-1 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">2</span>
            <span className="ml-2">Checkout</span>
          </li>
        </ol>
      </div>
  <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {t('back')}
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('checkout') || 'Checkout'}</h1>
        </div>
        <Card className="p-4 mb-6">
          <div className="mb-4">
            <label className="block mb-1 font-medium">{t('deliveryAddress') || 'Delivery Address'}</label>
            <div className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
              {address || <span className="italic text-gray-400">{t('noAddressOnProfile') || 'No address on profile'}</span>}
            </div>
          </div>
          <div className="mb-4">
            <span className="font-medium">{t('orderSummary') || 'Order Summary'}:</span>
            <ul className="mt-2 space-y-2">
              {cart.items.map(item => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.name} x {item.quantity}</span>
                  <span>Rs. {item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 font-bold text-lg flex justify-between">
              <span>{t('total') || 'Total'}:</span>
              <span>Rs. {cart.total}</span>
            </div>
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <Button onClick={handlePlaceOrder} disabled={placing || !cart.items.length} className="w-full mt-2">
            {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : t('placeOrder') || 'Place Order'}
          </Button>
        </Card>
      </div>
    </TopNavLayout>
  );
}
