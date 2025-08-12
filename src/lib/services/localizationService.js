import api from '@/lib/api';

const localizationService = {
  // 1. List all messages for a language
  getMessagesByLanguage: async (lang = 'en') => {
    const response = await api.get('/localization', { params: { lang } });
    return response.data;
  },

  // 3. List all messages (all languages, paginated, ordered by key)
  getAllMessages: async (page = 1, limit = 20, searchQuery = null) => {
    const response = await api.get('/localization/messages', { params: { page, limit, key: searchQuery ? `${searchQuery}%` : undefined } });
    return response.data;
  },

  // 4. Get a single message
  getMessage: async (lang, key) => {
    const response = await api.get('/localization/message', { params: { lang, key } });
    return response.data;
  },

  // 5. Create a message
  createMessage: async ({ lang, key, value }) => {
    const response = await api.post('/localization/message', { lang, key, value });
    return response.data;
  },

  // 6. Update a message
  updateMessage: async ({ lang, key, value }) => {
    const response = await api.put('/localization/message', { lang, key, value });
    return response.data;
  },

  // 7. Delete a message
  deleteMessage: async (lang, key) => {
    const response = await api.delete('/localization/message', { params: { lang, key } });
    return response.data;
  },
};

export default localizationService;
