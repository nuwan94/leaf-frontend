import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function CartIcon({ className, showCount = true, ...props }) {
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const itemCount = getCartItemCount();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCartClick}
      className={cn("relative p-2", className)}
      aria-label={`Shopping cart with ${itemCount} items`}
      {...props}
    >
      <ShoppingCart className="h-5 w-5" />
      {showCount && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
