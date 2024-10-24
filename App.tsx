import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/Sesion/Login';
import TokenScreen from './pages/Sesion/TokenScreen';
import Register from './pages/Sesion/Register';
import ForgotPass from './pages/Sesion/ForgotPass';
import QuestionnaireList from './pages/Cuestionarios/QuestionnaireList';
import QuestionnaireScreen from './pages/Cuestionarios/QuestionnaireScreen';
import { isTokenExpired } from './services/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;  // No recibe parámetros
  Register: undefined;  // No recibe parámetros
  ForgotPass: undefined;  // No recibe parámetros
  TokenScreen: { accessToken: string; refreshToken: string };  // Recibe tokens
  QuestionnaireList: undefined;
  QuestionnaireScreen: { id: string }; // Define que esta pantalla recibirá un 'id' como parámetro
};

const Stack = createStackNavigator<RootStackParamList>(); // Usar el tipo para definir el Stack

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
      <Stack.Navigator initialRouteName={isAuthenticated ? 'TokenScreen' : 'Login'}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="TokenScreen" component={TokenScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ForgotPass" component={ForgotPass} />
        <Stack.Screen name="QuestionnaireList" component={QuestionnaireList} />
        <Stack.Screen
          name="QuestionnaireScreen"
          component={QuestionnaireScreen}
          options={{ title: 'Cuestionario' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
