import { useEffect, useState } from 'react';
import { farmerService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/hooks/useAuth';

export default function FarmerOrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
    const response = await farmerService.getOrders(user?.id);
        setOrders(response.data || response.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  let content;
  if (loading) {
    // Animated skeleton placeholders for loading state
    content = (
      <div className="space-y-8 w-full max-w-3xl p-2">
        {[1,2,3].map(i => (
          <div key={i} className="overflow-hidden shadow-lg border border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-xl animate-pulse">
            <div className="h-10 bg-gradient-to-r from-green-200 to-lime-100 dark:from-green-800 dark:to-lime-700 w-full" />
            <div className="px-6 py-4 flex flex-col gap-4">
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error) {
    content = <div className="text-red-500 text-center py-8">{error}</div>;
  } else if (orders.length === 0) {
    content = <div className="text-gray-500 text-center">No orders found.</div>;
  } else {
    content = (
      <div className="w-full p-2 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <Card
              key={order.id}
              className="h-full w-full flex flex-col overflow-hidden shadow-lg border border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-xl transition hover:shadow-xl text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-500 to-lime-400 dark:from-green-700 dark:to-lime-600">
                <div className="text-white font-bold text-lg tracking-wide">Order #{order.id}</div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}
                  `}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              {/* Body */}
              <div className="px-6 py-4 flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <div>Placed: <span className="font-medium">{order.placed_at || order.created_at}</span></div>
                  <div>Total: <span className="font-bold text-green-600 dark:text-green-400">Rs {order.total_amount || order.total_price}</span></div>
                </div>
                <div className="mt-3">
                  <div className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Items</div>
                  <div className="flex flex-col gap-3">
                    {(order.items || []).map(item => (
                      <div
                        key={item.id || item.product_id}
                        className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 border border-gray-100 dark:border-zinc-700 shadow-sm"
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-14 h-14 object-cover rounded border border-gray-200 dark:border-zinc-700 bg-white"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-gray-900 dark:text-gray-100">{item.product_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Qty: {item.quantity} x Rs {item.unit_price}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Unit: {item.amount_per_unit} {item.unit}</div>
                        </div>
                        <div className="text-sm font-semibold text-right text-green-700 dark:text-green-400 whitespace-nowrap">Rs {item.total_price}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Action Button */}
                {order.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleMarkReady(order.id)}
                    >
                      Ready for Dispatch
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {/* Single upcoming order placeholder */}
          <div className="h-full w-full flex flex-col overflow-hidden shadow-lg border border-dashed border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-xl animate-pulse">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 w-full" />
            <div className="px-6 py-4 flex flex-col gap-4 flex-1">
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-zinc-700 rounded" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  // Handler for marking order as ready for dispatch
  async function handleMarkReady(orderId) {
    // TODO: Implement API call to mark as ready
    // For now, just optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'ready' } : o));
    // You should call your backend here and handle errors
  }
  }

  return (
    <SidebarLayout role="farmer" title={<span>{t('myOrders') || 'My Orders'}</span>} subtitle={t('viewAndManageYourOrders') || 'View and manage your orders'}>
      {content}
    </SidebarLayout>
  );
}
