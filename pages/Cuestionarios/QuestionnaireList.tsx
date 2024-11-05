import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';  
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
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<QuestionnaireListScreenNavigationProp>();

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`);
      const data = await response.json();
      setQuestionnaires(data);
      setLoading(false);
    } catch (error) {
      setError('Error al obtener los cuestionarios.');
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
    setTimeout(() => {
      setLoadingQuestionnaire(false);
      navigation.navigate('QuestionnaireScreen', { id });
    }, 2000);
  };

  const isQuestionnaireComplete = (questionnaire: Questionnaire): boolean => {
    const allAnswered = questionnaire.questions.every(q => q.answer !== '');
    const vehicleSelected = !!questionnaire.vehiculo && questionnaire.vehiculo !== 'Seleccione un vehículo';
    return allAnswered && vehicleSelected;
  };

  const isQuestionnaireEmpty = (questionnaire: Questionnaire): boolean => {
    const noAnswers = questionnaire.questions.every(q => q.answer === '');
    const noVehicleSelected = !questionnaire.vehiculo || questionnaire.vehiculo === 'Seleccione un vehículo';
    return noAnswers && noVehicleSelected;
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

                  return (
                    <TouchableOpacity
                      key={q._id}
                      onPress={() => handleQuestionnairePress(q._id)}
                      style={tw`p-4 rounded-md mb-4 w-full ${
                        isComplete 
                          ? 'bg-green-500' 
                          : isEmpty 
                          ? 'bg-gray-400'  // Gris si está vacío
                          : 'bg-orange-500'  // Naranja si está incompleto
                      }`}
                    >
                      <Text style={tw`text-lg text-white font-semibold`}>
                        {q.name} {isComplete ? "(Completado)" : isEmpty ? "(Sin respuestas)" : "(Incompleto)"}
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
