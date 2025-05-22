import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    // Skip auth for public endpoints
    // Only add token to protected endpoints
if ((config.url.includes('/auth/') || config.url.includes('/users/') || config.url.includes('/videos/')) && !config.url.includes('/videos/feed')) {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Video API calls
export const uploadVideo = async (formData) => {
  const response = await api.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getVideos = async (page = 1, limit = 10) => {
  const response = await api.get(`/videos/feed?page=${page}&limit=${limit}`);
  return response.data;
};

export const getVideo = async (id) => {
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

export const likeVideo = async (id) => {
  const response = await api.put(`/videos/${id}/like`);
  return response.data;
};

export const deleteVideo = async (id) => {
  const response = await api.delete(`/videos/${id}`);
  return response.data;
};

// User API calls
export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.put(`/users/${userId}/follow`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.put(`/users/${userId}/unfollow`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Error handling
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(error.response.data.message || 'Something went wrong');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message);
  }
};