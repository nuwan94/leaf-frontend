import { useTranslation } from 'react-i18next';
import Logo from '@/assets/logo.png';

export function AuthHeader({ mode }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center">
      <img src={Logo} alt={t('appName') + ' Logo'} className="h-12 mb-4" />
      <h1 className="text-2xl font-bold">
        {mode === 'login' ? t('welcome') : t('createAccount')}
      </h1>
      <p className="text-muted-foreground text-balance">
        {mode === 'login'
          ? t('loginDesc', { appName: t('appName') })
          : t('signupDesc', { appName: t('appName') })
        }
      </p>
    </div>
  );
}
