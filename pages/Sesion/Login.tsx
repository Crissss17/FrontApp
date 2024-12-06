import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { validateTokenWithMS2, refreshAccessToken, logout } from '../../services/authUtils';
import { RootStackParamList } from '../../types/types';
import { BASE_URL } from '../../config';

import FondoApp from '../../assets/Fondo_App.png';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useEffect(() => {
    verificarSesionAlCargar();
  }, []);

  const verificarSesionAlCargar = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (accessToken) {
      const esTokenValido = await validateTokenWithMS2(accessToken);

      if (esTokenValido) {
        autenticarBiometricamente();
        return;
      } else if (refreshToken) {
        try {
          const nuevoAccessToken = await refreshAccessToken(refreshToken);
          if (!nuevoAccessToken) throw new Error('No se pudo refrescar el token.');

          await AsyncStorage.setItem('accessToken', nuevoAccessToken);
          autenticarBiometricamente();
          return;
        } catch (error) {
          console.error('Error renovando el token:', error);
          logout(navigation);
        }
      }
    }
  };

  const autenticarBiometricamente = async () => {
    try {
      const isCompatible = await LocalAuthentication.hasHardwareAsync();
      if (!isCompatible) {
        console.log('Este dispositivo no soporta autenticación biométrica.');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.log('No hay datos biométricos registrados.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken') || undefined;

        if (accessToken) {
          navigation.navigate('HomeLogin', { accessToken, refreshToken });
        }
      } else {
        console.log('Autenticación biométrica fallida.');
      }
    } catch (error) {
      console.error('Error autenticando biométricamente:', error);
      Alert.alert('Error', 'Hubo un problema con la autenticación biométrica.');
    }
  };

  const manejarInicioSesion = async () => {
    if (!email || !pass) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: pass }),
      });

      if (response.ok) {
        const data = await response.json();
        const { accessToken, refreshToken, userId } = data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userId', userId);

        setLoading(false);
        navigation.navigate('HomeLogin', { accessToken, refreshToken });
      } else {
        setLoading(false);
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Credenciales inválidas.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error en el inicio de sesión:', error);
      Alert.alert('Error', 'Hubo un problema al iniciar sesión.');
    }
  };

  return (
    <ImageBackground
      source={FondoApp}
      style={[tw`flex-1 justify-center items-center`, { width: '100%', height: '100%' }]}
      resizeMode="cover"
    >
      <Spinner visible={loading} textContent={'Cargando...'} textStyle={tw`text-white`} />
      <View style={tw`bg-white w-80 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center`}>
        <View style={tw`items-center mb-4`}>
          <Ionicons name="person-circle-outline" size={85} color="gray" />
        </View>
        <Text style={tw`text-center text-3xl font-semibold text-gray-700 mb-4`}>Iniciar Sesión</Text>
        <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2`}>
          <Ionicons name="person-outline" size={20} color="gray" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-base h-12 px-2`}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-base h-12 px-2`}
            placeholder="Contraseña"
            value={pass}
            onChangeText={setPass}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={tw`ml-2`}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={manejarInicioSesion}
          style={tw`bg-black rounded-xl mt-2 py-3 justify-center items-center`}
          disabled={loading}
        >
          <Text style={tw`text-white text-lg font-semibold`}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={tw`mt-2`} onPress={() => navigation.navigate('Register')}>
          <Text style={tw`text-center text-gray-500`}>
            ¿No tienes cuenta?{' '}
            <Text style={{ textDecorationLine: 'underline', color: 'gray' }}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>



        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPass')} 
          style={tw`mt-2`}
        >
          <Text style={tw`text-gray-500 text-center`}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Login;
