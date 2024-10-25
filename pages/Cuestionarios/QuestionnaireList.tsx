import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';  
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeProtectedRequest } from '../../services/authUtils';
import { Questionnaire } from './Questionnaire';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import tw from 'twrnc'; 
import { BASE_2_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';  

const FondoApp = require('../../assets/Fondo_App.png'); 

type QuestionnaireListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'QuestionnaireList'
>;

const QuestionnaireList = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false); // Estado para el spinner al cargar cuestionario
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<QuestionnaireListScreenNavigationProp>();

  useEffect(() => {
    const checkAuthenticationAndFetch = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          console.log('AuthGuard: No se encontró el accessToken. Redirigiendo a Login.');
          navigation.navigate('Login');
          return;
        }

        console.log('AuthGuard: Token encontrado. Cargando cuestionarios.');

        await fetchQuestionnaires();
      } catch (error) {
        console.error('Error en authGuard o al obtener los cuestionarios:', error);
        setError('Error de autenticación o de carga de datos.');
        setLoading(false);
      }
    };

    checkAuthenticationAndFetch();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      console.log('AuthGuard: Enviando token en la solicitud protegida...');
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`);
      const data = await response.json();
      setQuestionnaires(data);
      setLoading(false);
      console.log('AuthGuard: Cuestionarios cargados correctamente.');
    } catch (error) {
      console.error('Error al obtener los cuestionarios:', error);
      setError('Error al obtener los cuestionarios.');
      setLoading(false);
    }
  };

  const handleQuestionnairePress = (id: string) => {
    setLoadingQuestionnaire(true); 
    setTimeout(() => {
      setLoadingQuestionnaire(false);  
      navigation.navigate('QuestionnaireScreen', { id });
    }, 2000);  
  };

  if (loading) {
    return <Spinner visible={loading} textContent={'Cargando cuestionarios...'} textStyle={tw`text-white`} />;  // Spinner mientras se cargan los cuestionarios
  }

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover">
      <Spinner visible={loadingQuestionnaire} textContent={'Cargando cuestionario...'} textStyle={tw`text-white`} />

      <ScrollView contentContainerStyle={tw`flex-1 justify-center items-center p-4`}>
        <View style={tw`bg-white p-4 rounded-lg mb-4 w-full max-w-md items-center`}>
          <Ionicons name="document-text-outline" size={64} color="gray" style={tw`mb-6`} />
          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>Listado de Cuestionarios</Text>
          {error ? (
            <Text style={tw`text-red-500`}>{error}</Text>):(
            <>
              {questionnaires.length > 0 ? (
                questionnaires.map(q => (
                  <TouchableOpacity 
                    key={q._id} 
                    onPress={() => handleQuestionnairePress(q._id)}  // Manejar la navegación con spinner
                    style={tw`bg-gray-200 p-4 rounded-md mb-4 w-full`}
                  >
                    <Text style={tw`text-lg text-black font-semibold`}>{q.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={tw`text-gray-500`}>No hay cuestionarios disponibles</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default QuestionnaireList;
