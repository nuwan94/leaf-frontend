

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { orderService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Loader2, PackageOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TopNavLayout from '@/components/layouts/TopNavLayout';
import { cn } from '@/lib/utils';


export default function OrderHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await orderService.listOrders(user.id);
        if (res.data && res.data.success) {
          setOrders(res.data.data);
        }
      } catch {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const statusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <TopNavLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {t('orderHistory') || 'Order History'}
          </h1>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <PackageOpen className="w-12 h-12 mb-2 text-gray-300" />
              <div className="font-medium mb-1">{t('noOrdersFound') || 'No orders found.'}</div>
              <div className="text-xs">{t('ordersAppearHere') || 'Your orders will appear here once placed.'}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <Card key={order.id} className="p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold">{t('order')} #{order.id}</span>
                      <span className="ml-4 text-xs text-gray-500">{new Date(order.placed_at).toLocaleString()}</span>
                    </div>
                    <span className={cn('text-xs px-2 py-1 rounded border font-semibold', statusColor(order.status))}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">{t('total') || 'Total'}:</span> Rs. {order.total_amount}
                    </div>
                    <button
                      className="flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none"
                      onClick={() => toggleExpand(order.id)}
                      aria-label={expanded[order.id] ? 'Collapse details' : 'Expand details'}
                    >
                      {expanded[order.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expanded[order.id] ? t('hideDetails') || 'Hide Details' : t('showDetails') || 'Show Details'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {order.delivery_address}
                  </div>
                  {expanded[order.id] && (
                    <div className="divide-y divide-gray-200 mt-2">
                      <div className="font-semibold text-gray-700 mb-2">{t('items') || 'Items'}</div>
                      {order.items.map(item => (
                        <div key={item.id} className="py-2 flex items-center gap-3">
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
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </TopNavLayout>
  );
}
