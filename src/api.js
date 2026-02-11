import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your server URL
const BASE_URL = 'http://10.0.2.2:3000'; // Android emulator → localhost
// const BASE_URL = 'http://localhost:3000'; // iOS simulator
// const BASE_URL = 'http://YOUR_IP:3000'; // Physical device

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401, try to refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefresh = await AsyncStorage.getItem('refreshToken');
        if (!storedRefresh) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/api/refresh`, {
          refreshToken: storedRefresh,
        });
        const newToken = res.data.accessToken;
        setAccessToken(newToken);

        // Store new refresh token if provided
        if (res.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        await AsyncStorage.removeItem('refreshToken');
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
