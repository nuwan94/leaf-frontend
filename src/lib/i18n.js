import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import api from './api';

const appName = 'LEAF';

// Get saved language preference or default to English
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('user-language');
  return savedLanguage || 'en';
};

const fetchMessages = async (lang) => {
  try {
    const response = await api.get('/localization', { params: { lang } });
    if (response.data?.success && response.data?.messages) {
      return response.data.messages;
    }
  } catch (err) {
    // fallback to empty messages
  }
  return {};
};

const initI18n = async () => {
  const lng = getInitialLanguage();
  const messages = await fetchMessages(lng);
  const resources = {
    [lng]: { translation: { appName, ...messages } },
  };
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
};

initI18n();

export default i18n;
