import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { BASE_URL, BASE_2_URL } from '../config';

// Verificar si un token está por expirar (con buffer de tiempo)
export const isTokenAboutToExpire = (token: string): boolean => {
  if (!token) return true;

  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // Fecha actual en segundos
    const timeLeft = decoded.exp - now;

    console.log(`Tiempo restante del token: ${timeLeft} segundos`);
    return timeLeft < 60; // Está por expirar si faltan menos de 1 minuto
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return true; // Consideramos el token como inválido si hay errores
  }
};



// Renovar el token de acceso usando el refresh token
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
    throw new Error('No se pudo renovar el token. Es posible que la sesión haya expirado.');
  }
};


// Hacer solicitudes protegidas con tokens
export const makeProtectedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    let accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!accessToken) {
      throw new Error('El token de acceso es nulo. Se requiere iniciar sesión nuevamente.');
    }

    if (isTokenAboutToExpire(accessToken)) {
      console.log('El token está por expirar. Intentando renovar...');
      try {
        const refreshedToken = await refreshAccessToken(refreshToken || '');
        if (!refreshedToken) {
          throw new Error('No se pudo refrescar el token.');
        }
        accessToken = refreshedToken;
      } catch (error) {
        console.error('Error renovando el token:', error);
        throw new Error('No se pudo renovar el token de acceso. Por favor, inicia sesión nuevamente.');
      }
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    return response;
  } catch (error:any) {
    console.error('Error en makeProtectedRequest:', error.message);
    throw error;
  }
};



// Validar token en MS-2
export const validateTokenWithMS2 = async (accessToken: string) => {
  try {
    const response = await fetch(`${BASE_2_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: accessToken }),
    });

    if (!response.ok) {
      throw new Error('Error al validar el token en el microservicio 2');
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('Error validando el token en el microservicio 2:', error);
    return false;
  }
};

// Cerrar sesión
export const logout = async (navigation: any) => {
  await AsyncStorage.clear();
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
