import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { logout, isTokenExpired } from '../../services/authUtils'; // Asegúrate de importar isTokenExpired
import Spinner from 'react-native-loading-spinner-overlay'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para manejar los tokens

const FondoApp = require('../../assets/Fondo_App.png');

const HomeLogin: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { accessToken = '', refreshToken = '' } = route.params || {};  
  const [loading, setLoading] = useState(false);  
  const [isTokenChecked, setIsTokenChecked] = useState(false); // Para verificar si ya se revisó el token

  // Función para verificar periódicamente el estado del token
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      if (storedAccessToken && isTokenExpired(storedAccessToken)) {
        console.log('El token ha expirado. Cerrando sesión.');
        logout(navigation);  // Cierra la sesión si el token ha expirado
      } else {
        setIsTokenChecked(true);  // Token revisado, no ha expirado
      }
    };

    // Ejecuta la función una vez al montar el componente
    checkTokenExpiration();

    const tokenCheckInterval = setInterval(checkTokenExpiration, 1000); // Verifica cada segundo

    return () => clearInterval(tokenCheckInterval); // Limpia el intervalo al desmontar el componente
  }, [navigation]);

  const handleNavigate = (screen: string) => {
    setLoading(true);  
    setTimeout(() => {  
      setLoading(false);  
      navigation.navigate(screen, { accessToken, refreshToken });
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
            <Text style={tw`text-white text-lg font-semibold`}>Ver Token</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate('QuestionnaireList')}
            style={tw`bg-black rounded-lg py-3 px-6 justify-center items-center w-full mb-4`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>Listado de Cuestionarios</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => logout(navigation)}
          style={tw`bg-red-500 rounded-lg py-3 px-6 justify-center items-center`}
        >
          <Text style={tw`text-white text-lg font-semibold`}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default HomeLogin;
