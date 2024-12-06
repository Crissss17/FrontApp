import { createStackNavigator } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;  
  Register: undefined;  
  ForgotPass: undefined;  
  ChangePassword: { userId: string };
  HomeLogin: { accessToken?: string; refreshToken?: string; userId?: string }; 
  PageToken: { accessToken: string; refreshToken: string };  
  CreateQuestionnaire: undefined;
  QuestionnaireList: undefined;
  QuestionnaireScreen: { id: string; userId?: string };
  UserHistoryScreen: undefined;
  QuestionnaireDetails: { answerId: string };
  CreateMachine: undefined;
  Creater: undefined;
};



export const Stack = createStackNavigator<RootStackParamList>();


