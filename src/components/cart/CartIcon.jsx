import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export function CartIcon({ className, showCount = true, ...props }) {
  const { getCartItemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const itemCount = getCartItemCount();
  const [showAlert, setShowAlert] = useState(false);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }
    navigate('/cart');
  };

  const handleLoginRedirect = () => {
    setShowAlert(false);
    navigate('/auth/login');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCartClick}
        className={cn("relative p-2", className)}
        aria-label={`Shopping cart with ${itemCount} items`}
        {...props}
      >
        <ShoppingCart className="h-5 w-5" />
        {showCount && itemCount > 0 && isAuthenticated && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('loginRequired')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('loginRequiredToAccessCart')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              {t('login')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
