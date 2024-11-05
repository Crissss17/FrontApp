import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/types';

const FondoApp = require('../../assets/Fondo_App.png');

type CreateQuestionnaireProps = StackScreenProps<RootStackParamList, 'CreateQuestionnaire'>;

const CreateQuestionnaire: React.FC<CreateQuestionnaireProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answer: '' }]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', answer: '' }]);
  };

  const handleQuestionChange = (text: string, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = text;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor, ingrese el nombre del cuestionario');
      return;
    }

    if (questions.some((q) => !q.text.trim())) {
      Alert.alert('Error', 'Por favor, complete todas las preguntas antes de guardar.');
      return;
    }

    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, questions, vehiculo: null }),
      });

      if (response.ok) {
        Alert.alert('Cuestionario guardado', 'El cuestionario se ha creado correctamente');
        navigation.navigate({ name: 'HomeLogin', params: { accessToken: '', refreshToken: '' } });
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar el cuestionario.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el cuestionario.');
    }
  };

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
        <View style={tw`bg-white p-4 rounded-lg mb-4 w-full max-w-md`}>
          <Ionicons name="document-text-outline" size={64} color="gray" style={tw`mb-6 self-center`} />
          <Text style={tw`text-2xl font-bold mb-4 text-center`}>Crear Cuestionario</Text>
          <Text style={tw`text-lg font-semibold mb-2`}>Nombre del Cuestionario:</Text>
          <TextInput
            style={tw`border p-2 rounded mb-4`}
            placeholder="Nombre del Cuestionario"
            value={name}
            onChangeText={setName}
          />

          {/* Preguntas dinámicas */}
          {questions.map((question, index) => (
            <View key={index} style={tw`mb-4`}>
              <Text style={tw`text-lg font-semibold mb-2`}>Pregunta {index + 1}:</Text>
              <TextInput
                style={tw`border p-2 rounded mb-2`}
                placeholder="Escriba la pregunta aquí"
                value={question.text}
                onChangeText={(text) => handleQuestionChange(text, index)}
              />
              <TouchableOpacity
                style={tw`bg-red-500 p-2 rounded-lg items-center mb-4`}
                onPress={() => removeQuestion(index)}
              >
                <Text style={tw`text-white`}>Eliminar Pregunta</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={tw`bg-blue-500 p-3 rounded-lg mb-4`} onPress={addQuestion}>
            <Text style={tw`text-white text-center`}>Añadir Pregunta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`bg-green-500 p-3 rounded-lg`} onPress={handleSave}>
            <Text style={tw`text-white text-center`}>Guardar Cuestionario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default CreateQuestionnaire;
