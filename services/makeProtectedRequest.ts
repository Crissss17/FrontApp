import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired, refreshAccessToken } from './authUtils';

export const makeProtectedRequest = async (url: string, options: RequestInit = {}) => {
  let accessToken = await AsyncStorage.getItem('accessToken'); // Debes usar await aquí

  // Verificar si el accessToken está presente
  if (!accessToken) {
    // Si no hay token, intenta refrescarlo directamente
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      throw new Error('No se pudo obtener un nuevo token. Por favor, inicia sesión de nuevo.');
    }
  } else {
    // Si el token está presente, verifica si ha expirado
    if (isTokenExpired(accessToken)) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('No se pudo obtener un nuevo token. Por favor, inicia sesión de nuevo.');
      }
    }
  }

  // Hacer la solicitud con el access token válido
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`, // Usar el token actualizado
    },
  });

  if (!response.ok) {
    throw new Error('Error en la solicitud protegida');
  }

  return response;
};
