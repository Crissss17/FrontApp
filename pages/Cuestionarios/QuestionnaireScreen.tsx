import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ImageBackground, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { Questionnaire, Section } from './Questionnaire';  // Importa las interfaces

const FondoApp = require('../../assets/Fondo_App.png');

// Define el tipo de parámetros para el stack de navegación
type RootStackParamList = {
  QuestionnaireScreen: { id: string };
  QuestionnaireList: undefined;
};

// Define el tipo de props para la pantalla
type QuestionnaireScreenProps = StackScreenProps<RootStackParamList, 'QuestionnaireScreen'>;

const vehicles = ["Seleccione un vehículo", "Camioneta", "Auto", "Camión", "Moto", "Otro"];

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("Seleccione un vehículo");

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`);
        const data = await response.json();
        setQuestionnaire(data);
        setSelectedVehicle(data.vehiculo || "Seleccione un vehículo");
        setLoading(false);
      } catch (error) {
        setError('Error al obtener el cuestionario.');
        setLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [id]);

  const handleAnswer = (sectionIndex: number, questionIndex: number, answer: string) => {
    if (questionnaire) {
      const newSections = [...questionnaire.sections];
      newSections[sectionIndex].questions[questionIndex].answer = answer;
      setQuestionnaire({ ...questionnaire, sections: newSections });
    }
  };

  const handleSaveChanges = async () => {
    if (!questionnaire) return;

    const unansweredQuestions = questionnaire.sections.flatMap(section => 
      section.questions.filter(q => q.answer === '')
    );
    const hasUnanswered = unansweredQuestions.length > 0;

    if (hasUnanswered) {
      Alert.alert(
        "Algunas preguntas no están respondidas",
        "¿Estás seguro de que deseas guardar el cuestionario con preguntas sin responder?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Guardar de todos modos",
            onPress: async () => {
              await saveQuestionnaire();
            },
          },
        ]
      );
    } else {
      await saveQuestionnaire();
    }
  };

  const saveQuestionnaire = async () => {
    if (!questionnaire) return;

    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: questionnaire.sections,
          vehiculo: selectedVehicle === "Seleccione un vehículo" ? "" : selectedVehicle,
        }),
      });

      if (response.ok) {
        Alert.alert('Cambios guardados', 'El cuestionario se actualizó correctamente.');
        navigation.navigate('QuestionnaireList');
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar los cambios.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el cuestionario.');
    }
  };

  const totalQuestions = questionnaire ? questionnaire.sections.reduce((sum, section) => sum + section.questions.length, 0) : 0;
  const answeredQuestions = questionnaire ? questionnaire.sections.reduce((sum, section) => sum + section.questions.filter(q => q.answer !== '').length, 0) : 0;
  const progress = questionnaire ? (answeredQuestions + (selectedVehicle !== "Seleccione un vehículo" ? 1 : 0)) / (totalQuestions + 1) : 0;

  const hasUnansweredQuestions = totalQuestions > answeredQuestions;
  const hasNoVehicleSelected = selectedVehicle === "Seleccione un vehículo";
  const isReadyToSubmit = !hasUnansweredQuestions && !hasNoVehicleSelected;

  const unansweredQuestions = questionnaire ? questionnaire.sections.flatMap(section => 
    section.questions.filter(q => q.answer === '')
  ) : [];

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 16 }}>
        <View style={tw`bg-white rounded-lg mb-4 w-full max-w-md`}>
          <View style={{ position: 'absolute', top: 0, width: '100%', padding: 10, backgroundColor: 'white', zIndex: 10, borderRadius: 10 }}>
            <Text style={tw`text-2xl font-bold mb-4 text-center`}>{questionnaire?.name}</Text>
            <View style={tw`p-2`}>
              <Progress.Bar progress={progress} width={null} color="green" />
              <Text style={tw`text-center text-sm mt-2`}>{Math.round(progress * 100)}% completado</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 20 }}>
            <View style={tw`p-4 items-center`}>
              <View style={tw`w-full mb-4`}>
                <Text style={tw`text-lg font-semibold mb-2`}>Seleccione un vehículo:</Text>
                <View style={tw`border rounded-lg bg-gray-200`}>
                  <Picker
                    selectedValue={selectedVehicle}
                    onValueChange={(itemValue) => setSelectedVehicle(itemValue)}
                  >
                    {vehicles.map((vehicle) => (
                      <Picker.Item key={vehicle} label={vehicle} value={vehicle} />
                    ))}
                  </Picker>
                </View>
              </View>

              {questionnaire?.sections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={tw`mb-6 w-full`}>
                  <Text style={tw`text-xl font-bold mb-4`}>Sección {sectionIndex + 1}: {section.name}</Text>
                  {section.questions.map((question, questionIndex) => (
                    <View key={question._id} style={tw`mb-4`}>
                      <Text style={tw`text-lg font-semibold`}>Pregunta {questionIndex + 1}.{sectionIndex + 1}: {question.text}</Text>
                      {question.type === 'Texto' ? (
                        <TextInput
                          style={tw`border p-2 rounded`}
                          placeholder="Escriba su respuesta aquí"
                          value={question.answer === '' ? '' : question.answer}
                          onChangeText={(text) => handleAnswer(sectionIndex, questionIndex, text)}
                        />
                      ) : (
                        <View style={tw`flex-row mt-2`}>
                          <TouchableOpacity
                            style={[tw`px-4 py-2 rounded-lg mr-2`, question.answer === 'Sí' ? tw`bg-blue-500` : tw`bg-gray-300`]}
                            onPress={() => handleAnswer(sectionIndex, questionIndex, question.answer === 'Sí' ? '' : 'Sí')}
                          >
                            <Text style={tw`text-white text-lg`}>Sí</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[tw`px-4 py-2 rounded-lg`, question.answer === 'No' ? tw`bg-red-500` : tw`bg-gray-300`]}
                            onPress={() => handleAnswer(sectionIndex, questionIndex, question.answer === 'No' ? '' : 'No')}
                          >
                            <Text style={tw`text-white text-lg`}>No</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}

              <View style={tw`flex-row items-center mb-4 mt-4`}>
                <Ionicons
                  name={isReadyToSubmit ? "checkmark-circle" : "ellipse-outline"}
                  size={32}
                  color={isReadyToSubmit ? "green" : "gray"}
                />
                <Text style={tw`ml-2 text-lg ${isReadyToSubmit ? 'text-green-600' : 'text-gray-500'}`}>
                  {isReadyToSubmit
                    ? "Listo para enviar"
                    : hasNoVehicleSelected && hasUnansweredQuestions
                    ? `Respuestas faltantes: ${totalQuestions - answeredQuestions + 1}`
                    : hasNoVehicleSelected
                    ? "Seleccione vehículo"
                    : `Respuestas faltantes: ${totalQuestions - answeredQuestions}`}
                </Text>
              </View>

              {hasUnansweredQuestions && (
                <View style={tw`mt-4`}>
                  {unansweredQuestions.map((q, index) => (
                    <Text key={index} style={tw`text-base`}>- {q.text}</Text>
                  ))}
                  <Text style={tw`text-base`}>- Tipo de vehículo: {selectedVehicle}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSaveChanges}
                style={tw`bg-green-500 rounded-lg mt-5 py-3 px-6 justify-center items-center w-full`}
              >
                <Text style={tw`text-white text-lg font-semibold`}>Guardar Cuestionario</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
};

export default QuestionnaireScreen;
