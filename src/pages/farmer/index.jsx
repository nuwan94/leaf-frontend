import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCatalog } from '@/components/ProductCatalog';
import { Package, ShoppingBag, TrendingUp, Calendar, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/lib/currency';

export default function FarmerHome() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Listen for tab change events from navigation menu
  useEffect(() => {
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('tabChange', handleTabChange);
    return () => window.removeEventListener('tabChange', handleTabChange);
  }, []);

  const stats = [
    { title: 'Active Products', value: '24', icon: Package, change: '+3 this week' },
    { title: 'Pending Orders', value: '8', icon: ShoppingBag, change: '2 urgent' },
    { title: 'Monthly Revenue', value: formatPrice(2847), icon: TrendingUp, change: '+18% vs last month' },
    { title: 'Harvest Schedule', value: '5', icon: Calendar, change: 'items this week' },
  ];

  // Sample products data
  const sampleProducts = [
    { id: 1, name: 'Fresh Tomatoes', price: 45, stock: 120, unit: 'kg', status: 'active' },
    { id: 2, name: 'Organic Carrots', price: 28, stock: 85, unit: 'kg', status: 'active' },
    { id: 3, name: 'Green Lettuce', price: 15, stock: 65, unit: 'piece', status: 'active' },
  ];

  return (
    <SidebarLayout
      role="farmer"
      title="Farmer Dashboard"
      subtitle="Manage your farm products and track your sales"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('dashboard')}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            {t('browseProducts')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
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
                <Button variant="outline" className="w-full justify-start">Update Inventory</Button>
                <Button variant="outline" className="w-full justify-start">View Sales Report</Button>
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
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductCatalog />
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
