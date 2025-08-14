import { useAuth } from '@/lib/hooks/useAuth';
import AdminHome from '@/pages/admin';
import CustomerHome from '@/pages/customer';
import FarmerHome from '@/pages/farmer';
import DeliveryAgentHome from '@/pages/delivery-agent';

/**
 * Dynamic home component that renders the appropriate dashboard based on user role
 * If user is not authenticated, shows customer home (public view)
 */
export function DynamicHome() {
  // Get current user and determine which component to render
  const { user } = useAuth();

  // If user is authenticated, render their role-specific dashboard
  if (user && user.role) {
    switch (user.role) {
      case 'admin':
        return <AdminHome />;
      case 'farmer':
        return <FarmerHome />;
      case 'delivery-agent':
        return <DeliveryAgentHome />;
      case 'customer':
      default:
        return <CustomerHome />;
    }
  }

  // If no user or no role, show customer home (public view)
  return <CustomerHome />;
}
