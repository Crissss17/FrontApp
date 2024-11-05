import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

const FondoApp = require('../../assets/Fondo_App.png');

type RootStackParamList = {
  QuestionnaireScreen: { id: string };
  QuestionnaireList: undefined;
};

type QuestionnaireScreenProps = StackScreenProps<RootStackParamList, 'QuestionnaireScreen'>;

interface Question {
  text: string;
  answer: 'Sí' | 'No' | '';
  _id: string;
}

interface Questionnaire {
  _id: string;
  name: string;
  questions: Question[];
  vehiculo?: string;
}

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

  const handleAnswer = (index: number, answer: 'Sí' | 'No' | '') => {
    if (questionnaire) {
      const newQuestions = [...questionnaire.questions];
      newQuestions[index].answer = answer;
      setQuestionnaire({ ...questionnaire, questions: newQuestions });
    }
  };

  const handleSaveChanges = async () => {
    if (!questionnaire) return;

    const unanswered = questionnaire.questions.filter((q) => q.answer === '');
    const hasUnanswered = unanswered.length > 0;

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
          questions: questionnaire.questions,
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

  const progress = questionnaire ? (questionnaire.questions.filter(q => q.answer !== '').length + (selectedVehicle !== "Seleccione un vehículo" ? 1 : 0)) / (questionnaire.questions.length + 1)
  : 0;
    const hasUnansweredQuestions = questionnaire?.questions.some(q => q.answer === '') || false;
  const hasNoVehicleSelected = selectedVehicle === "Seleccione un vehículo";
  const isReadyToSubmit = !hasUnansweredQuestions && !hasNoVehicleSelected;

  const unansweredQuestions = questionnaire?.questions.filter((q) => q.answer === '') || [];

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

              {questionnaire?.questions.map((question, index) => (
                <View key={question._id} style={tw`mb-4 w-full`}>
                  <Text style={tw`text-lg font-semibold`}>Pregunta {index + 1}: {question.text}</Text>
                  <View style={tw`flex-row mt-2`}>
                    <TouchableOpacity
                      style={[
                        tw`px-4 py-2 rounded-lg mr-2`, 
                        question.answer === 'Sí' ? tw`bg-blue-500` : tw`bg-gray-300`
                      ]}
                      onPress={() => handleAnswer(index, question.answer === 'Sí' ? '' : 'Sí')}
                    >
                      <Text style={tw`text-white text-lg`}>Sí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        tw`px-4 py-2 rounded-lg`,
                        question.answer === 'No' ? tw`bg-red-500` : tw`bg-gray-300`
                      ]}
                      onPress={() => handleAnswer(index, question.answer === 'No' ? '' : 'No')}
                    >
                      <Text style={tw`text-white text-lg`}>No</Text>
                    </TouchableOpacity>
                  </View>
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
                    ? `Respuestas faltantes: ${unansweredQuestions.length+1}`
                    : hasNoVehicleSelected
                    ? "Seleccione vehículo"
                    : `Respuestas faltantes: ${unansweredQuestions.length}`}
                </Text>
              </View>

              {!isReadyToSubmit && unansweredQuestions.length > 0 && (
                <View style={tw`w-full mb-4`}>
                  {unansweredQuestions.map((question, index) => (
                    <Text key={index} style={tw`text-red-500 text-sm`}>
                      - {question.text}
                    </Text>
                  ))}
                  {hasNoVehicleSelected && (
                    <Text style={tw`text-red-500 text-sm`}>- Falta seleccionar vehículo</Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={handleSaveChanges}
                style={tw`bg-green-300 rounded-lg mt-5 py-3 px-6 justify-center items-center w-full`}
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
