import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Importa el hook de navegación
import { makeProtectedRequest } from '../../services/api-utils';  // Asegúrate de que la ruta esté correcta
import { Questionnaire } from './Questionnaire';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';


type QuestionnaireListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'QuestionnaireList'
>;

const QuestionnaireList = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const navigation = useNavigation<QuestionnaireListScreenNavigationProp>(); // Hook de navegación

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response = await makeProtectedRequest('http://localhost:3001/questionnaires');
        const data = await response.json();
        setQuestionnaires(data);
      } catch (error) {
        console.error('Error al obtener los cuestionarios:', error);
      }
    };

    fetchQuestionnaires();
  }, []);

  const handleQuestionnairePress = (id: string) => {
    navigation.navigate('QuestionnaireScreen', { id });
  };

  return (
    <View>
      {questionnaires.length > 0 ? (
        questionnaires.map(q => (
          <TouchableOpacity key={q._id} onPress={() => handleQuestionnairePress(q._id)}>
            <Text>{q.name}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text>No hay cuestionarios disponibles</Text>
      )}
    </View>
  );
};

export default QuestionnaireList;
