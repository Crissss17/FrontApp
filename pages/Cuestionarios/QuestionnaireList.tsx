import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';  
import { makeProtectedRequest } from '../../services/api-utils';
import { Questionnaire } from './Questionnaire';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import tw from 'twrnc'; 
import { BASE_2_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

const FondoApp = require('../../assets/Fondo_App.png');  // El fondo que usas en las otras pantallas

type QuestionnaireListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'QuestionnaireList'
>;

const QuestionnaireList = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<QuestionnaireListScreenNavigationProp>();

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`);
        const data = await response.json();
        setQuestionnaires(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los cuestionarios:', error);
        setError('Error al obtener los cuestionarios.');
        setLoading(false);
      }
    };

    fetchQuestionnaires();
  }, []);

  const handleQuestionnairePress = (id: string) => {
    navigation.navigate('QuestionnaireScreen', { id });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={tw`mt-10`} />;
  }

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`flex-1 justify-center items-center p-4`}>
        <View style={tw`bg-white p-4 rounded-lg mb-4 w-full max-w-md items-center`}>
          <Ionicons name="document-text-outline" size={64} color="gray" style={tw`mb-6`} />
          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>Listado de Cuestionarios</Text>
          {error ? (
            <Text style={tw`text-red-500`}>{error}</Text>
          ) : (
            <>
              {questionnaires.length > 0 ? (
                questionnaires.map(q => (
                  <TouchableOpacity 
                    key={q._id} 
                    onPress={() => handleQuestionnairePress(q._id)}
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
