import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth-form';
import { AccessibilityControls } from '@/components/accessibility-controls';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminHome from '@/pages/admin';
import CustomerHome from '@/pages/customer';
import FarmerHome from '@/pages/farmer';
import DeliveryAgentHome from '@/pages/delivery-agent';

const App = () => (
  <div className="bg-muted h-screen flex flex-col">
    <div className="flex-1 min-h-0">
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route
          element={<ProtectedRoute />} // Wrap all below in ProtectedRoute
        >
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/farmer" element={<FarmerHome />} />
          <Route path="/delivery-agent" element={<DeliveryAgentHome />} />

          {/* Legacy routes - redirect to new structure */}
          <Route path="/admin-home" element={<Navigate to="/admin" replace />} />
          <Route path="/customer-home" element={<Navigate to="/customer" replace />} />
          <Route path="/farmer-home" element={<Navigate to="/farmer" replace />} />
          <Route path="/delivery-agent-home" element={<Navigate to="/delivery-agent" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
    <AccessibilityControls />
  </div>
);

export default App;
