import { AuthForm } from '@/components/auth-form';
import { AccessibilityControls } from '@/components/accessibility-controls';

const App = () => (
  <div className="bg-muted h-screen flex flex-col overflow-hidden">
    <div className="flex-1">
      <AuthForm />
    </div>
    <AccessibilityControls />
  </div>
);

export default App;
