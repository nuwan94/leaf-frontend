import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LangSelector } from '@/components/lang-selector';
import { DarkModeSwitcher } from '@/components/dark-mode-switcher';
import { useAuth } from '@/lib/hooks/useAuth';
import Logo from '@/assets/logo.png';
import {
  BarChart3,
  Home,
  LogOut,
  MapPin,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  UserCheck,
  Users,
  X,
  Tractor,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';

const roleMenus = {
  admin: [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Users', href: '/admin/users', disabled: true },
    { icon: Package, label: 'Products', href: '/admin/products', disabled: true },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders', disabled: true },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', disabled: true },
    { icon: Settings, label: 'Settings', href: '/admin/settings' , disabled: true },
  ],
  farmer: [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Tractor, label: 'Farm Details', href: '/farmer/farm-details' },
    { icon: Package, label: 'My Products', href: '/farmer/products', disabled: true },
    { icon: ShoppingBag, label: 'Orders', href: '/farmer/orders' , disabled: true },
    { icon: BarChart3, label: 'Analytics', href: '/farmer/analytics', disabled: true },
    { icon: Settings, label: 'Profile', href: '/profile' },
  ],
  'delivery-agent': [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Truck, label: 'Deliveries', href: '/delivery-agent/deliveries', disabled: true },
    { icon: MapPin, label: 'Routes', href: '/delivery-agent/routes', disabled: true },
    { icon: UserCheck, label: 'Profile', href: '/profile' },
  ],
};

export function SidebarLayout({ children, role = 'admin', title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const menuItems = roleMenus[role] || roleMenus.admin;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout API fails
      navigate('/login');
    }
  };

  const handleMenuItemClick = (href) => {
    navigate(href);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src={Logo} alt="Leaf" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t('appName')}
              </span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleMenuItemClick(item.href)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-left",
                  location.pathname === item.href
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={item.disabled}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bottom controls */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <LangSelector />
              <DarkModeSwitcher />
            </div>
            <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => setLogoutDialogOpen(true)}
                  className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('logoutConfirmation')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('logoutRedirect')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive"
                    onClick={async () => {
                      await handleLogout();
                      setLogoutDialogOpen(false);
                    }}
                  >
                    {t('logout')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col justify-center">
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">{subtitle}</p>
              )}
            </div>
            <div className="w-10"></div>
            {/* Spacer for balance */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default SidebarLayout;
