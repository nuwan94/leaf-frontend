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
import { authService } from '@/lib/services';
import { Button } from '@/components/ui/button';
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
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
        // Handle signup (keeping existing logic for now)
        const response = await authService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          password: data.password,
        });

        console.log('Registration response:', response); // Debug log

        // Handle registration response (assuming similar structure)
        if (response.success && response.data?.user) {
          const userData = response.data.user;
          const accessToken = response.data.access_token;
          const refreshToken = response.data.refresh_token;

          const roleMap = {
            1: 'admin',
            2: 'customer',
            3: 'farmer',
            4: 'delivery-agent'
          };

          const user = {
            ...userData,
            role: roleMap[userData.role_id] || 'customer',
            token: accessToken,
            refresh_token: refreshToken
          };

          localStorage.setItem('user', JSON.stringify(user));

          // Only redirect on successful registration
          navigate('/');
        } else {
          // If email verification is required, show success message
          alert(t('registrationSuccessful'));
          switchMode('login');
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
