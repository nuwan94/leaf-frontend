import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, User, Phone, Mail, Calendar, Building2, Loader2, Save } from 'lucide-react';
import { farmerService } from '@/lib/services';

// Profile form validation schema
const profileSchema = z.object({
  farm_name: z.string().min(2, 'Farm name must be at least 2 characters'),
  farm_address: z.string().min(10, 'Farm address must be at least 10 characters'),
  farm_size: z.string().min(1, 'Farm size is required'),
  farming_experience: z.string().min(1, 'Farming experience is required'),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
});

export default function FarmDetails() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Load farmer profile on component mount
  useEffect(() => {
    const loadFarmerProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await farmerService.getProfile();

        if (response.success && response.data) {
          setProfileData(response.data);
          // Populate form with existing data
          Object.keys(response.data).forEach(key => {
            if (response.data[key] !== null && response.data[key] !== undefined) {
              setValue(key, response.data[key].toString());
            }
          });
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        console.error('Error loading farmer profile:', err);
        setError(err.message || 'Failed to load farmer profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadFarmerProfile();
  }, [setValue]);

  const onSubmitProfile = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert string values to appropriate types
      const profileUpdateData = {
        ...data,
        farm_size: parseFloat(data.farm_size),
        farming_experience: parseInt(data.farming_experience),
      };

      const response = await farmerService.updateProfile(profileUpdateData);

      if (response.success) {
        toast.success('Profile updated successfully!');
        // Refresh profile data
        const updatedResponse = await farmerService.getProfile();
        if (updatedResponse.success && updatedResponse.data) {
          setProfileData(updatedResponse.data);
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout
        role="farmer"
        title="Farm Details"
        subtitle="Loading farm information..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </SidebarLayout>
    );
  }

  if (error && !profileData) {
    return (
      <SidebarLayout
        role="farmer"
        title="Farm Details"
        subtitle="Error loading farm information"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SidebarLayout
      role="farmer"
      title="Farm Profile"
      subtitle="Manage your farm profile information"
    >
      <div className="h-full overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Farm Profile
              </h1>
            </div>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Single Editable Profile Form */}
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
            {/* Farm Information */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Farm Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farm_name" className="text-sm font-medium">Farm Name *</Label>
                  <Input
                    id="farm_name"
                    {...register('farm_name')}
                    placeholder="Green Valley Farm"
                    className={`${errors.farm_name ? 'border-red-500' : ''}`}
                  />
                  {errors.farm_name && (
                    <p className="text-xs text-red-500">{errors.farm_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farm_size" className="text-sm font-medium">Farm Size (acres) *</Label>
                  <Input
                    id="farm_size"
                    type="number"
                    step="0.01"
                    {...register('farm_size')}
                    placeholder="5.5"
                    className={`${errors.farm_size ? 'border-red-500' : ''}`}
                  />
                  {errors.farm_size && (
                    <p className="text-xs text-red-500">{errors.farm_size.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farming_experience" className="text-sm font-medium">Experience (years) *</Label>
                  <Input
                    id="farming_experience"
                    type="number"
                    {...register('farming_experience')}
                    placeholder="10"
                    className={`${errors.farming_experience ? 'border-red-500' : ''}`}
                  />
                  {errors.farming_experience && (
                    <p className="text-xs text-red-500">{errors.farming_experience.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <Label htmlFor="farm_address" className="text-sm font-medium">Farm Address *</Label>
                  <Textarea
                    id="farm_address"
                    {...register('farm_address')}
                    placeholder="Complete farm address with district and postal code"
                    className={`${errors.farm_address ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                  {errors.farm_address && (
                    <p className="text-xs text-red-500">{errors.farm_address.message}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Banking & Status Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Banking Information */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Banking Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name" className="text-sm font-medium">Bank Name</Label>
                    <Input
                      id="bank_name"
                      {...register('bank_name')}
                      placeholder="Bank of Ceylon"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number" className="text-sm font-medium">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      {...register('bank_account_number')}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              </Card>

              {/* Status Information (Read-only) */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Account Status
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profileData?.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData?.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Created</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(profileData?.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(profileData?.updated_at)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
