import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, Platform, ImageBackground } from 'react-native';
import tw from 'twrnc';
import Spinner from 'react-native-loading-spinner-overlay';
import { isTokenExpired, refreshAccessToken, logout } from '../services/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types'; 
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'react-toastify';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useEffect(() => {
    checkSessionOnLoad();
  }, []);

  const checkSessionOnLoad = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
  
      if (accessToken && !isTokenExpired(accessToken)) {
        console.log('Sesión activa con accessToken válido');
        navigation.navigate('TokenScreen', {
          accessToken: accessToken || '',  // Asegurarse de que nunca sea null
          refreshToken: refreshToken || ''  // Asegurarse de que nunca sea null
        });
      } else if (refreshToken) {
        console.log('El accessToken ha expirado, intentando refrescar token...');
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          console.log('Token refrescado exitosamente');
          navigation.navigate('TokenScreen', {
            accessToken: newAccessToken,
            refreshToken: refreshToken || ''  // Asegurarse de que nunca sea null
          });
        } else {
          logout(navigation);
        }
      } else {
        console.log('Ambos tokens han caducado, redirigiendo a Login');
        logout(navigation);
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
        fetch('https://gonna-crest-martha-render.trycloudflare.com/auth/login', {  // Cambia la URL a la correcta de tu backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)) // Timeout de 10 segundos
      ]);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }
  
      const data = await response.json();
      const { accessToken, refreshToken } = data;
  
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      setLoading(false);
      console.log('Inicio de sesión exitoso. Tokens almacenados.');
  
      checkSessionOnLoad(); // Verifica la sesión
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
    <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
      <Spinner visible={loading} textContent={'Cargando...'} textStyle={tw`text-white`} />
      <View style={tw`bg-white w-80 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center`}>
        <View style={tw`items-center mb-4`}>
          <Ionicons name="person-circle-outline" size={64} color="gray" />
        </View>
        
        <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2`}>
          <Ionicons name="person-outline" size={20} color="gray" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-base`}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-base`}
            placeholder="Contraseña"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
          />
        </View>

        <View style={tw`flex-row justify-between mt-2`}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={tw`text-gray-500`}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPass')}>
            <Text style={tw`text-gray-500`}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={tw`bg-black rounded-xl mt-4 py-3 justify-center items-center`}
          disabled={loading}
        >
          <Text style={tw`text-white text-lg font-semibold`}>{loading ? 'Cargando...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
