import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { makeProtectedRequest } from '../../services/authUtils';
import { BASE_2_URL } from '../../config';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types/types';

const FondoApp = require('../../assets/Fondo_App.png');

type UserHistoryScreenProps = StackScreenProps<RootStackParamList, 'UserHistoryScreen'>;

const UserHistoryScreen: React.FC<UserHistoryScreenProps> = ({ navigation }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnswers = async () => {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await makeProtectedRequest(`${BASE_2_URL}/answers/user-history?userId=${userId}`);
        const data = await response.json();
        setAnswers(data);
      } catch (error) {
        console.error('Error al obtener el historial de respuestas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAnswers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ImageBackground source={FondoApp} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        <View style={[tw`bg-white p-6 rounded-lg m-4`, { alignItems: 'center' }]}>
          <Ionicons name="clipboard-outline" size={64} color="gray" style={tw`mb-6`} />
          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>Historial de Cuestionarios</Text>

          {answers.length > 0 ? (
            answers.map((answer) => (
              <TouchableOpacity
                key={answer._id}
                style={tw`p-4 rounded-lg mb-4 bg-gray-200 w-full`}
                onPress={() => navigation.navigate('QuestionnaireDetails', { answerId: answer._id })}
              >
                <Text style={tw`text-lg font-semibold text-black`}>
                  {answer._id || 'ID Respuesta no disponible'}
                </Text>
                <Text style={tw`text-sm text-gray-600`}>Vehículo: {answer.vehiculo || 'No especificado'}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={tw`text-gray-500 text-center`}>No has respondido ningún cuestionario.</Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default UserHistoryScreen;
