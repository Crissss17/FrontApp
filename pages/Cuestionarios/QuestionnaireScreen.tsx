import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

// Define el tipo de parámetros que pasas a esta pantalla
type RootStackParamList = {
  QuestionnaireScreen: { id: string };
};

type QuestionnaireScreenProps = StackScreenProps<RootStackParamList, 'QuestionnaireScreen'>;

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ route }) => {
  const { id } = route.params;

  useEffect(() => {
    console.log('ID del cuestionario:', id);
    // Aquí podrías realizar la llamada al backend para obtener los detalles del cuestionario con este ID
  }, [id]);

  return (
    <View>
      <Text>Cuestionario ID: {id}</Text>
    </View>
  );
};

export default QuestionnaireScreen;
