import api from '@/lib/api';

const metadataService = {
  async getDistricts() {
    try {
      const response = await api.get('/metadata/districts');
      // API returns { success, message, data } - we want response.data.data
      return response?.data?.data || [];
    } catch (error) {
      // fallback static list
      return [
        'Colombo', 'Gampaha', 'Kandy', 'Galle', 'Matara',
        'Kurunegala', 'Jaffna', 'Badulla', 'Anuradhapura', 'Polonnaruwa'
      ];
    }
  },
};

export default metadataService;
