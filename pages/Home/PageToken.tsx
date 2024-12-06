import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_URL } from '../../config';

import FondoApp from '../../assets/Fondo_App.png';

const PageToken: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { accessToken = '', refreshToken = '', userId } = route.params || {};
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los detalles del usuario
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await makeProtectedRequest(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo obtener la información del usuario.');
      }
    } catch (error) {
      console.error('Error al obtener la información del usuario:', error);
      Alert.alert('Error', 'Hubo un problema al cargar la información del usuario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`flex-grow items-center p-4`} showsVerticalScrollIndicator={false}>
        <View style={tw`bg-white p-6 rounded-lg w-full max-w-md shadow-lg`}>
          <Ionicons name="key-outline" size={64} color="gray" style={tw`mb-6 self-center`} />
          
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : userDetails ? (
            <>
              <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>
                Información del Usuario
              </Text>
              <View style={tw`bg-gray-200 p-4 rounded-lg mb-6`}>
                <Text style={tw`text-sm text-black mb-2`}>Nombre: {userDetails.name} {userDetails.lastName}</Text>
                <Text style={tw`text-sm text-black mb-2`}>Email: {userDetails.email}</Text>
                <Text style={tw`text-sm text-black mb-2`}>Teléfono: {userDetails.phone || 'No especificado'}</Text>
                <Text style={tw`text-sm text-black mb-2`}>Dirección: {userDetails.address || 'No especificado'}</Text>
                <Text style={tw`text-sm text-black mb-2`}>Área: {userDetails.area_id?.description || 'No especificado'}</Text>
                <TouchableOpacity
                  style={tw`bg-blue-500 rounded-xl py-2 px-2`} // Reduce px para que los bordes estén más cerca del texto
                  onPress={() => navigation.navigate('ChangePassword', { userId })}>
                  <Text style={tw`text-white text-base font-semibold text-center`}>Cambiar Contraseña</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={tw`text-center text-gray-500`}>No se encontró información del usuario.</Text>
          )}
          

          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>
            Tokens de Autenticación
          </Text>

          {accessToken ? (
            <>
              <Text style={tw`text-lg text-black mb-2 font-semibold`}>AccessToken:</Text>
              <View style={tw`bg-gray-200 p-2 rounded-md mb-4`}>
                <Text style={tw`text-sm text-black`}>{accessToken}</Text>
              </View>
            </>
          ) : (
            <Text style={tw`text-red-500 text-center mb-4`}>AccessToken no disponible.</Text>
          )}

          {refreshToken ? (
            <>
              <Text style={tw`text-lg text-black mb-2 font-semibold`}>RefreshToken:</Text>
              <View style={tw`bg-gray-200 p-2 rounded-md mb-4`}>
                <Text style={tw`text-sm text-black`}>{refreshToken}</Text>
              </View>
            </>
          ) : (
            <Text style={tw`text-red-500 text-center mb-4`}>RefreshToken no disponible.</Text>
          )}

          
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default PageToken;
