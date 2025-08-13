import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { DarkModeSwitcher } from '@/components/dark-mode-switcher';
import { LangSelector } from '@/components/lang-selector';
import { AuthHeader } from '@/components/auth-header';
import { LoginForm } from '@/components/login-form-component';
import { SignupForm } from '@/components/signup-form-component';
import { AuthBackground } from '@/components/auth-background';
import { useAuth } from '@/lib/hooks/useAuth';
import { authService, farmerService } from '@/lib/services';
import { useNavigate } from 'react-router-dom';

// Validation schemas
const loginSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  password: z.string().min(8, 'passwordTooShort'),
});

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'firstNameRequired'),
    lastName: z.string().min(1, 'lastNameRequired'),
    email: z.string().min(1, 'emailRequired').email('emailInvalid'),
    phone: z.string().min(1, 'phoneRequired'),
    role: z.string().min(1, 'roleRequired'),
    password: z.string().min(8, 'passwordTooShort'),
    confirmPassword: z.string().min(1, 'confirmPasswordRequired'),
    // Farmer-specific fields (conditional)
    farm_name: z.string().optional(),
    farm_size: z.string().optional(),
    farm_address: z.string().optional(),
    farming_experience: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  })
  .refine((data) => {
    // If role is farmer, farm fields are required
    if (data.role === 'farmer') {
      return data.farm_name && data.farm_size && data.farm_address && data.farming_experience;
    }
    return true;
  }, {
    message: 'Farm details are required for farmers',
    path: ['farm_name'],
  });

export function AuthForm({ className, ...props }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Setup forms
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      confirmPassword: '',
    },
  });

  const currentForm = mode === 'login' ? loginForm : signupForm;
  const isLoading = currentForm.formState.isSubmitting;

  const onSubmit = async (data) => {
    try {
      if (mode === 'login') {
        // Use the new login method from useAuth hook
        const user = await login({
          email: data.email,
          password: data.password,
        });

        console.log('Login successful:', user);

        // Only redirect on successful login
        if (user) {
          console.log('Login successful, user logged in:', user);

          // Direct redirect without showing success screen
          navigate('/');
        }
      } else {
        // Handle signup - separate basic user data from farmer-specific data
        const basicUserData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          password: data.password,
        };

        // Register the basic user account first
        const response = await authService.register(basicUserData);

        console.log('Registration response:', response); // Debug log

        // Handle registration response
        if (response.success && response.data) {
          // Registration successful, now login the user to get tokens
          try {
            const user = await login({
              email: data.email,
              password: data.password,
            });

            if (user && data.role === 'farmer') {
              // If user is a farmer, make second API call to save farm details
              try {
                const farmerProfileData = {
                  farm_name: data.farm_name,
                  farm_size: parseFloat(data.farm_size),
                  farm_address: data.farm_address,
                  farming_experience: parseInt(data.farming_experience),
                  bank_name: data.bank_name || null,
                  bank_account_number: data.bank_account_number || null,
                };

                const farmerResponse = await farmerService.createFarmDetails(farmerProfileData);

                if (farmerResponse.success) {
                  console.log('Farmer profile created successfully');
                  // Registration complete for farmer
                  navigate('/');
                } else {
                  // Handle farmer profile creation failure
                  console.error('Failed to create farmer profile:', farmerResponse.message);
                  currentForm.setError('root', {
                    type: 'manual',
                    message: 'Account created but failed to save farm details. Please complete your profile later.'
                  });
                  // Still redirect to allow user to complete profile later
                  setTimeout(() => navigate('/'), 2000);
                }
              } catch (farmerError) {
                console.error('Error creating farmer profile:', farmerError);
                // Account was created but farmer profile failed
                currentForm.setError('root', {
                  type: 'manual',
                  message: 'Account created but failed to save farm details. Please complete your profile later.'
                });
                // Still redirect to allow user to complete profile later
                setTimeout(() => navigate('/'), 2000);
              }
            } else if (user) {
              // For non-farmer users, redirect immediately
              navigate('/');
            } else {
              // Login failed after registration
              currentForm.setError('root', {
                type: 'manual',
                message: 'Account created successfully. Please login to continue.'
              });
              setTimeout(() => switchMode('login'), 2000);
            }
          } catch (loginError) {
            console.error('Login error after registration:', loginError);
            // Registration succeeded but login failed
            currentForm.setError('root', {
              type: 'manual',
              message: 'Account created successfully. Please login to continue.'
            });
            setTimeout(() => switchMode('login'), 2000);
          }
        } else {
          // Registration failed
          currentForm.setError('root', {
            type: 'manual',
            message: response.message || 'Registration failed. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        // For login attempts with invalid credentials
        if (mode === 'login') {
          currentForm.setError('root', {
            type: 'manual',
            message: t('invalidCredentials') || 'Invalid email or password. Please try again.'
          });
        } else {
          currentForm.setError('email', {
            type: 'manual',
            message: 'invalidCredentials'
          });
        }
      } else if (error.response?.status === 409) {
        currentForm.setError('email', {
          type: 'manual',
          message: 'emailAlreadyExists'
        });
      } else if (error.response?.status === 422) {
        // Handle validation errors from server
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          Object.keys(validationErrors).forEach(field => {
            currentForm.setError(field, {
              type: 'manual',
              message: validationErrors[field][0]
            });
          });
        }
      } else {
        // General error handling
        const errorMessage = error.response?.data?.message || error.message || 'authenticationFailed';
        currentForm.setError('root', {
          type: 'manual',
          message: errorMessage
        });
      }

      // Do NOT redirect on error - stay on login page to show errors
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    // Reset forms when switching modes
    loginForm.reset();
    signupForm.reset();
    setShowPassword(false);
  };

  return (
    <div className={cn('h-full flex items-center justify-center p-4', className)} {...props}>
      {/* Header Controls */}
      <div className="fixed top-0 right-0 z-10 p-4 flex gap-2">
        <LangSelector />
        <DarkModeSwitcher />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto">
        <Card className="overflow-hidden p-0 h-[calc(100vh-2rem)]">
          <CardContent className="grid p-0 md:grid-cols-2 h-full">
            {/* Form section with scroll */}
            <div className="h-full overflow-y-auto auth-form-scroll relative">
              <div className="relative z-10 p-6 md:p-8 min-h-full flex flex-col justify-center">
                <div className="flex flex-col gap-6">
                  <AuthHeader mode={mode} />

                  {mode === 'login' ? (
                    <LoginForm
                      form={loginForm}
                      onSubmit={onSubmit}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      isLoading={isLoading}
                      onSwitchToSignup={() => switchMode('signup')}
                    />
                  ) : (
                    <SignupForm
                      form={signupForm}
                      onSubmit={onSubmit}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      isLoading={isLoading}
                      onSwitchToLogin={() => switchMode('login')}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Background image - fixed height */}
            <AuthBackground />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
