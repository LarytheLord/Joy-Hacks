import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: Config.API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchVideos = async () => {
  try {
    const response = await api.get('/videos/feed');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch videos');
  }
};

// Add more API functions as needed
export default {
  fetchVideos,
};