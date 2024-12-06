import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types/types';

import FondoApp from '../../assets/Fondo_App.png';

type UserHistoryScreenProps = StackScreenProps<RootStackParamList, 'UserHistoryScreen'>;

const UserHistoryScreen: React.FC<UserHistoryScreenProps> = ({ navigation }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestionnaireDetails = async (questionnaireId: string) => {
    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${questionnaireId}`);
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error(`Error al obtener los detalles del cuestionario ${questionnaireId}:`, error);
      return null; 
    }
  };

  const fetchUserAnswers = async () => {
    setLoading(true);
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Error', 'No se pudo obtener el ID del usuario.');
      setLoading(false);
      return;
    }

    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/answers/user-history/${userId}`);
      const data = await response.json();

      if (!data || data.length === 0) {
        setAnswers([]);
        Alert.alert('Información', 'No se encontraron cuestionarios respondidos.');
        return;
      }

      console.log('Datos del backend (respuestas):', data);

      
      const answersWithDetails = await Promise.all(
        data.map(async (answer: any) => {
          const questionnaireDetails = await fetchQuestionnaireDetails(answer.questionnaireId);
          return {
            ...answer,
            questionnaireDetails, 
          };
        })
      );

      
      const sortedAnswers = answersWithDetails.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setAnswers(sortedAnswers);
    } catch (error) {
      console.error('Error al obtener el historial de respuestas:', error);
      Alert.alert('Error', 'Hubo un problema al cargar tu historial de cuestionarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAnswers();
  }, []);

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <ScrollView
  contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', }} style={{ flex: 1 }}>
        <View style={[tw`bg-white p-6 rounded-lg m-4`, { alignItems: 'center' }]}>
          <Ionicons name="document-text-outline" size={64} color="gray" style={tw`mb-6`} />
          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>Historial de Cuestionarios</Text>
          {answers.length > 0 ? (
            answers.map((answer) => (
              <TouchableOpacity
                key={answer._id}
                style={tw`p-4 rounded-lg mb-4 bg-gray-200 w-full`}
                onPress={() => navigation.navigate('QuestionnaireDetails', { answerId: answer._id })}
              >
                <Text style={tw`text-lg font-semibold text-black`}>
                  {answer.questionnaireDetails?.name || 'Cuestionario sin nombre'}
                </Text>
                <Text style={tw`text-sm text-gray-600`}>
                  Vehículo: {answer.vehiculo || 'No especificado'}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>
                  Fecha: {answer.createdAt ? new Date(answer.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={tw`text-gray-500 text-center`}>No has respondido ningún cuestionario.</Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default UserHistoryScreen;
