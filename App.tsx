import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/Sesion/Login';
import PageToken from './pages/Home/PageToken';
import Register from './pages/Sesion/Register';
import ForgotPass from './pages/Sesion/ForgotPass';
import QuestionnaireList from './pages/Cuestionarios/QuestionnaireList';
import QuestionnaireScreen from './pages/Cuestionarios/QuestionnaireScreen';
import { isTokenExpired } from './services/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeLogin from './pages/Home/HomeLogin';
import { RootStackParamList } from './types/types';
import CreateQuestionnaire from './pages/Create/CreateQuestionnaire';
import UserHistoryScreen from './pages/Home/UserHistoryScreen';
import QuestionnaireDetails from './pages/Home/QuestionnaireDetails';
import ChangePassword from './pages/Sesion/ChangePassword';
import Creater from './pages/Create/Creater';
import CreateMachine from './pages/Create/CreateMachine';
import 'react-native-gesture-handler';
import 'react-native-reanimated';


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
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ForgotPass" component={ForgotPass} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="HomeLogin" component={HomeLogin} />
        <Stack.Screen name="PageToken" component={PageToken} />
        <Stack.Screen name="QuestionnaireList" component={QuestionnaireList} />
        <Stack.Screen name="Creater" component={Creater} />
        <Stack.Screen name="CreateMachine" component={CreateMachine} />
        <Stack.Screen name="CreateQuestionnaire" component={CreateQuestionnaire} />
        <Stack.Screen name="QuestionnaireScreen" component={QuestionnaireScreen}/>
        <Stack.Screen name="QuestionnaireDetails" component={QuestionnaireDetails}/>
        <Stack.Screen name="UserHistoryScreen" component={UserHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
