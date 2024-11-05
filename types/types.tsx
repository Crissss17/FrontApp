import { createStackNavigator } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;  
  Register: undefined;  
  ForgotPass: undefined;  
  HomeLogin: { accessToken: string; refreshToken: string }; 
  PageToken: { accessToken: string; refreshToken: string };  
  CreateQuestionnaire: undefined;
  QuestionnaireList: undefined;
  QuestionnaireScreen: { id: string }; 
  
};


export const Stack = createStackNavigator<RootStackParamList>();


