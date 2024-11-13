import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/types';
import { Section } from './Questionnaire';

const FondoApp = require('../../assets/Fondo_App.png');

type CreateQuestionnaireProps = StackScreenProps<RootStackParamList, 'CreateQuestionnaire'>;

const CreateQuestionnaire: React.FC<CreateQuestionnaireProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [sections, setSections] = useState<Section[]>([
    { name: '', questions: [{ text: '', type: 'Sí/No', answer: '', _id: 'temp_id_1' }] }
  ]);

  const addSection = () => {
    setSections([...sections, { name: '', questions: [{ text: '', type: 'Sí/No', answer: '', _id: `temp_id_${sections.length + 1}` }] }]);
  };

  const handleSectionNameChange = (text: string, index: number) => {
    const updatedSections = [...sections];
    updatedSections[index].name = text;
    setSections(updatedSections);
  };

  const addQuestionToSection = (sectionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push({ text: '', type: 'Sí/No', answer: '', _id: `temp_id_${sectionIndex}_${updatedSections[sectionIndex].questions.length + 1}` });
    setSections(updatedSections);
  };

  const handleQuestionChange = (text: string, sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex].text = text;
    setSections(updatedSections);
  };

  const handleQuestionTypeChange = (type: 'Sí/No' | 'Texto', sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex].type = type;
    setSections(updatedSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(updatedSections);
  };

  const removeSection = (index: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor, ingrese el nombre del cuestionario');
      return;
    }

    if (sections.some(section => 
      !section.name.trim() || 
      section.questions.some(q => !q.text.trim() || !q.type)
    )) {
      Alert.alert('Error', 'Por favor, complete todos los títulos de sección y preguntas antes de guardar.');
      return;
    }

    // Limpiar el campo `_id` en cada pregunta antes de enviar
    const cleanedSections = sections.map(section => ({
      ...section,
      questions: section.questions.map(({ _id, ...question }) => question) // Remueve `_id` de cada pregunta
    }));

    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, sections: cleanedSections, vehiculo: null }),
      });

      if (response.ok) {
        Alert.alert('Cuestionario guardado', 'El cuestionario se ha creado correctamente');
        navigation.navigate('HomeLogin', {
          accessToken: '',
          refreshToken: ''
        });
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Hubo un problema al guardar el cuestionario.');
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

          {sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={tw`mb-10 w-full border-t border-gray-300 pt-4`}>
              <Text style={tw`text-lg font-semibold mb-2`}>Sección {sectionIndex + 1}: {section.name}</Text>
              <TextInput
                style={tw`border p-2 rounded mb-4`}
                placeholder="Título de la sección"
                value={section.name}
                onChangeText={(text) => handleSectionNameChange(text, sectionIndex)}
              />
              {section.questions.map((question, questionIndex) => (
                <View key={questionIndex} style={tw`mb-4`}>
                  <Text style={tw`text-lg font-semibold mb-2`}>
                    Pregunta {sectionIndex + 1}.{questionIndex + 1}:
                  </Text>
                  <TextInput
                    style={tw`border p-2 rounded mb-2`}
                    placeholder="Escriba la pregunta aquí"
                    value={question.text || ''} 
                    onChangeText={(text) => handleQuestionChange(text, sectionIndex, questionIndex)}
                  />
                  <Text style={tw`text-sm font-semibold mb-1`}>Tipo de pregunta:</Text>
                  <View style={tw`flex-row mb-2 justify-between`}>
                    <TouchableOpacity
                      style={[tw`flex-1 p-2 rounded-lg mr-2`, question.type === 'Sí/No' ? tw`bg-blue-500` : tw`bg-gray-300`]}
                      onPress={() => handleQuestionTypeChange('Sí/No', sectionIndex, questionIndex)}
                    >
                      <Text style={tw`text-white text-center`}>Sí/No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[tw`flex-1 p-2 rounded-lg`, question.type === 'Texto' ? tw`bg-blue-500` : tw`bg-gray-300`]}
                      onPress={() => handleQuestionTypeChange('Texto', sectionIndex, questionIndex)}
                    >
                      <Text style={tw`text-white text-center`}>Texto</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={tw`bg-red-500 p-2 rounded-lg items-center mb-4`}
                    onPress={() => removeQuestion(sectionIndex, questionIndex)}
                  >
                    <Text style={tw`text-white`}>Eliminar Pregunta</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={tw`bg-blue-500 p-3 rounded-lg mb-4`} onPress={() => addQuestionToSection(sectionIndex)}>
                <Text style={tw`text-white text-center`}>Añadir Pregunta a esta Sección</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`bg-red-500 p-2 rounded-lg items-center`} onPress={() => removeSection(sectionIndex)}>
                <Text style={tw`text-white`}>Eliminar Sección</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={tw`bg-blue-500 p-3 rounded-lg`} onPress={addSection}>
            <Text style={tw`text-white text-center`}>Añadir Sección</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`bg-green-500 p-3 rounded-lg mt-4`} onPress={handleSave}>
            <Text style={tw`text-white text-center`}>Guardar Cuestionario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default CreateQuestionnaire;
