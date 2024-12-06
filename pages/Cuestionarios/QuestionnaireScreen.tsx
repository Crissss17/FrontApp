import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ImageBackground, TextInput, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL, BASE_URL } from '../../config';
import axiosInstance from '../../services/axiosIntance';
import * as LocalAuthentication from 'expo-local-authentication'; 
import * as Location from 'expo-location';
import tw from 'twrnc';
import * as Progress from 'react-native-progress';
import FondoApp from '../../assets/Fondo_App.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Questionnaire } from './Questionnaire';
import { RootStackParamList } from '../../types/types';
import * as ImagePicker from 'expo-image-picker';

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 500 * 1024 * 1024;



type QuestionnaireScreenProps = StackScreenProps<RootStackParamList, 'QuestionnaireScreen'>;

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [machineModels, setMachineModels] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [totalImageSize, setTotalImageSize] = useState<number>(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('accessToken');
  };

  const uriToBlob = async (uri: string): Promise<{ blob: Blob; size: number }> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return { blob, size: blob.size };
  };

  const verifyBiometric = async () => {
    try {
      const isBiometricSupported = await LocalAuthentication.hasHardwareAsync();
      if (!isBiometricSupported) {
        Alert.alert('Error', 'El dispositivo no soporta autenticación biométrica.');
        return false;
      }
  
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No hay datos biométricos registrados en este dispositivo.');
        return false;
      }
  
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad para enviar el cuestionario',
        cancelLabel: 'Cancelar',
      });
  
      if (!authResult.success) {
        Alert.alert('Error', 'Autenticación biométrica fallida.');
        return false;
      }
  
      const biometricId = 'biometric_' + (await AsyncStorage.getItem('userId'));
      const response = await fetch(`${BASE_URL}/users/verify-biometric`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ biometricId }),
      });
  
      if (response.ok) {
        return true;
      } else {
        Alert.alert('Error', 'Los datos biométricos no coinciden.');
        return false;
      }
    } catch (error) {
      console.error('Error en la autenticación biométrica:', error);
      Alert.alert('Error', 'Hubo un problema con la autenticación biométrica.');
      return false;
    }
  };

  const fetchQuestionnaire = async () => {
    try {
      const token = await fetchToken();
      if (!token) throw new Error('Token no encontrado');
  
      const response = await makeProtectedRequest(`${BASE_2_URL}/questionnaires/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (!data || !data.sections || data.sections.length === 0) {
        throw new Error('Datos del cuestionario incompletos o no encontrados');
      }
  
      setQuestionnaire(data);
      setSelectedVehicle(data.vehiculo || '');
    } catch (error) {
      console.error('Error al obtener el cuestionario:', error);
      Alert.alert('Error', 'No se pudo cargar el cuestionario. Por favor, inténtelo más tarde.');
    }
  };
  
  const fetchMachineModels = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await fetchToken();

      if (userId && token) {
        const response = await makeProtectedRequest(`${BASE_URL}/users/${userId}/machines`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const models = data
          .map((machine: { model: string }) => machine.model)
          .filter((model: string) => typeof model === 'string' && model.trim().length > 0);

        setMachineModels(['Seleccione un vehículo', ...models]);
      }
    } catch (error) {
      console.error('Error al obtener los modelos de las máquinas:', error);
      setMachineModels(['Seleccione un vehículo', 'Sin modelos disponibles']);
    }
  };

  useEffect(() => {
    fetchQuestionnaire();
    fetchMachineModels();
  }, [id]);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permiso de ubicación denegado.');
      return null;
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    return { latitude: coords.latitude, longitude: coords.longitude };
  };

  const handleSaveChanges = async () => {
    
    try {
      // Obtener ubicación
      const userLocation = await getLocation();
      if (!userLocation) {
        Alert.alert('Error', 'No se pudo obtener la ubicación. Verifica los permisos.');
        return;
      }
      setLocation(userLocation);

      // Verificar autenticación biométrica
      const isBiometricSupported = await LocalAuthentication.hasHardwareAsync();
      if (!isBiometricSupported) {
        Alert.alert('Error', 'El dispositivo no soporta autenticación biométrica.');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No hay datos biométricos registrados en este dispositivo.');
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad',
        cancelLabel: 'Cancelar',
      });

      if (!authResult.success) {
        Alert.alert('Error', 'Autenticación fallida. No puedes enviar el cuestionario.');
        return;
      }

      // Si todo es exitoso, proceder a guardar
      await postToAnswers(userLocation);
      navigation.navigate('QuestionnaireList');
    } catch (error) {
      console.error('Error al autenticar:', error);
      Alert.alert('Error', 'Hubo un problema con la autenticación biométrica.');
    }
  };

  const postToAnswers = async (userLocation: { latitude: number; longitude: number }) => {
    try {
      if (!questionnaire || !questionnaire.sections) {
        throw new Error('El cuestionario o sus secciones no están disponibles.');
      }

      const formattedSections = questionnaire.sections.map((section) => ({
        name: section.name,
        questions: section.questions.map((question) => ({
          questionId: question._id.toString(),
          response: question.answer || '',
        })),
      }));

      const questionnaireData = {
        userId: await AsyncStorage.getItem('userId'),
        questionnaireId: questionnaire._id.toString(),
        vehiculo: selectedVehicle || '',
        sections: formattedSections,
        location: userLocation, // Añadir la ubicación al payload
      };

      console.log('Enviando datos al backend...', questionnaireData);

      const response = await axiosInstance.post('/answers', questionnaireData);

      if (response.status === 200 || response.status === 201) {
        const createdAnswerId = response.data._id;
        console.log('Cuestionario creado con ID:', createdAnswerId);

        if (images.length > 0) {
          await uploadImages(createdAnswerId);
        }

        Alert.alert('Éxito', 'El cuestionario y las imágenes se han guardado correctamente.');
        navigation.navigate('QuestionnaireList');
      } else {
        Alert.alert('Error', 'No se pudo guardar el cuestionario.');
      }
    } catch (error: any) {
      console.error('Error en postToAnswers:', error.message);
      Alert.alert('Error', 'Hubo un problema al enviar los datos. Revisa las preguntas y respuestas.');
    }
  };
  
  const handleAnswer = (sectionIndex: number, questionIndex: number, answer: string) => {
    if (questionnaire) {
      const updatedSections = [...questionnaire.sections];
      updatedSections[sectionIndex].questions[questionIndex].answer = answer;
      setQuestionnaire({ ...questionnaire, sections: updatedSections });
    }
  };
  const uploadImages = async (answerId: string) => {
    try {
      const formData = new FormData();

      images.forEach((imageUri, index) => {
        const cleanUri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');
        const fileType = cleanUri.split('.').pop();
        formData.append('files', {
          uri: cleanUri,
          type: `image/${fileType}`,
          name: `image-${index}.${fileType}`,
        } as any);
      });

      console.log('Enviando imágenes al backend...');
      const response = await axiosInstance.post(`/answers/${answerId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log('Imágenes subidas correctamente');
      } else {
        Alert.alert('Error', 'No se pudieron subir las imágenes.');
      }
    } catch (error: any) {
      console.error('Error en uploadImages:', error.message);
      Alert.alert('Error', 'Hubo un problema al subir las imágenes.');
    }
  };

  const handleGallery = async () => {
    if (images.length >= MAX_IMAGE_COUNT) {
      Alert.alert('Límite de imágenes alcanzado', `Solo puedes agregar hasta ${MAX_IMAGE_COUNT} imágenes.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;
        const { size } = await uriToBlob(imageUri);
        if (totalImageSize + size > MAX_IMAGE_SIZE_BYTES) {
          Alert.alert('Error', 'El tamaño total de las imágenes excede el límite permitido.');
          return;
        }

        setImages((prev) => [...prev, imageUri]);
        setTotalImageSize(totalImageSize + size);
      }
    } catch (error) {
      console.error('Error al abrir la galería:', error);
    }
  };

  const handleCamera = async () => {
    if (images.length >= MAX_IMAGE_COUNT) {
      Alert.alert('Límite de imágenes alcanzado', `Solo puedes agregar hasta ${MAX_IMAGE_COUNT} imágenes.`);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;

        const { size } = await uriToBlob(imageUri);
        if (totalImageSize + size > MAX_IMAGE_SIZE_BYTES) {
          Alert.alert('Error', 'El tamaño total de las imágenes excede el límite permitido.');
          return;
        }

        setImages((prev) => [...prev, imageUri]);
        setTotalImageSize(totalImageSize + size);
      }
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
    }
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      const removedImageUri = updatedImages.splice(index, 1)[0];

      uriToBlob(removedImageUri).then(({ size }) => {
        setTotalImageSize((prevSize) => prevSize - size);
      });

      return updatedImages;
    });
  };

  const handleVehicleSelection = (itemValue: string) => {
    setSelectedVehicle(itemValue || '');
  };

  useEffect(() => {
    if (!questionnaire) return;

    const totalQuestions = questionnaire.sections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = questionnaire.sections.reduce(
      (sum, section) => sum + section.questions.filter((q) => q.answer?.trim() !== '').length,
      0
    );

    const vehicleSelected = selectedVehicle !== '' && selectedVehicle !== 'Seleccione un vehículo';
    setProgress((answeredQuestions + (vehicleSelected ? 1 : 0)) / (totalQuestions + 1));
  }, [selectedVehicle, questionnaire]);

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
                  <Picker selectedValue={selectedVehicle} onValueChange={handleVehicleSelection}>
                    {machineModels.map((model, index) => (
                      <Picker.Item key={index} label={model} value={model} />
                    ))}
                  </Picker>
                </View>
              </View>
                          
              {questionnaire?.sections.map((section, sectionIndex) => (
                <View key={`section-${section._id || sectionIndex}`} style={tw`mb-6 w-full`}>
                  <Text style={tw`text-xl font-bold mb-4`}>Sección {sectionIndex + 1}: {section.name}</Text>
                  {section.questions.map((question, questionIndex) => (
                    <View key={`question-${section._id}-${question._id || questionIndex}`} style={tw`mb-4`}>
                      <Text style={tw`text-lg font-semibold`}>Pregunta {questionIndex + 1}: {question.text}</Text>
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

              <View style={tw`mt-4`}>
                <Text style={tw`font-semibold text-lg`}>Agregar imágenes:</Text>
                <View style={tw`flex-row mt-2`}>
                  <TouchableOpacity onPress={handleCamera} style={tw`bg-blue-500 px-4 py-2 rounded-lg mr-2`}>
                    <Text style={tw`text-white`}>Tomar Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleGallery} style={tw`bg-green-500 px-4 py-2 rounded-lg`}>
                    <Text style={tw`text-white`}>Elegir de Galería</Text>
                  </TouchableOpacity>
                </View>
                <Text style={tw`text-lg mb-2`}>Imágenes añadidas: {images.length}/{MAX_IMAGE_COUNT}</Text>
                <View style={tw`mt-4 flex-row flex-wrap`}>
                  {images.map((imageUri, index) => (
                    <View key={index} style={tw`relative w-20 h-20 mr-2 mb-2`}>
                      <Image source={{ uri: imageUri }} style={tw`w-20 h-20 rounded`} />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        style={tw`absolute top-0 right-0 bg-red-500 w-6 h-6 rounded-full items-center justify-center`}
                      >
                        <Text style={tw`text-white text-xs`}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
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
