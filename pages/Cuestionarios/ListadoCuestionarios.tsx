import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types'; 
import { BASE_2_URL } from '../../config';
const FondoApp = require('../../assets/Fondo_App.png');

type Cuestionario = {
  id: string;
  nombre: string;
};

type ListadoCuestionariosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ListadoCuestionarios'>;

const ListadoCuestionarios: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const navigation = useNavigation<ListadoCuestionariosScreenNavigationProp>();

  useEffect(() => {
    fetchCuestionarios();
  }, []);

  const fetchCuestionarios = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'No se encontró el accessToken');
        return;
      }

      const mockData = [
        { id: '1', nombre: 'Cuestionario 1' },
        { id: '2', nombre: 'Cuestionario 2' },
        { id: '3', nombre: 'Cuestionario 3' },
      ];

      setCuestionarios(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los cuestionarios:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los cuestionarios');
    } finally {
      setLoading(false);
    }
  };

 /* const fetchCuestionarios = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'No se encontró el accessToken');
        return;
      }

      const response = await fetch(`${BASE_2_URL}/cuestionarios`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los cuestionarios');
      }

      const data = await response.json();
      setCuestionarios(data);
    } catch (error) {
      console.error('Error al obtener los cuestionarios:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los cuestionarios');
    } finally {
      setLoading(false);
    }
  };*/

  const renderItem = ({ item }: { item: Cuestionario }) => (
    <TouchableOpacity
      style={tw`p-4 bg-gray-200 mb-2 rounded-lg`}
      onPress={() => navigation.navigate('Cuestionario', { cuestionarioId: item.id })}
    >
      <Text style={tw`text-lg text-gray-800`}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <View style={tw`flex-1 justify-center items-center`}>
        <View style={tw`bg-white p-4 rounded-lg w-80 max-w-md`}>
          {loading ? (
            <ActivityIndicator size="large" color="black" />
          ) : (
            <FlatList
              data={cuestionarios}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={tw`items-center`}
              ListHeaderComponent={<Text style={tw`text-2xl font-bold mb-4 text-center`}>Listado de Cuestionarios</Text>}
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default ListadoCuestionarios;