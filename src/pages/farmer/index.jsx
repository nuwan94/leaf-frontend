import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Boxes, BarChart2, DollarSign, Users } from 'lucide-react';
import AddEditProduct from '@/components/farmer/AddEditProduct';
import { ProductCatalog } from '@/components/ProductCatalog';
import { Calendar, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import { farmerService } from '@/lib/services';

export default function FarmerHome() {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const fetchStats = () => {
    if (user?.id) {
      setLoading(true);
      farmerService.getFarmerStats(user.id)
        .then((response) => {
          if (response.success) {
            setStats(response.data);
          } else {
            setError(response.message || 'Failed to fetch stats');
          }
        })
        .catch((err) => setError(err.message || 'Failed to fetch stats'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const statCards = stats ? [
    { title: 'Total Products', value: stats.total_products, icon: Package, change: '' },
    { title: 'Active Products', value: stats.active_products, icon: TrendingUp, change: '' },
    { title: 'Featured Products', value: stats.featured_products, icon: Calendar, change: '' },
    { title: 'Total Inventory', value: stats.total_inventory, icon: ShoppingBag, change: '' },
  ] : [];

  return (
    <SidebarLayout
      role="farmer"
      title="Farmer Dashboard"
      subtitle="Manage your farm products and track your sales"
    >
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <Card className="p-6 flex items-center justify-center">
              <span>Loading stats...</span>
            </Card>
          ) : error ? (
            <Card className="p-6 flex items-center justify-center">
              <span className="text-red-600">{error}</span>
            </Card>
          ) : (
            statCards.map((stat) => (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    {stat.change && <p className="text-sm text-blue-600">{stat.change}</p>}
                  </div>
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-primary/10 transition"
              onClick={() => setShowAddProduct(true)}
              role="button"
              tabIndex={0}
            >
              <PlusCircle className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Add New Product</span>
            </Card>
            <Card
              className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-primary/10 transition"
              role="button"
              tabIndex={0}
            >
              <Users className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">View Customer Feedback</span>
            </Card>
            
            <Card
              className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-primary/10 transition"
              role="button"
              tabIndex={0}
            >
              <Boxes className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Manage Inventory</span>
            </Card>
            <Card
              className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-primary/10 transition"
              role="button"
              tabIndex={0}
            >
              <BarChart2 className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Sales Report</span>
            </Card>
            <Card
              className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-primary/10 transition"
              role="button"
              tabIndex={0}
            >
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Request Payment</span>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              <p className="text-gray-600">No recent orders found.</p>
            </div>
          </Card>
        </div>

        {/* Add New Product Dialog */}
  <AddEditProduct open={showAddProduct} onOpenChange={setShowAddProduct} onProductAdded={fetchStats} />
      </div>
    </SidebarLayout>
  );
}
