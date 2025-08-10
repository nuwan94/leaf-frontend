import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { getTokenExpiration, getTokenTimeRemaining, isTokenExpired } from '@/lib/token-utils';
import { Clock, RefreshCw, LogOut, CheckCircle, AlertTriangle, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function TokenStatus({ className, ...props }) {
  const { user, logout, refreshToken } = useAuth();
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [tokenExpiration, setTokenExpiration] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.token) {
      setTokenExpiration(getTokenExpiration(user.token));

      // Update time remaining every second
      const interval = setInterval(() => {
        const remaining = getTokenTimeRemaining(user.token);
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user?.token]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshToken();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const expired = isTokenExpired(user.token);
  const nearExpiry = timeRemaining < 300; // Less than 5 minutes

  // Get FAB button variant and styling based on token status
  const getFabVariant = () => {
    if (expired) return 'destructive';
    if (nearExpiry) return 'default';
    return 'outline';
  };

  // Get FAB button additional classes for success state
  const getFabClasses = () => {
    if (expired) return '';
    if (nearExpiry) return 'border-yellow-500 text-yellow-600 hover:bg-yellow-50';
    return 'border-green-500 text-green-600 hover:bg-green-50';
  };

  // Get status icon for FAB
  const getStatusIcon = () => {
    if (expired) return <AlertTriangle className="h-4 w-4" />;
    if (nearExpiry) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className={cn('fixed bottom-4 left-4 z-50', className)} {...props}>
      {/* FAB Button */}
      <Button
        variant={getFabVariant()}
        size="sm"
        className={cn('h-10 w-10 p-0', getFabClasses())}
        aria-label="Token Status"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getStatusIcon()}
      </Button>

      {/* Simple Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Popup Content */}
          <div className="absolute bottom-12 left-0 z-50 w-80 bg-background border rounded-lg shadow-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="font-semibold text-sm">Token Status</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Token Status Indicator */}
            <div className="flex items-center gap-2 mb-3">
              {expired ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : nearExpiry ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  expired ? 'text-destructive' : nearExpiry ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {expired ? 'Token Expired' : nearExpiry ? 'Token Expiring Soon' : 'Token Valid'}
              </span>
            </div>

            {/* Expiration Details */}
            <div className="space-y-2 text-xs mb-3">
              {tokenExpiration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-mono text-right">{tokenExpiration.toLocaleString()}</span>
                </div>
              )}

              {!expired && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time left:</span>
                  <span
                    className={`font-mono ${nearExpiry ? 'text-yellow-600 font-semibold' : ''}`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>

            {/* User Information */}
            <div className="border-t pt-2 mb-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="truncate ml-2">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span>{user.id}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-full h-7 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="w-full h-7 text-xs"
              >
                <LogOut className="h-3 w-3 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
