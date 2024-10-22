import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
const FondoApp = require('../assets/Fondo_App.png');

type RegisterScreenProp = StackNavigationProp<RootStackParamList, 'Register'>;

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passVerifi, setPassVerifi] = useState('');
  const navigation = useNavigation<RegisterScreenProp>();

  const handleSubmit = async () => {
    if (pass !== passVerifi) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    Alert.alert('Éxito!', 'Te has registrado correctamente.', [
      {
        text: 'Ok',
        onPress: () => navigation.navigate('Login'),
      },
    ]);
  };

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover"
    >
      <View style={tw`flex-1 justify-center items-center`}>
        <View style={tw`bg-white w-80 p-6 shadow-lg rounded-xl flex flex-col gap-4 justify-center`}>
          <Text style={tw`text-center text-xl text-gray-700 mb-4`}>Regístrate</Text>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2`}>
            <Ionicons name="person-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="none"
            />
          </View>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="person-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Apellido"
              value={apellidos}
              onChangeText={setApellido}
              autoCapitalize="none"
            />
          </View>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="mail-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Correo Electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Contraseña"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
            />
          </View>

          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Repite tu contraseña"
              value={passVerifi}
              onChangeText={setPassVerifi}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={tw`bg-black rounded-xl mt-4 py-3 justify-center items-center`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw`text-center text-gray-500 mt-4`}>¿Ya tienes cuenta? Ingresa aquí!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Register;
