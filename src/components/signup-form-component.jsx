import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation, Trans } from 'react-i18next';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SignupForm({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  isLoading,
  onSwitchToLogin
}) {
  const { t } = useTranslation();
  const selectedRole = form.watch('role');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-3">
        <Label>{t('role')}</Label>
        <ToggleGroup
          type="single"
          value={form.watch('role')}
          onValueChange={(value) => form.setValue('role', value)}
          className={cn(
            'w-full',
            form.formState.errors.role && 'border border-destructive rounded-md'
          )}
          disabled={isLoading}
        >
          <ToggleGroupItem
            value="customer"
            className="flex items-center justify-center p-3 flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
            variant="outline"
          >
            {t('customerTitle')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="farmer"
            className="flex items-center justify-center p-3 flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
            variant="outline"
          >
            {t('farmerTitle')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="delivery-agent"
            className="flex items-center justify-center p-3 flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
            variant="outline"
          >
            {t('deliveryAgent')}
          </ToggleGroupItem>
        </ToggleGroup>
        {form.formState.errors.role && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.role.message)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-3">
          <Label htmlFor="signup-firstName">{t('firstName')}</Label>
          <Input
            id="signup-firstName"
            {...form.register('firstName')}
            className={cn(form.formState.errors.firstName && 'border-destructive')}
            disabled={isLoading}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">
              {t(form.formState.errors.firstName.message)}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="signup-lastName">{t('lastName')}</Label>
          <Input
            id="signup-lastName"
            {...form.register('lastName')}
            className={cn(form.formState.errors.lastName && 'border-destructive')}
            disabled={isLoading}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">
              {t(form.formState.errors.lastName.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="signup-email">{t('email')}</Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-phone">{t('phone')}</Label>
        <Input
          id="signup-phone"
          type="tel"
          placeholder={t('phonePlaceholder')}
          {...form.register('phone')}
          className={cn(form.formState.errors.phone && 'border-destructive')}
          disabled={isLoading}
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">
            {t(form.formState.errors.phone.message)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-3">
          <Label htmlFor="signup-password">{t('password')}</Label>
          <div className="relative">
            <Input
              id="signup-password"
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
        <div className="grid gap-3">
          <Label htmlFor="signup-confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="signup-confirmPassword"
            type={showPassword ? 'text' : 'password'}
            {...form.register('confirmPassword')}
            className={cn(form.formState.errors.confirmPassword && 'border-destructive')}
            disabled={isLoading}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {t(form.formState.errors.confirmPassword.message)}
            </p>
          )}
        </div>
      </div>

      {/* Farmer-specific fields */}
      {selectedRole === 'farmer' && (
        <>
          {/* Farm Details Section */}
            <h3 className="text-lg font-semibold text-primary mb-2">{t('farmDetails')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="signup-farmName">{t('farmName')} *</Label>
                <Input
                  id="signup-farmName"
                  placeholder={t('farmNamePlaceholder')}
                  {...form.register('farm_name')}
                  className={cn(form.formState.errors.farm_name && 'border-destructive')}
                  disabled={isLoading}
                />
                {form.formState.errors.farm_name && (
                  <p className="text-sm text-destructive">
                    {t(form.formState.errors.farm_name.message)}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="signup-farmSize">{t('farmSize')} *</Label>
                <Input
                  id="signup-farmSize"
                  type="number"
                  step="0.01"
                  placeholder={t('farmSizePlaceholder')}
                  {...form.register('farm_size')}
                  className={cn(form.formState.errors.farm_size && 'border-destructive')}
                  disabled={isLoading}
                />
                {form.formState.errors.farm_size && (
                  <p className="text-sm text-destructive">
                    {t(form.formState.errors.farm_size.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="signup-farmAddress">{t('farmAddress')} *</Label>
              <Textarea
                id="signup-farmAddress"
                placeholder={t('farmAddressPlaceholder')}
                {...form.register('farm_address')}
                className={cn(form.formState.errors.farm_address && 'border-destructive')}
                disabled={isLoading}
                rows={3}
              />
              {form.formState.errors.farm_address && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.farm_address.message)}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="signup-farmingExperience">{t('farmingExperience')} *</Label>
              <Input
                id="signup-farmingExperience"
                type="number"
                placeholder={t('farmingExperiencePlaceholder')}
                {...form.register('farming_experience')}
                className={cn(form.formState.errors.farming_experience && 'border-destructive')}
                disabled={isLoading}
              />
              {form.formState.errors.farming_experience && (
                <p className="text-sm text-destructive">
                  {t(form.formState.errors.farming_experience.message)}
                </p>
              )}
            </div>

          {/* Bank Details Section */}
            <h3 className="text-lg font-semibold text-primary mb-2">{t('bankDetails')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="signup-bankName">{t('bankName')}</Label>
                <Input
                  id="signup-bankName"
                  placeholder={t('bankNamePlaceholder')}
                  {...form.register('bank_name')}
                  className={cn(form.formState.errors.bank_name && 'border-destructive')}
                  disabled={isLoading}
                />
                {form.formState.errors.bank_name && (
                  <p className="text-sm text-destructive">
                    {t(form.formState.errors.bank_name.message)}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="signup-bankAccountNumber">{t('bankAccountNumber')}</Label>
                <Input
                  id="signup-bankAccountNumber"
                  placeholder={t('bankAccountNumberPlaceholder')}
                  {...form.register('bank_account_number')}
                  className={cn(form.formState.errors.bank_account_number && 'border-destructive')}
                  disabled={isLoading}
                />
                {form.formState.errors.bank_account_number && (
                  <p className="text-sm text-destructive">
                    {t(form.formState.errors.bank_account_number.message)}
                  </p>
                )}
              </div>
            </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('creatingAccount')}
          </>
        ) : (
          t('createAccount')
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
        </span>
        <Button
          type="button"
          variant="link"
          className="px-0 h-auto underline underline-offset-4"
          onClick={onSwitchToLogin}
        >
          {t('login')}
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
