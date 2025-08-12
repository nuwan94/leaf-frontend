import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthForm } from '@/components/auth-form';
import { AccessibilityControls } from '@/components/accessibility-controls';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DynamicHome } from '@/components/DynamicHome';
import AdminHome from '@/pages/admin';
import CustomerHome from '@/pages/customer';
import FarmerHome from '@/pages/farmer';
import FarmDetails from '@/pages/farmer/farm-details';
import DeliveryAgentHome from '@/pages/delivery-agent';
import CartPage from '@/pages/cart';
import SearchPage from '@/pages/search';
import Profile from '@/pages/profile';
import { TokenStatus } from '@/components/TokenStatus.jsx';
import { CartProvider } from '@/lib/hooks/useCart.jsx';
import { Toaster } from '@/components/ui/sonner';
import FarmerProducts from '@/pages/farmer/products.jsx';

const App = () => {
  return (
    <CartProvider>
      <div className="bg-muted h-screen flex flex-col">
        <div className="flex-1 min-h-0">
          <TokenStatus />
          <Routes>
            {/* Dynamic root route - shows appropriate dashboard based on user role */}
            <Route path="/" element={<DynamicHome />} />

            {/* Public routes */}
            <Route path="/login" element={<AuthForm />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Protected routes for authenticated users */}
            <Route element={<ProtectedRoute />}>
              {/* Specific role routes (alternative access paths) */}
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/farmer" element={<FarmerHome />} />
              <Route path="/farmer/farm-details" element={<FarmDetails />} />
              <Route path="/farmer/products" element={<FarmerProducts />} />
              <Route path="/delivery-agent" element={<DeliveryAgentHome />} />
              <Route path="/customer" element={<CustomerHome />} />

              {/* Other protected routes */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <AccessibilityControls />
        <Toaster richColors  position="top-right" />
      </div>
    </CartProvider>
  );
};

export default App;
