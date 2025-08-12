import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductCatalog } from '@/components/ProductCatalog';
import { Calendar, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/lib/currency';

export default function FarmerHome() {
  const { formatPrice } = useCurrency();

  const stats = [
    { title: 'Active Products', value: '24', icon: Package, change: '+3 this week' },
    { title: 'Pending Orders', value: '8', icon: ShoppingBag, change: '2 urgent' },
    {
      title: 'Monthly Revenue',
      value: formatPrice(2847),
      icon: TrendingUp,
      change: '+18% vs last month',
    },
    { title: 'Harvest Schedule', value: '5', icon: Calendar, change: 'items this week' },
  ];

  return (
    <SidebarLayout
      role="farmer"
      title="Farmer Dashboard"
      subtitle="Manage your farm products and track your sales"
    >
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-blue-600">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start">Add New Product</Button>
              <Button variant="outline" className="w-full justify-start">
                Update Inventory
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Sales Report
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Order #1234 - Tomatoes</span>
                <span className="text-sm text-green-600">{formatPrice(45)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Order #1235 - Carrots</span>
                <span className="text-sm text-green-600">{formatPrice(28)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Order #1236 - Lettuce</span>
                <span className="text-sm text-green-600">{formatPrice(15)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
