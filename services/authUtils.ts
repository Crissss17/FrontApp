import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { BASE_URL, BASE_2_URL } from '../config';

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible.');
    }

    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {  
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
  try {
    let accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!accessToken) {
      throw new Error('El token de acceso es nulo. Se requiere iniciar sesión nuevamente.');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    console.log("Haciendo solicitud a:", url); // Para verificar la URL
    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && refreshToken) {
      console.log("Token expirado. Intentando refrescar el token...");
      accessToken = await refreshAccessToken(refreshToken);

      if (!accessToken) {
        throw new Error('No se pudo refrescar el token. Se requiere iniciar sesión nuevamente.');
      }

      await AsyncStorage.setItem('accessToken', accessToken); 

      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, { ...options, headers });
    }

    if (!response.ok) {
      console.error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error en makeProtectedRequest:', error);
    throw error;
  }
};


export const makeRequestWithoutAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`Haciendo solicitud a URL: ${url}`);
    
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en la solicitud: ${response.status} - ${response.statusText} - Detalles: ${errorText}`);
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error en makeRequestWithoutAuth:', error);
    throw error;
  }
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
      body: JSON.stringify({ token: accessToken }) 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al validar el token en el microservicio 2');
    }

    const data = await response.json();
    return data.valid; 
  } catch (error) {
    console.error('Error validando el token en el microservicio 2:', error);
    return false;  
  }
};
