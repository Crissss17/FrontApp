import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { BASE_URL } from '../../config';

import FondoApp from '../../assets/Fondo_App.png';

const ForgotPass: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un correo válido.');
      return;
    }

    try {
      setLoading(true); // Mostrar indicador de carga
      const response = await fetch(`${BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert(
          'Éxito',
          'Se ha enviado una nueva contraseña a tu correo.',
          [
            {
              text: 'Ok',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo recuperar la contraseña.');
      }
    } catch (error) {
      console.error('Error al recuperar la contraseña:', error);
      Alert.alert('Error', 'Hubo un problema al conectarse con el servidor.');
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <View style={tw`flex-1 justify-center items-center`}>
        <View style={tw`bg-white w-80 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center`}>
          <View style={tw`items-center mb-4`}>
            <Ionicons name="mail-outline" size={64} color="gray" />
          </View>
          <Text style={tw`text-center text-xl text-gray-700 mb-2`}>Recuperar Contraseña</Text>
          
          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2`}>
            <Ionicons name="mail-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base h-12 px-2`} // Altura fija para mantener el diseño
              placeholder="Correo Electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlignVertical="center" // Centra el texto verticalmente
              multiline={false} // Deshabilita múltiples líneas
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSubmit}
            style={tw`bg-black rounded-xl mt-4 py-3 justify-center items-center`}
            disabled={loading}
          >
            <Text style={tw`text-white text-lg font-semibold`}>
              {loading ? 'Procesando...' : 'Recuperar Contraseña'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default ForgotPass;
