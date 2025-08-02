import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import si from './locales/si.json';
import ta from './locales/ta.json';

const appName = 'LEAF';

const resources = {
  en: { translation: { appName, ...en } },
  si: { translation: { appName, ...si } },
  ta: { translation: { appName, ...ta } },
};

// Get saved language preference or default to English
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('user-language');
  return savedLanguage || 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
