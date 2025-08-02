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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Submission error:', error);
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
