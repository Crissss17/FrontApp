import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';  
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
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<QuestionnaireListScreenNavigationProp>();

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`);
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      const data = await response.json();
      setQuestionnaires(data);
    } catch (error) {
      setError('Error al obtener los cuestionarios. Intente nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQuestionnaires();
    }, [])
  );

  const handleQuestionnairePress = (id: string) => {
    setLoadingQuestionnaire(true);
    navigation.navigate('QuestionnaireScreen', { id });
    setLoadingQuestionnaire(false);
  };

  const isQuestionnaireComplete = (questionnaire: Questionnaire): boolean => {
    if (!questionnaire || !questionnaire.sections) return false; 
    const allAnswered = questionnaire.sections.flatMap(section => section.questions).every(q => q.answer !== '');
    const vehicleSelected = !!questionnaire.vehiculo && questionnaire.vehiculo !== 'Seleccione un vehículo';
    return allAnswered && vehicleSelected;
  };
  
  const isQuestionnaireEmpty = (questionnaire: Questionnaire): boolean => {
    if (!questionnaire || !questionnaire.sections) return true; 
    const noAnswers = questionnaire.sections.flatMap(section => section.questions).every(q => q.answer === '');
    return noAnswers && !questionnaire.vehiculo; 
  };
  

  if (loading) {
    return <Spinner visible={loading} textContent={'Cargando cuestionarios...'} textStyle={tw`text-white`} />;
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
            <Text style={tw`text-red-500`}>{error}</Text>
          ) : (
            <>
              {questionnaires.length > 0 ? (
                questionnaires.map((q) => {
                  const isComplete = isQuestionnaireComplete(q);
                  const isEmpty = isQuestionnaireEmpty(q);
                  const backgroundColor = isComplete ? 'bg-green-500' : isEmpty ? 'bg-gray-400' : 'bg-orange-500';
                  const statusText = isComplete ? "Completo" : isEmpty ? "Sin Respuestas" : "Incompleto";

                  return (
                    <TouchableOpacity
                      key={q._id}
                      onPress={() => handleQuestionnairePress(q._id)}
                      style={tw`p-4 rounded-md mb-4 w-full ${backgroundColor}`}
                    >
                      <Text style={tw`text-lg text-white font-semibold`}>
                        {q.name} ({statusText})
                      </Text>
                    </TouchableOpacity>
                  );
                })
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
