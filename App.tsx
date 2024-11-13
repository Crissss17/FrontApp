import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/Sesion/Login';
import PageToken from './pages/Sesion/PageToken';
import Register from './pages/Sesion/Register';
import ForgotPass from './pages/Sesion/ForgotPass';
import QuestionnaireList from './pages/Cuestionarios/QuestionnaireList';
import QuestionnaireScreen from './pages/Cuestionarios/QuestionnaireScreen';
import { isTokenExpired } from './services/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeLogin from './pages/Sesion/HomeLogin';
import { RootStackParamList } from './types/types';
import CreateQuestionnaire from './pages/Cuestionarios/CreateQuestionnaire';
import UserHistoryScreen from './pages/Sesion/UserHistoryScreen';
import QuestionnaireDetails from './pages/Sesion/QuestionnaireDetails';


const Stack = createStackNavigator<RootStackParamList>(); 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken && !isTokenExpired(accessToken)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'Login'}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ForgotPass" component={ForgotPass} />
        <Stack.Screen name="HomeLogin" component={HomeLogin} />
        <Stack.Screen name="PageToken" component={PageToken} />
        <Stack.Screen name="QuestionnaireList" component={QuestionnaireList} />
        <Stack.Screen name="CreateQuestionnaire" component={CreateQuestionnaire} />
        <Stack.Screen name="QuestionnaireScreen" component={QuestionnaireScreen}/>
        <Stack.Screen name="QuestionnaireDetails" component={QuestionnaireDetails}/>
        <Stack.Screen name="UserHistoryScreen" component={UserHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
