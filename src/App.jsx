import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth-form';
import { AccessibilityControls } from '@/components/accessibility-controls';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminHome from './pages/admin-home';
import CustomerHome from './pages/customer-home';
import FarmerHome from './pages/farmer-home';
import DeliveryAgentHome from './pages/delivery-agent-home';

const App = () => (
  <div className="bg-muted h-screen flex flex-col overflow-hidden">
    <div className="flex-1">
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route
          element={<ProtectedRoute />} // Wrap all below in ProtectedRoute
        >
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/customer-home" element={<CustomerHome />} />
          <Route path="/farmer-home" element={<FarmerHome />} />
          <Route path="/delivery-agent-home" element={<DeliveryAgentHome />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
    <AccessibilityControls />
  </div>
);

export default App;
