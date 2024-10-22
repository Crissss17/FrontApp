import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import { BASE_2_URL } from '../../config';
const FondoApp = require('../../assets/Fondo_App.png');

// Define los tipos para los parámetros de la ruta
type CuestionarioRouteProp = RouteProp<{ Cuestionario: { cuestionarioId: string } }, 'Cuestionario'>;

const Cuestionario: React.FC = () => {
  const [cuestionario, setCuestionario] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const route = useRoute<CuestionarioRouteProp>(); // Usar tipo adecuado

  const { cuestionarioId } = route.params;

  useEffect(() => {
    fetchCuestionario();
  }, [cuestionarioId]);

  const fetchCuestionario = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_2_URL}/cuestionarios/${cuestionarioId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener el cuestionario');
      }
      const data = await response.json();
      setCuestionario(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar el cuestionario');
    }
  };

  if (loading) {
    return <Spinner visible={loading} textContent={'Cargando...'} textStyle={tw`text-white`} />;
  }

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <View style={tw`flex-1 justify-center items-center`}>
        <View style={tw`bg-white p-4 rounded-lg mb-4 w-full max-w-md items-center`}>
          <Text style={tw`text-center text-3xl font-semibold mb-4`}>Cuestionario</Text>
          {cuestionario ? (
            <>
              <Text style={tw`text-lg mb-2`}>ID: {cuestionario.id}</Text>
              <Text style={tw`text-lg mb-2`}>Nombre: {cuestionario.name}</Text>
              <Text style={tw`text-lg mb-4`}>Contenido:</Text>
              <Text style={tw`text-base leading-6`}>{cuestionario.content}</Text>
            </>
          ) : (
            <Text style={tw`text-lg text-center`}>No se encontró el cuestionario</Text>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default Cuestionario;
