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
    console.warn(`Failed to fetch messages for language: ${lang}`, err);
  }
  return {};
};

// Function to load language resources dynamically
const loadLanguageResources = async (lng) => {
  const messages = await fetchMessages(lng);
  const resources = { translation: { appName, ...messages } };

  // Add or update the language resources
  i18n.addResourceBundle(lng, 'translation', resources.translation, true, true);
  return resources;
};

// Function to change language and fetch new messages
export const changeLanguageWithFetch = async (lng) => {
  try {
    // Save the language preference
    localStorage.setItem('user-language', lng);

    // Load resources for the new language
    await loadLanguageResources(lng);

    // Change the language
    await i18n.changeLanguage(lng);

    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
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
      // Enable debug mode in development
      // debug: process.env.NODE_ENV === 'development',
    });

  // Listen for language changes and fetch new messages
  i18n.on('languageChanged', async (lng) => {
    // Only fetch if we don't already have resources for this language
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      await loadLanguageResources(lng);
    }
  });
};

initI18n();

export default i18n;
