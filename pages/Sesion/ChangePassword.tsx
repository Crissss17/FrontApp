import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Spinner from 'react-native-loading-spinner-overlay'; 
import { BASE_URL } from '../../config';
import { logout } from '../../services/authUtils';

import FondoApp from '../../assets/Fondo_App.png';

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      if (response.ok) {
        await AsyncStorage.clear(); 
        setLoading(false);
        Alert.alert('Éxito', 'Tu contraseña ha sido cambiada correctamente.', [
          {
            text: 'Ok',
            onPress: () => logout(navigation), 
          },
        ]);
      } else {
        setLoading(false);
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Hubo un problema al cambiar la contraseña.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error al cambiar la contraseña:', error);
      Alert.alert('Error', 'Hubo un problema al conectarse con el servidor.');
    }
  };

  return (
    <ImageBackground
      source={FondoApp}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <Spinner visible={loading} textContent={'Procesando...'} textStyle={tw`text-white`} />
      <ScrollView contentContainerStyle={tw`flex-grow items-center p-4`} showsVerticalScrollIndicator={false}>
        <View style={tw`bg-white p-6 shadow-lg rounded-xl w-full max-w-md`}>
          <Text style={tw`text-xl text-center text-gray-700 mb-4 font-semibold`}>
            Cambiar Contraseña
          </Text>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mb-4`}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mb-4`}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Confirmar Nueva Contraseña"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleChangePassword}
            style={tw`bg-blue-500 rounded-xl py-3 px-6 justify-center items-center`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default ChangePassword;
