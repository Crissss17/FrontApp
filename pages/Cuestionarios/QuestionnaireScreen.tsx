import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, ImageBackground, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/api-utils';
import { BASE_2_URL } from '../../config';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

const FondoApp = require('../../assets/Fondo_App.png');

// Define el tipo de parámetros que pasas a esta pantalla
type RootStackParamList = {
  QuestionnaireScreen: { id: string };
};

type QuestionnaireScreenProps = StackScreenProps<RootStackParamList, 'QuestionnaireScreen'>;

interface Question {
  text: string;
  answer: string;
}

interface Questionnaire {
  _id: string;
  name: string;
  questions: Question[];
}

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ route }) => {
  const { id } = route.params;
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`);
        const data = await response.json();
        setQuestionnaire(data);
        setUpdatedQuestions(data.questions);
        setLoading(false);
      } catch (error) {
        setError('Error al obtener el cuestionario.');
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id]);

  const handleSaveChanges = async () => {
    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: updatedQuestions, // Preguntas actualizadas desde el formulario
        }),
      });
      

      if (response.ok) {
        Alert.alert('Cambios guardados', 'El cuestionario se actualizó correctamente.');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar los cambios.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el cuestionario.');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleQuestionChange = (text: string, index: number, field: 'text' | 'answer') => {
    const newQuestions = [...updatedQuestions];
    newQuestions[index][field] = text;
    setUpdatedQuestions(newQuestions);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={tw`mt-10`} />;
  }

  if (error) {
    return (
      <View style={tw`p-4`}>
        <Text style={tw`text-red-500`}>{error}</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={tw`flex-1 justify-center items-center`}>
        {questionnaire ? (
          <View style={tw`bg-white p-4 rounded-lg mb-4 w-80 max-w-md`}>
            <Ionicons name="document-text-outline" size={64} color="gray" style={tw`mb-6 text-center`} />
            <Text style={tw`text-2xl font-bold mb-4 text-center`}>{questionnaire.name}</Text>

            {updatedQuestions.map((question, index) => (
              <View key={index} style={tw`mb-4`}>
                <Text style={tw`text-lg font-semibold`}>Pregunta {index + 1}:</Text>
                {isEditing ? (
                  <TextInput
                    style={tw`border p-2 mb-2`}
                    value={question.text}
                    onChangeText={(text) => handleQuestionChange(text, index, 'text')}
                  />
                ) : (
                  <Text style={tw`text-base mb-2`}>{question.text}</Text>
                )}

                <Text style={tw`text-lg font-semibold`}>Respuesta:</Text>
                {isEditing ? (
                  <TextInput
                    style={tw`border p-2 mb-2`}
                    value={question.answer}
                    onChangeText={(text) => handleQuestionChange(text, index, 'answer')}
                  />
                ) : (
                  <Text style={tw`text-base`}>{question.answer}</Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={handleEditToggle}
              style={tw`bg-blue-500 rounded-lg mt-5 py-3 px-6 justify-center items-center`}
            >
              <Text style={tw`text-white text-lg font-semibold`}>{isEditing ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                onPress={handleSaveChanges}
                style={tw`bg-green-500 rounded-lg mt-5 py-3 px-6 justify-center items-center`}
              >
                <Text style={tw`text-white text-lg font-semibold`}>Guardar cambios</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={tw`text-gray-500`}>No se encontró el cuestionario.</Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

export default QuestionnaireScreen;
