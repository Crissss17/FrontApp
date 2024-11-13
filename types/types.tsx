import { createStackNavigator } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;  
  Register: undefined;  
  ForgotPass: undefined;  
  HomeLogin: { accessToken: string; refreshToken: string; userId: string }; 
  PageToken: { accessToken: string; refreshToken: string };  
  CreateQuestionnaire: undefined;
  QuestionnaireList: undefined;
  QuestionnaireScreen: { id: string; userId?: string };
  UserHistoryScreen: undefined;
  QuestionnaireDetails: { answerId: string };
};






export const Stack = createStackNavigator<RootStackParamList>();


