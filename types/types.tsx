import { createStackNavigator } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;  // No recibe parámetros
  Register: undefined;  // No recibe parámetros
  ForgotPass: undefined;  // No recibe parámetros
  TokenScreen: { accessToken: string; refreshToken: string };  // Recibe tokens
  QuestionnaireList: undefined;
  QuestionnaireScreen: { id: string };  
};


export const Stack = createStackNavigator<RootStackParamList>();


