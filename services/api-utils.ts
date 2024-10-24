import AsyncStorage from '@react-native-async-storage/async-storage';

export const makeProtectedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('No se encontró el token de acceso.');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error en la solicitud protegida:', error);
    throw error;
  }
};
