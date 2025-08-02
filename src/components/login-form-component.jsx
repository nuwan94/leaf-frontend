import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation, Trans } from 'react-i18next';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginForm({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  isLoading,
  onSwitchToSignup
}) {
  const { t } = useTranslation();

  const demoUsers = [
    { email: 'admin@example.com', password: 'admin1234', role: 'admin' },
    { email: 'customer@example.com', password: 'customer1234', role: 'customer' },
    { email: 'farmer@example.com', password: 'farmer1234', role: 'farmer' },
    { email: 'delivery@example.com', password: 'delivery1234', role: 'delivery-agent' },
  ];

  const handleDemoLogin = (user) => {
    // Simulate login by saving user to localStorage and redirecting
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = `/${user.role.replace('delivery-agent', 'delivery-agent-home').replace('admin', 'admin-home').replace('customer', 'customer-home').replace('farmer', 'farmer-home')}`;
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-3">
        <Label htmlFor="login-email">{t('email')}</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="name@example.com"
          {...form.register('email')}
          className={cn(form.formState.errors.email && 'border-destructive')}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.email.message)}
          </p>
        )}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center">
          <Label htmlFor="login-password">{t('password')}</Label>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="ml-auto px-0 h-auto text-sm underline-offset-2 hover:underline"
          >
            {t('forgotPassword')}
          </Button>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            {...form.register('password')}
            className={cn(
              'pr-10',
              form.formState.errors.password && 'border-destructive'
            )}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.password.message)}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('signingIn')}
          </>
        ) : (
          t('login')
        )}
      </Button>

      <div className="flex flex-wrap gap-2 mb-2">
        {demoUsers.map((user) => (
          <Button
            key={user.role}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin(user)}
          >
            Demo {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t('dontHaveAccount')}{' '}
        </span>
        <Button
          type="button"
          variant="link"
          className="px-0 h-auto underline underline-offset-4"
          onClick={onSwitchToSignup}
        >
          {t('signup')}
        </Button>
      </div>

      {/* Terms and Conditions */}
      <div className="text-muted-foreground text-center text-xs text-balance">
        <Trans
          i18nKey="termsText"
          components={{
            termsLink: <a href="#" className="underline underline-offset-4 hover:text-primary" />,
            privacyLink: <a href="#" className="underline underline-offset-4 hover:text-primary" />
          }}
        />
      </div>
    </form>
  );
}
