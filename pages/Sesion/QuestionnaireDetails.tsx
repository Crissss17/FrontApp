import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import tw from 'twrnc';
import { RootStackParamList } from '../../types/types';

const FondoApp = require('../../assets/Fondo_App.png');

type QuestionnaireDetailsProps = StackScreenProps<RootStackParamList, 'QuestionnaireDetails'>;

const QuestionnaireDetails: React.FC<QuestionnaireDetailsProps> = ({ route }) => {
  const { answerId } = route.params;
  const [answerDetails, setAnswerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswerDetails = async () => {
      setLoading(true);
      try {
        const response = await makeProtectedRequest(`${BASE_2_URL}/answers/${answerId}`);
        const data = await response.json();
        setAnswerDetails(data);
      } catch (error) {
        console.error('Error al obtener los detalles del cuestionario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswerDetails();
  }, [answerId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 16, paddingTop: 30 }}>
        <View style={tw`bg-white rounded-lg mb-4 w-full max-w-md`}>
          <View style={{ paddingVertical: 15, backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <Text style={tw`text-2xl font-bold text-center`}>Detalles del Cuestionario</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={tw`p-4 items-center`}>
              {answerDetails ? (
                <View style={tw`w-full`}>
                  <Text style={tw`text-xl font-semibold mb-2`}>Cuestionario ID: {answerDetails.questionnaireId}</Text>
                  <Text style={tw`text-lg mb-4`}>Vehículo: {answerDetails.vehiculo || 'No especificado'}</Text>
                  
                  {answerDetails.sections.map((section: any, index: number) => (
                    <View key={index} style={tw`mb-6`}>
                      <Text style={tw`text-xl font-bold mb-2`}>Sección {index + 1}: {section.name}</Text>
                      {section.questions.map((question: any, qIndex: number) => (
                        <View key={qIndex} style={tw`mb-4`}>
                          <Text style={tw`text-lg font-semibold`}>Pregunta {qIndex + 1}: {question.text}</Text>
                          <Text style={tw`text-lg text-gray-700 mt-1`}>Respuesta: {question.answer}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={tw`text-center text-gray-500`}>No se encontraron detalles para este cuestionario.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
};

export default QuestionnaireDetails;
