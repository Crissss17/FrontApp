import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_2_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: BASE_2_URL,
  timeout: 10000, // Tiempo de espera en milisegundos
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la solicitud:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
