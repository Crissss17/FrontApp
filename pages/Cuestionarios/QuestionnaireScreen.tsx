import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ImageBackground, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL, BASE_URL } from '../../config';
import tw from 'twrnc';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Questionnaire } from './Questionnaire';
import { RootStackParamList } from '../../types/types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const FondoApp = require('../../assets/Fondo_App.png');

type QuestionnaireScreenProps = StackScreenProps<RootStackParamList, 'QuestionnaireScreen'>;

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(""); 
  const [machineModels, setMachineModels] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [incompleteQuestions, setIncompleteQuestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`);
        const data = await response.json();
        setQuestionnaire(data);
        setSelectedVehicle(data.vehiculo || ""); 
      } catch (error) {
        console.error('Error al obtener el cuestionario:', error);
      }
    };
    fetchQuestionnaire();
  }, [id]);

  useEffect(() => {
    const fetchMachineModels = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await makeProtectedRequest(`${BASE_URL}/users/${userId}/machines`);
          const data = await response.json();
          const models = data
            .map((machine: { model: string }) => machine.model)
            .filter((model: string) => typeof model === 'string' && model.trim().length > 0);

          if (models.length === 0) {
            models.push("Sin modelos disponibles");
          }

          setMachineModels(["Seleccione un vehículo", ...models]);
        }
      } catch (error) {
        console.error('Error al obtener los modelos de las máquinas:', error);
        setMachineModels(["Seleccione un vehículo", "Sin modelos disponibles"]);
      }
    };
    fetchMachineModels();
  }, []);

  const handleAnswer = (sectionIndex: number, questionIndex: number, answer: string) => {
    if (questionnaire) {
      const newSections = [...questionnaire.sections];
      newSections[sectionIndex].questions[questionIndex].answer = answer;
      setQuestionnaire({ ...questionnaire, sections: newSections });
    }
  };

  const handleSaveChanges = async () => {
    if (!isQuestionnaireComplete) {
      // Show alert if questionnaire is incomplete
      Alert.alert(
        "Cuestionario incompleto",
        "El cuestionario está incompleto. ¿Está seguro de que desea guardarlo?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Guardar",
            onPress: async () => {
              // Proceed to save if the user confirms
              await saveQuestionnaire();
              await checkAndSaveCompleteAnswer();
              navigation.navigate('QuestionnaireList');
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      // Directly save if the questionnaire is complete
      await saveQuestionnaire();
      await checkAndSaveCompleteAnswer();
      navigation.navigate('QuestionnaireList');
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
          vehiculo: selectedVehicle === "" || selectedVehicle === "Seleccione un vehículo" ? "" : selectedVehicle,
        }),
      });
  
      if (response.ok) {
        Alert.alert('Guardado', 'El cuestionario se ha guardado correctamente en la colección de cuestionarios.');
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar el cuestionario.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el cuestionario en la colección de cuestionarios.');
    }
  };

  const checkAndSaveCompleteAnswer = async () => {
    if (!questionnaire) return;

    const allAnswered = questionnaire.sections.every(section =>
      section.questions.every(question => question.answer && question.answer.trim() !== '')
    );

    if (allAnswered) {
      await saveAnswer();
      await clearQuestionnaireAnswers();
    } else {
      console.log("El cuestionario no está completamente respondido. Solo se guardó en 'questionnaires'.");
    }
  };

  const saveAnswer = async () => {
    if (!questionnaire) return;
  
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await makeProtectedRequest(`${BASE_2_URL}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          questionnaireId: id,
          sections: questionnaire.sections,
          vehiculo: selectedVehicle === "" || selectedVehicle === "Seleccione un vehículo" ? "" : selectedVehicle,
        }),
      });
  
      if (response.ok) {
        Alert.alert('Guardado', 'El cuestionario se ha guardado correctamente en la colección de respuestas.');
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar las respuestas.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el cuestionario en la colección de respuestas.');
      console.error('Error al guardar respuestas:', error);
    }
  };

  const clearQuestionnaireAnswers = async () => {
    if (!questionnaire) return;

    const clearedSections = questionnaire.sections.map(section => ({
      ...section,
      questions: section.questions.map(question => ({
        ...question,
        answer: ""
      }))
    }));

    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: clearedSections,
          vehiculo: "",
        }),
      });

      if (response.ok) {
        setQuestionnaire({ ...questionnaire, sections: clearedSections });
        setSelectedVehicle("");
      }
    } catch (error) {
      console.error('Error al limpiar las respuestas del cuestionario:', error);
    }
  };

  const handleVehicleSelection = (itemValue: string) => {
    setSelectedVehicle(itemValue || "");
  };

  useEffect(() => {
    if (!questionnaire) return;

    const totalQuestions = questionnaire.sections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = questionnaire.sections.reduce(
      (sum, section) => sum + section.questions.filter(q => q.answer && q.answer.trim() !== '').length,
      0
    );

    const vehicleSelected = selectedVehicle !== "" && selectedVehicle !== "Seleccione un vehículo";

    const calculatedProgress = (answeredQuestions + (vehicleSelected ? 1 : 0)) / (totalQuestions + 1);
    setProgress(calculatedProgress);

  }, [selectedVehicle, questionnaire]);


  useEffect(() => {
    if (!questionnaire) return;

    const missingQuestions: string[] = [];

    questionnaire.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (!question.answer || question.answer.trim() === "") {
          missingQuestions.push(question.text);
        }
      });
    });

    if (selectedVehicle === "" || selectedVehicle === "Seleccione un vehículo") { 
      missingQuestions.push("Seleccione un vehículo");
    }

    setIncompleteQuestions(missingQuestions);
  }, [questionnaire, selectedVehicle]);

  const isQuestionnaireComplete = incompleteQuestions.length === 0 && selectedVehicle !== "Seleccione un vehículo";

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 16, paddingTop: 30 }}>
        <View style={[tw`bg-white rounded-lg mb-4 w-full max-w-md`, { marginTop: 20 }]}>
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
                    onValueChange={handleVehicleSelection}
                  >
                    {machineModels.map((model, index) => (
                      <Picker.Item 
                        key={index} 
                        label={model} 
                        value={model} 
                      />
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
                          value={question.answer || ''}
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

              <View style={tw`mt-6`}>
                <Text style={tw`font-bold text-lg`}>Estado del Cuestionario:</Text>
                <View style={tw`flex-row items-center mt-2`}>
                  <Text style={tw`text-sm`}>
                    {isQuestionnaireComplete ? "El cuestionario está completo." : "Faltan preguntas por responder."}
                  </Text>
                  {isQuestionnaireComplete && (
                    <View style={[tw`ml-2 rounded-full bg-green-500`, { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }]}>
                      <FontAwesome name="check" size={16} color="white" style={tw`text-center`} />
                    </View>
                  )}
                </View>

                {!isQuestionnaireComplete && (
                  <View style={tw`mt-4`}>
                    <Text style={tw`text-sm font-semibold`}>Preguntas faltantes:</Text>
                    <View style={tw`bg-gray-200 p-2 rounded-lg mt-2`}>
                      {incompleteQuestions.map((question, index) => (
                        <Text key={index} style={tw`text-sm`}>- {question}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
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
