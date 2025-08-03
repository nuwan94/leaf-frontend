import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function DeliveryAgentHome() {
  const stats = [
    { title: 'Pending Deliveries', value: '12', icon: Truck, change: '3 urgent' },
    { title: 'Completed Today', value: '8', icon: CheckCircle, change: '+2 vs yesterday' },
    { title: 'Active Routes', value: '3', icon: MapPin, change: '2 optimized' },
    { title: 'Avg Delivery Time', value: '28m', icon: Clock, change: '-5m improvement' },
  ];

  const upcomingDeliveries = [
    { id: 'D001', customer: 'John Smith', address: '123 Main St', time: '10:30 AM', status: 'urgent' },
    { id: 'D002', customer: 'Sarah Johnson', address: '456 Oak Ave', time: '11:15 AM', status: 'scheduled' },
    { id: 'D003', customer: 'Mike Wilson', address: '789 Pine Rd', time: '12:00 PM', status: 'scheduled' },
  ];

  return (
    <SidebarLayout
      role="delivery-agent"
      title="Delivery Dashboard"
      subtitle="Manage your delivery routes and track progress"
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
                  <p className="text-sm text-orange-600">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deliveries */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deliveries</h2>
            <div className="space-y-3">
              {upcomingDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{delivery.id}</span>
                      {delivery.status === 'urgent' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Urgent</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{delivery.customer}</p>
                    <p className="text-xs text-gray-500">{delivery.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{delivery.time}</p>
                    <Button size="sm" variant="outline" className="mt-1">
                      Start Route
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start">
                <Truck className="mr-2 h-4 w-4" />
                Start Next Delivery
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                View Route Map
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Delivery Complete
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </div>
          </Card>
        </div>

        {/* Today's Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">95%</p>
              <p className="text-sm text-gray-600">On-time Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
