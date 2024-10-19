import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/Login';
import TokenScreen from './pages/TokenScreen';
import { isTokenExpired } from './services/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

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
      <Stack.Navigator initialRouteName={isAuthenticated ? "TokenScreen" : "Login"}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="TokenScreen" component={TokenScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
