
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { orderService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TopNavLayout from '@/components/layouts/TopNavLayout';

export default function OrderHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await orderService.listOrders(user.id);
        if (res.data && res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  return (
    <TopNavLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">{t('orderHistory') || 'Order History'}</h1>
          {orders.length === 0 ? (
            <div className="text-center text-gray-500">{t('noOrdersFound') || 'No orders found.'}</div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold">{t('order')} #{order.id}</span>
                      <span className="ml-4 text-xs text-gray-500">{new Date(order.placed_at).toLocaleString()}</span>
                    </div>
                    <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {t('total') || 'Total'}: <span className="font-bold">Rs. {order.total_amount}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {order.delivery_address}
                  </div>
                  <div className="divide-y divide-gray-200">
                    {order.items.map(item => (
                      <div key={item.id} className="py-2 flex items-center gap-3">
                        {item.image_url && (
                          <img src={import.meta.env.VITE_IMAGE_HOST_BASE_URL + item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} x Rs. {item.unit_price} / {item.amount_per_unit} {item.unit}
                          </div>
                        </div>
                        <div className="font-bold">Rs. {item.total_price}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </TopNavLayout>
  );
}
