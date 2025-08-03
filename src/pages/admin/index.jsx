import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Package, ShoppingBag } from 'lucide-react';

export default function AdminHome() {
  const stats = [
    { title: 'Total Users', value: '1,247', icon: Users, change: '+12%' },
    { title: 'Total Products', value: '892', icon: Package, change: '+8%' },
    { title: 'Active Orders', value: '156', icon: ShoppingBag, change: '+23%' },
    { title: 'Revenue', value: '$12,459', icon: BarChart3, change: '+15%' },
  ];

  return (
    <SidebarLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Manage users, products, and system settings"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change} from last month</p>
                </div>
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Add New User</Button>
            <Button variant="outline">View Reports</Button>
            <Button variant="outline">Manage Products</Button>
            <Button variant="outline">System Settings</Button>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
