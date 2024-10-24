import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { BASE_URL, BASE_2_URL } from '../config';



export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible.');
    }

    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {  // Aquí también cambiamos BASE_URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Error al refrescar el token');
    }

    const data = await response.json();
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Error refrescando el token:', error);
    throw new Error('La sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }
};

export const makeProtectedRequest = async (url: string, options: RequestInit = {}) => {
  let accessToken = await AsyncStorage.getItem('accessToken');

  if (!accessToken || isTokenExpired(accessToken)) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      throw new Error('No se pudo obtener un nuevo token.');
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error en la solicitud protegida');
  }

  return response;
};

export const logout = async (navigation: any) => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  navigation.navigate('Login');
};

export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000; 
    console.log('Current time:', now);
    console.log('Token expiration time:', decoded.exp);
    return decoded.exp < now;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return true;
  }
};





//------------CONEXIÓN MS-2 -----------------------
export const validateTokenWithMS2 = async (accessToken: string) => {
  try {
    const response = await fetch(`${BASE_2_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: accessToken }) // Asegúrate de enviar el token correctamente
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al validar el token en el microservicio 2');
    }

    const data = await response.json();
    return data.valid;  // Esta parte debe devolver true si el token es válido
  } catch (error) {
    console.error('Error validando el token en el microservicio 2:', error);
    return false;  // Devuelve false si ocurre algún error
  }
};





