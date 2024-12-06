import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/types';
import { Types } from 'mongoose';

import FondoApp from '../../assets/Fondo_App.png';

type CreateQuestionnaireProps = NativeStackScreenProps<RootStackParamList, 'CreateQuestionnaire'>;

interface Question {
  _id: Types.ObjectId;
  text: string;
  type: 'Sí/No' | 'Texto';
  answer: string;
}

interface Section {
  _id: Types.ObjectId;
  name: string;
  questions: Question[];
}

const CreateQuestionnaire: React.FC<CreateQuestionnaireProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [sections, setSections] = useState<Section[]>([
    {
      _id: new Types.ObjectId(),
      name: '',
      questions: [
        { _id: new Types.ObjectId(), text: '', type: 'Sí/No', answer: '' },
      ],
    },
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        _id: new Types.ObjectId(),
        name: '',
        questions: [
          { _id: new Types.ObjectId(), text: '', type: 'Sí/No', answer: '' },
        ],
      },
    ]);
  };

  const addQuestionToSection = (sectionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push({
      _id: new Types.ObjectId(),
      text: '',
      type: 'Sí/No',
      answer: '',
    });
    setSections(updatedSections);
  };

  const handleSectionNameChange = (text: string, index: number) => {
    const updatedSections = [...sections];
    updatedSections[index].name = text;
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

    if (
      sections.some(
        (section) =>
          !section.name.trim() ||
          section.questions.some((q) => !q.text.trim() || !q.type)
      )
    ) {
      Alert.alert(
        'Error',
        'Por favor, complete todos los títulos de sección y preguntas antes de guardar.'
      );
      return;
    }

    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, sections, vehiculo: null }),
      });

      if (response.ok) {
        Alert.alert('Cuestionario guardado', 'El cuestionario se ha creado correctamente');
        navigation.navigate('HomeLogin', {
          accessToken: '',
          refreshToken: '',
        });
      } else {
        const errorData = await response.json();
        Alert.alert(
          'Error',
          errorData.message || 'Hubo un problema al guardar el cuestionario.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el cuestionario.');
    }
  };

  return (
    <ImageBackground
      source={FondoApp}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={tw`bg-white p-6 rounded-lg shadow-lg mb-4`}>
          <Ionicons name="document-text-outline" size={64} color="gray" style={tw`self-center mb-4`} />
          <Text style={tw`text-2xl font-bold text-center mb-6`}>Crear Cuestionario</Text>
          <TextInput
            style={tw`border rounded-lg p-3 mb-6`}
            placeholder="Nombre del Cuestionario"
            value={name}
            onChangeText={setName}
          />

          {sections.map((section, sectionIndex) => (
            <View key={section._id.toString()} style={tw`border rounded-lg mb-6 p-4 bg-gray-100 shadow-md`}>
              <Text style={tw`text-lg font-semibold mb-2`}>Sección {sectionIndex + 1}</Text>
              <TextInput
                style={tw`border rounded-lg p-2 mb-4`}
                placeholder="Nombre de la sección"
                value={section.name}
                onChangeText={(text) => handleSectionNameChange(text, sectionIndex)}
              />

              {section.questions.map((question, questionIndex) => (
                <View key={question._id.toString()} style={tw`mb-4 bg-white p-3 rounded-lg shadow-md`}>
                  <Text style={tw`font-semibold`}>Pregunta {questionIndex + 1}:</Text>
                  <TextInput
                    style={tw`border rounded-lg p-2 mt-2`}
                    placeholder="Escribe la pregunta"
                    value={question.text}
                    onChangeText={(text) => handleQuestionChange(text, sectionIndex, questionIndex)}
                  />
                  <View style={tw`flex-row justify-between mt-2`}>
                    <TouchableOpacity
                      style={[
                        tw`flex-1 p-2 rounded-lg mr-2`,
                        question.type === 'Sí/No' ? tw`bg-blue-500` : tw`bg-gray-300`,
                      ]}
                      onPress={() => handleQuestionTypeChange('Sí/No', sectionIndex, questionIndex)}
                    >
                      <Text style={tw`text-white text-center`}>Sí/No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        tw`flex-1 p-2 rounded-lg`,
                        question.type === 'Texto' ? tw`bg-blue-500` : tw`bg-gray-300`,
                      ]}
                      onPress={() => handleQuestionTypeChange('Texto', sectionIndex, questionIndex)}
                    >
                      <Text style={tw`text-white text-center`}>Texto</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={tw`bg-red-500 p-2 rounded-lg mt-4`}
                    onPress={() => removeQuestion(sectionIndex, questionIndex)}
                  >
                    <Text style={tw`text-white text-center`}>Eliminar Pregunta</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={tw`bg-green-500 p-3 rounded-lg mt-4`}
                onPress={() => addQuestionToSection(sectionIndex)}
              >
                <Text style={tw`text-white text-center`}>Añadir Pregunta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-red-500 p-3 rounded-lg mt-4`}
                onPress={() => removeSection(sectionIndex)}
              >
                <Text style={tw`text-white text-center`}>Eliminar Sección</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={tw`bg-blue-500 p-3 rounded-lg`}
            onPress={addSection}
          >
            <Text style={tw`text-white text-center`}>Añadir Sección</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-green-500 p-3 rounded-lg mt-6`}
            onPress={handleSave}
          >
            <Text style={tw`text-white text-center`}>Guardar Cuestionario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default CreateQuestionnaire;
