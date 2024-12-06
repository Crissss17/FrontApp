import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import MapView, { Marker } from 'react-native-maps';
import tw from 'twrnc';
import { RootStackParamList } from '../../types/types';
import Icon from 'react-native-vector-icons/Ionicons';

import FondoApp from '../../assets/Fondo_App.png';

type QuestionnaireDetailsProps = StackScreenProps<RootStackParamList, 'QuestionnaireDetails'>;

const QuestionnaireDetails: React.FC<QuestionnaireDetailsProps> = ({ route }) => {
  const { answerId } = route.params;
  const [answerDetails, setAnswerDetails] = useState<any>(null);
  const [questionnaireDetails, setQuestionnaireDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null); // Dirección obtenida
  const [mapKey, setMapKey] = useState<number>(0);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "YourAppName/1.0 (your-email@example.com)",
        },
      });
      const data = await response.json();
  
      if (data && data.address) {
        const { road, state, country } = data.address;
        const formattedAddress = `${road || 'Calle desconocida'}, ${state || 'Región desconocida'}, ${country || 'País desconocido'}`;
        setUserAddress(formattedAddress);
      } else {
        setUserAddress("Dirección no disponible");
      }
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      setUserAddress("Error al obtener la dirección");
    }
  };
  
  

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await makeProtectedRequest(`${BASE_2_URL}/answers/${answerId}`);
      if (!response.ok) throw new Error('Error al obtener los detalles de la respuesta');
      const data = await response.json();
      setAnswerDetails(data);

      if (data.questionnaireId) {
        const questionnaireResponse = await makeProtectedRequest(
          `${BASE_2_URL}/questionnaires/${data.questionnaireId}`
        );
        if (!questionnaireResponse.ok) throw new Error('Error al obtener detalles del cuestionario');
        const questionnaireData = await questionnaireResponse.json();
        setQuestionnaireDetails(questionnaireData);
      }

      if (data.location?.latitude && data.location?.longitude) {
        setUserLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
        fetchAddress(data.location.latitude, data.location.longitude); // Llamar a la geocodificación inversa
        setMapKey((prevKey) => prevKey + 1);
      } else {
        setUserLocation(null);
        setUserAddress('Ubicación no disponible');
      }
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los detalles del cuestionario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [answerId]);

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={tw`mt-4 text-lg font-semibold text-gray-700`}>Cargando detalles...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View style={[tw`bg-white rounded-lg w-full max-w-md`, { paddingBottom: 20 }]}>
          <View style={{ paddingVertical: 15, backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <Text style={tw`text-2xl font-bold text-center`}>Detalles del Cuestionario</Text>
          </View>

          <View style={tw`p-4`}>
            {answerDetails && questionnaireDetails ? (
              <View style={tw`w-full`}>
                <Text style={tw`text-xl font-semibold mb-2`}>
                  Cuestionario: {questionnaireDetails.name || 'Nombre no disponible'}
                </Text>
                <Text style={tw`text-sm text-gray-500 mb-4`}>
                  Fecha: {formatDate(answerDetails.createdAt)}
                </Text>
                <Text style={tw`text-lg mb-4`}>Vehículo: {answerDetails.vehiculo || 'No especificado'}</Text>
                <Text style={tw`text-xl font-bold mb-2`}>Ubicación:</Text>

                <Text style={tw`text-lg text-gray-700 mb-2`}>
                  Dirección: {userAddress || 'Cargando dirección...'}
                </Text>

                <View style={[styles.mapContainer, tw`mb-6`]}>
                  {userLocation ? (
                    <MapView
                      key={mapKey}
                      style={styles.map}
                      initialRegion={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={userLocation}
                        title="Ubicación del usuario"
                        description="Lugar donde se respondió el cuestionario"
                      />
                    </MapView>
                  ) : (
                    <Text style={tw`text-gray-500`}>Ubicación no disponible</Text>
                  )}
                </View>

                {questionnaireDetails.sections.map((section: any, index: number) => (
                  <View key={index} style={tw`mb-6`}>
                    <Text style={tw`text-xl font-bold mb-2`}>Sección {index + 1}: {section.name}</Text>
                    {section.questions.map((question: any, qIndex: number) => {
                      const userResponse = answerDetails.sections
                        ?.find((s: any) => s.name === section.name)?.questions
                        ?.find((q: any) => q.questionId === question._id);

                      return (
                        <View key={qIndex} style={tw`mb-4`}>
                          <Text style={tw`text-lg font-semibold`}>Pregunta {qIndex + 1}: {question.text}</Text>
                          <Text style={tw`text-lg text-gray-700 mt-1`}>
                            Respuesta: {userResponse?.response || 'Sin respuesta'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}

                {answerDetails.images?.length > 0 && (
                  <View style={tw`mt-6`}>
                    <Text style={tw`text-xl font-bold mb-4`}>Imágenes del Cuestionario</Text>
                    <View style={tw`flex-row flex-wrap`}>
                      {answerDetails.images.map((imageUri: string, index: number) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setExpandedImage(`${BASE_2_URL}/${imageUri}`)}
                          style={tw`w-1/2 p-2`}
                        >
                          <Image
                            source={{ uri: `${BASE_2_URL}/${imageUri}` }}
                            style={tw`w-full h-40 rounded-lg`}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={tw`text-center text-gray-500`}>No se encontraron detalles para este cuestionario.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {expandedImage && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!expandedImage}
          onRequestClose={() => setExpandedImage(null)}
        >
          <View style={styles.modalContainer}>
            <Image
              source={{ uri: expandedImage }}
              style={styles.expandedImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setExpandedImage(null)}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'red',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default QuestionnaireDetails;
