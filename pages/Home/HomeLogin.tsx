import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { logout, isTokenExpired } from '../../services/authUtils'; 
import Spinner from 'react-native-loading-spinner-overlay'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import FondoApp from '../../assets/Fondo_App.png';

const HomeLogin: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { accessToken = '', refreshToken = '' } = route.params || {};  
  const [loading, setLoading] = useState(false);  
  const [isTokenChecked, setIsTokenChecked] = useState(false); 

  // Función para verificar periódicamente el estado del token
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      if (storedAccessToken && isTokenExpired(storedAccessToken)) {
        console.log('El token ha expirado. Cerrando sesión.');
        logout(navigation);  
      } else {
        setIsTokenChecked(true); 
      }
    };

    checkTokenExpiration();

    const tokenCheckInterval = setInterval(checkTokenExpiration, 1000); 

    return () => clearInterval(tokenCheckInterval); 
  }, [navigation]);

  const handleNavigate = async (screen: string) => {
    const userId = await AsyncStorage.getItem('userId'); // Retrieve userId from AsyncStorage
    setTimeout(() => {  
      setLoading(false);  
      navigation.navigate(screen, { accessToken, refreshToken, userId }); // Pass userId here
    }, 1000);  
  };

  if (!isTokenChecked) {
    return <Spinner visible={true} textContent={'Verificando token...'} textStyle={tw`text-white`} />; 
  }

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <Spinner visible={loading} textContent={'Cargando...'} textStyle={tw`text-white`} />  
      <ScrollView contentContainerStyle={tw`flex-1 justify-center items-center p-4`}>
        <View style={tw`bg-white p-6 rounded-lg mb-8 w-full max-w-md items-center`}>
          <Ionicons name="home-outline" size={64} color="gray" style={tw`mb-6`} />
          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>Inicio</Text>

          <TouchableOpacity
            onPress={() => handleNavigate('PageToken')}
            style={tw`bg-black rounded-lg py-3 px-6 justify-center items-center w-full mb-4`}>
            <Text style={tw`text-white text-lg font-semibold`}>Ver Información del Usuario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleNavigate('Creater')}
            style={tw`bg-black rounded-lg py-3 px-6 justify-center items-center w-full mb-4`}>
            <Text style={tw`text-white text-lg font-semibold`}>Creador</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate('QuestionnaireList')}
            style={tw`bg-black rounded-lg py-3 px-6 justify-center items-center w-full mb-4`}>
            <Text style={tw`text-white text-lg font-semibold`}>Listado de Cuestionarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate('UserHistoryScreen')}
            style={tw`bg-black rounded-lg py-3 px-6 justify-center items-center w-full mb-4`}>
            <Text style={tw`text-white text-lg font-semibold`}>Historial de Cuestionarios</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => logout(navigation)}
          style={tw`bg-red-500 rounded-lg py-3 px-6 justify-center items-center`}>
          <Text style={tw`text-white text-lg font-semibold`}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default HomeLogin;
