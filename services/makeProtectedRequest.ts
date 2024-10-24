import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired, refreshAccessToken } from './authUtils';

export const makeProtectedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('Token de acceso no encontrado.');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    return response.json();  // Procesa la respuesta directamente como JSON
  } catch (error) {
    console.error('Error en la solicitud protegida:', error);
    throw error;
  }
};