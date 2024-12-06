import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../../config'; 
import * as LocalAuthentication from 'expo-local-authentication';

import FondoApp from '../../assets/Fondo_App.png';

type RegisterScreenProp = StackNavigationProp<RootStackParamList, 'Register'>;

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passVerifi, setPassVerifi] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressAdditional, setAddressAdditional] = useState('');
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const navigation = useNavigation<RegisterScreenProp>();

  // Fetch areas from the backend
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`${BASE_URL}/areas`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAreas(data); // Actualiza el estado con las áreas obtenidas
          setSelectedArea(data.length > 0 ? data[0]._id : ''); // Selecciona la primera área por defecto
        } else {
          Alert.alert('Error', 'No se pudieron cargar las áreas.');
        }
      } catch (error) {
        console.error('Error al cargar las áreas:', error);
        Alert.alert('Error', 'Hubo un problema al cargar las áreas.');
      }
    };

    fetchAreas();
  }, []);

  const handleBiometricRegistration = async (userId: string) => {
    try {
      const isBiometricSupported = await LocalAuthentication.hasHardwareAsync();
      if (!isBiometricSupported) {
        Alert.alert('Error', 'El dispositivo no soporta autenticación biométrica.');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No hay datos biométricos registrados en este dispositivo.');
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Registra tu huella para futuros accesos',
        cancelLabel: 'Cancelar',
      });

      if (!authResult.success) {
        Alert.alert('Error', 'Autenticación biométrica fallida.');
        return;
      }

      const biometricId = 'biometric_' + userId;

      const response = await fetch(`${BASE_URL}/users/${userId}/biometric`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ biometricId }),
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Datos biométricos registrados correctamente.');
      } else {
        Alert.alert('Error', 'No se pudieron guardar los datos biométricos.');
      }
    } catch (error) {
      console.error('Error en la autenticación biométrica:', error);
      Alert.alert('Error', 'Hubo un problema con la autenticación biométrica.');
    }
  };

  const handleSubmit = async () => {
    if (pass !== passVerifi) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (!selectedArea) {
      Alert.alert('Error', 'Por favor selecciona un área.');
      return;
    }

    const userData = {
      name: nombre,
      lastName: apellidos,
      email,
      password: pass,
      phone,
      address,
      addressAdditional,
      area_id: selectedArea,
    };

    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const userId = data._id;

        await handleBiometricRegistration(userId);

        Alert.alert('¡Éxito!', 'Te has registrado correctamente.', [
          {
            text: 'Ok',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Hubo un problema al registrarte.');
      }
    } catch (error) {
      console.error('Error al registrar al usuario:', error);
      Alert.alert('Error', 'Hubo un problema al registrar al usuario.');
    }
  };

  return (
    <ImageBackground
      source={FondoApp}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={tw`flex-grow items-center p-4`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`bg-white w-80 p-6 shadow-lg rounded-xl flex flex-col gap-4`}>
          <Text style={tw`text-center text-xl text-gray-700 mb-4`}>Regístrate</Text>

          {/* Nombre */}
          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2`}>
            <Ionicons name="person-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {/* Apellidos */}
          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="person-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Apellidos"
              value={apellidos}
              onChangeText={setApellidos}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
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

          {/* Teléfono */}
          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="call-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Dirección */}
          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="home-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Dirección"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
            />
          </View>

          {/* Dirección adicional */}
          <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Ionicons name="location-outline" size={20} color="gray" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base`}
              placeholder="Información Adicional (Opcional)"
              value={addressAdditional}
              onChangeText={setAddressAdditional}
              autoCapitalize="words"
            />
          </View>

          {/* Área */}
          <View style={tw`border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Picker
              selectedValue={selectedArea}
              onValueChange={(itemValue) => setSelectedArea(itemValue)}
            >
              <Picker.Item label="Selecciona un área" value="" />
              {areas.map((area) => (
                <Picker.Item
                  key={area._id}
                  label={area.description || 'Sin descripción'}
                  value={area._id}
                />
              ))}
            </Picker>
          </View>

          {/* Contraseña */}
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

          {/* Confirmar contraseña */}
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

          {/* Botón de registrar */}
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
      </ScrollView>
    </ImageBackground>
  );
};

export default Register;
