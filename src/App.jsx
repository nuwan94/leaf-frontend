import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthForm } from '@/components/auth-form';
import { AccessibilityControls } from '@/components/accessibility-controls';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminHome from '@/pages/admin';
import CustomerHome from '@/pages/customer';
import FarmerHome from '@/pages/farmer';
import DeliveryAgentHome from '@/pages/delivery-agent';
import Profile from '@/pages/profile';

const App = () => {
  return (
    <div className="bg-muted h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<CustomerHome />} />
          <Route path="/login" element={<AuthForm />} />

          {/* Protected routes for authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/farmer" element={<FarmerHome />} />
            <Route path="/delivery-agent" element={<DeliveryAgentHome />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <AccessibilityControls />
    </div>
  );
};

export default App;
