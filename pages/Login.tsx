import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, Platform } from 'react-native';
import tw from 'twrnc';
import Spinner from 'react-native-loading-spinner-overlay';
import { isTokenExpired, refreshAccessToken, logout } from '../services/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

let toast: any;
if (Platform.OS === 'web') {
  toast = require('react-toastify').toast;
  require('react-toastify/dist/ReactToastify.css');
}

const Login: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSessionOnLoad();
  }, []);

  const checkSessionOnLoad = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (accessToken && !isTokenExpired(accessToken)) {
        console.log('Sesión activa con accessToken válido');
        navigation.navigate('TokenScreen', { accessToken, refreshToken });
      } else if (refreshToken) {
        console.log('El accessToken ha expirado, intentando refrescar token...');
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          console.log('Token refrescado exitosamente');
          navigation.navigate('TokenScreen', { accessToken: newAccessToken, refreshToken });
        } else {
          logout(navigation);
        }
      }
    } catch (error) {
      console.error('Error en checkSessionOnLoad:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Intentando iniciar sesión con', email);
  
      const response = await Promise.race<Response>([
        fetch('http://localhost:8082/auth/login', {  // <-- Aquí cambia la URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)) // Timeout de 10 segundos
      ]);
  
      // Si la respuesta no es correcta, manejamos el error
      if (!response.ok) {
        const errorData = await response.json();  // Asegúrate de que esta línea está dentro del bloque de error
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }
  
      // Si todo está bien, obtenemos el data
      const data = await response.json();
      const { accessToken, refreshToken } = data;
  
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      setLoading(false);
      console.log('Inicio de sesión exitoso. Tokens almacenados.');
  
      // Verificar si el token es válido y gestionar la sesión
      checkSessionOnLoad();
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error?.message || JSON.stringify(error);
      console.error('Error de autenticación:', errorMessage);
  
      if (Platform.OS === 'web') {
        toast.error(`Hubo un problema con el servidor: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Hubo un problema con el servidor: ${errorMessage}`);
      }
    }
  };
  
  

  const handleSubmit = () => {
    if (email.trim() === '' || pass.trim() === '') {
      Alert.alert('Error', 'Por favor, llena ambos campos');
      return;
    }
    handleLogin(email, pass);
  };

  return (
    <View style={tw`flex-1 bg-[#95D5B2] justify-center items-center`}>
      <Spinner visible={loading} textContent={'Cargando...'} textStyle={tw`text-white`} />

      <View style={tw`bg-[#1B4332] w-80 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center`}>
        <Text style={tw`text-3xl text-white text-center underline font-semibold`}>Login</Text>

        <Text style={tw`text-white`}>Email:</Text>
        <TextInput
          style={tw`rounded-xl border w-full text-base px-3 py-2 bg-white`}
          placeholder="Ingresa tu Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={tw`text-white mt-4`}>Contraseña:</Text>
        <TextInput
          style={tw`rounded-xl border w-full text-base px-3 py-2 bg-white`}
          placeholder="Ingresa tu Contraseña"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPass')}>
          <Text style={tw`text-white mt-2`}>
            Olvidé la contraseña. <Text style={tw`text-[#95D5B2]`}>Recuperar</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          style={tw`bg-green-500 rounded-xl mt-4 text-2xl py-2 justify-center items-center`}
          disabled={loading}
        >
          <Text style={tw`text-white`}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={tw`text-white mt-4`}>
            No tienes cuenta? <Text style={tw`text-[#95D5B2]`}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
