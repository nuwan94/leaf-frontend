import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/hooks/useAuth';
import { userService } from '@/lib/services/userService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import TopNavLayout from '@/components/layouts/TopNavLayout';
import { User, Lock, Trash2, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import metadataService from '@/lib/services/metadataService';
import { toast } from 'sonner';

// Validation schemas
const profileSchema = z.object({
  first_name: z.string().min(1, 'firstNameRequired'),
  last_name: z.string().min(1, 'lastNameRequired'),
  phone: z.string().regex(/^[\+]?[0-9\-\(\)\s]+$/, 'invalidPhoneFormat').optional().or(z.literal('')),
  address: z.string().optional(),
  district: z.number().min(1, 'districtRequired'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'currentPasswordRequired'),
  new_password: z.string().min(8, 'passwordTooShort'),
}).refine((data) => data.current_password !== data.new_password, {
  message: 'newPasswordMustBeDifferent',
  path: ['new_password'],
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'passwordRequired'),
});

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [districtOptions, setDistrictOptions] = useState([]);

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
      district: '',
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
    },
  });

  // Delete account form
  const deleteForm = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
    },
  });

  // Load profile data and district options on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          setProfileData(response.data);
          profileForm.reset({
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            district: response.data.district_id ? Number(response.data.district_id) : '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        profileForm.setError('root', {
          type: 'manual',
          message: error.response?.data?.message || 'failedToLoadProfile'
        });
      } finally {
        setIsLoading(false);
      }
    };

    const loadDistricts = async () => {
      try {
        // metadataService.getDistricts() returns an array of strings (district names)
        const districts = await metadataService.getDistricts();
        // Convert to [{ value, label }] for Select
        setDistrictOptions(
          Array.isArray(districts)
            ? districts.map((d) => ({ value: d.id, label: d.name }))
            : []
        );
      } catch {
        setDistrictOptions([]);
      }
    };

    loadProfile();
    loadDistricts();
  }, [profileForm]);

  // Handle profile update
  const onUpdateProfile = async (data) => {
    try {
      const updateData = {
        ...data,
        district_id: data.district,
      }
      const response = await userService.updateProfile(updateData);
      if (response.success) {
        setProfileData(response.data);
        profileForm.reset(data);
        // Show success message
        toast.success(t('success'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      profileForm.setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'failedToUpdateProfile'
      });
    }
  };

  // Handle password change
  const onChangePassword = async (data) => {
    try {
      const response = await userService.changePassword(data);
      if (response.success) {
        passwordForm.reset();
        passwordForm.setError('root', {
          type: 'success',
          message: 'passwordChangedSuccessfully'
        });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      passwordForm.setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'failedToChangePassword'
      });
    }
  };

  // Handle account deletion
  const onDeleteAccount = async (data) => {
    try {
      const response = await userService.deleteAccount(data.password);
      if (response.success) {
        await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      deleteForm.setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'failedToDeleteAccount'
      });
    }
  };

  if (!user) {
    return null;
  }

  const Layout = user.role === 'farmer' || user.role === 'delivery-agent' ? SidebarLayout : TopNavLayout;

  return (
    <Layout role={user.role} title={t('profile')}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profile')}</h1>
          <p className="text-muted-foreground mt-2">{t('manageYourAccountSettings')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('personalInfo')}</span>
              <span className="sm:hidden">{t('info')}</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">{t('security')}</span>
              <span className="sm:hidden">{t('security')}</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dangerZone')}</span>
              <span className="sm:hidden">{t('danger')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="profile">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('personalInformation')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('updateYourPersonalDetails')}</p>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('basicInformation')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name" className="text-sm font-medium">
                              {t('firstName')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="first_name"
                              {...profileForm.register('first_name')}
                              className={cn(
                                "transition-colors",
                                profileForm.formState.errors.first_name && 'border-destructive focus-visible:ring-destructive'
                              )}
                            />
                            {profileForm.formState.errors.first_name && (
                              <p className="text-sm text-destructive">
                                {t(profileForm.formState.errors.first_name.message)}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="last_name" className="text-sm font-medium">
                              {t('lastName')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="last_name"
                              {...profileForm.register('last_name')}
                              className={cn(
                                "transition-colors",
                                profileForm.formState.errors.last_name && 'border-destructive focus-visible:ring-destructive'
                              )}
                            />
                            {profileForm.formState.errors.last_name && (
                              <p className="text-sm text-destructive">
                                {t(profileForm.formState.errors.last_name.message)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('contactInformation')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData?.email || ''}
                              disabled
                              className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">
                              {t('emailCannotBeChanged')}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">{t('phone')}</Label>
                            <Input
                              id="phone"
                              {...profileForm.register('phone')}
                              className={cn(
                                "transition-colors",
                                profileForm.formState.errors.phone && 'border-destructive focus-visible:ring-destructive'
                              )}
                            />
                            {profileForm.formState.errors.phone && (
                              <p className="text-sm text-destructive">
                                {t(profileForm.formState.errors.phone.message)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address and District Section (no header, compact district dropdown) */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium">{t('address')}</Label>
                          <Textarea
                            id="address"
                            {...profileForm.register('address')}
                            className="transition-colors min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2 w-48">
                          <Label htmlFor="district" className="text-sm font-medium">{t('district')}</Label>
                          <Combobox
                            options={districtOptions}
                            value={profileForm.watch('district')}
                            labelKey="label"
                            valueKey="value"
                            onChange={val => profileForm.setValue('district', Number(val), { shouldValidate: true })}
                            buttonClassName={cn('w-full', 'h-9 text-sm', profileForm.formState.errors.district && 'border-destructive focus-visible:ring-destructive')}
                            contentClassName="w-48"
                            disabled={districtOptions.length === 0}
                          />
                          {profileForm.formState.errors.district && (
                            <p className="text-sm text-destructive">
                              {t(profileForm.formState.errors.district.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Error/Success Messages */}
                      {profileForm.formState.errors.root && (
                        <div className={cn(
                          "p-4 text-sm rounded-lg border",
                          profileForm.formState.errors.root.type === 'success'
                            ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}>
                          {t(profileForm.formState.errors.root.message)}
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          type="submit"
                          disabled={profileForm.formState.isSubmitting}
                          className="flex items-center gap-2 min-w-[120px]"
                        >
                          {profileForm.formState.isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {t('save')}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="password">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('changePassword')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('updateYourPasswordToKeepAccountSecure')}</p>
                  </div>

                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password" className="text-sm font-medium">
                          {t('currentPassword')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="current_password"
                          type="password"
                          {...passwordForm.register('current_password')}
                          className={cn(
                            "transition-colors",
                            passwordForm.formState.errors.current_password && 'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                        {passwordForm.formState.errors.current_password && (
                          <p className="text-sm text-destructive">
                            {t(passwordForm.formState.errors.current_password.message)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password" className="text-sm font-medium">
                          {t('newPassword')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="new_password"
                          type="password"
                          {...passwordForm.register('new_password')}
                          className={cn(
                            "transition-colors",
                            passwordForm.formState.errors.new_password && 'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                        {passwordForm.formState.errors.new_password && (
                          <p className="text-sm text-destructive">
                            {t(passwordForm.formState.errors.new_password.message)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('passwordMustBeAtLeast8Characters')}
                        </p>
                      </div>
                    </div>

                    {/* Error/Success Messages */}
                    {passwordForm.formState.errors.root && (
                      <div className={cn(
                        "p-4 text-sm rounded-lg border",
                        passwordForm.formState.errors.root.type === 'success'
                          ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      )}>
                        {t(passwordForm.formState.errors.root.message)}
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        disabled={passwordForm.formState.isSubmitting}
                        className="flex items-center gap-2 min-w-[140px]"
                      >
                        {passwordForm.formState.isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                        {t('changePassword')}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-destructive shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-b border-destructive/20 pb-4">
                    <h2 className="text-xl font-semibold text-destructive">{t('dangerZone')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('irreversibleActions')}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
                      <h3 className="font-semibold text-destructive mb-2">{t('deleteAccount')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('deleteAccountWarning')}
                      </p>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            {t('deleteMyAccount')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive">{t('confirmAccountDeletion')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              {t('accountDeletionConfirmationMessage')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <form onSubmit={deleteForm.handleSubmit(onDeleteAccount)}>
                            <div className="my-4 space-y-2">
                              <Label htmlFor="delete_password" className="text-sm font-medium">
                                {t('confirmPassword')} <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="delete_password"
                                type="password"
                                {...deleteForm.register('password')}
                                className={cn(
                                  "transition-colors",
                                  deleteForm.formState.errors.password && 'border-destructive focus-visible:ring-destructive'
                                )}
                              />
                              {deleteForm.formState.errors.password && (
                                <p className="text-sm text-destructive">
                                  {t(deleteForm.formState.errors.password.message)}
                                </p>
                              )}
                            </div>

                            {deleteForm.formState.errors.root && (
                              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md mb-4">
                                {t(deleteForm.formState.errors.root.message)}
                              </div>
                            )}

                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="m-0">{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                type="submit"
                                disabled={deleteForm.formState.isSubmitting}
                                className="bg-destructive hover:bg-destructive/90 m-0"
                              >
                                {deleteForm.formState.isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                {t('deleteAccount')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Quick Logout */}
                    <div className="p-6 border rounded-lg bg-muted/20">
                      <h3 className="font-semibold mb-2">{t('quickLogout')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('logoutFromAllDevices')}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout();
                          window.location.href = '/login';
                        }}
                        className="flex items-center gap-2"
                      >
                        {t('logout')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
