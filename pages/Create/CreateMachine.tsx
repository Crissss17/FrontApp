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
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { BASE_URL } from '../../config';

import FondoApp from '../../assets/Fondo_App.png';

type CreateMachineScreenProp = StackNavigationProp<RootStackParamList, 'CreateMachine'>;

const CreateMachine: React.FC = () => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('activo');
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<CreateMachineScreenProp>();

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
          setAreas(data);
          setSelectedArea(data.length > 0 ? data[0]._id : '');
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

  const handleSubmit = async () => {
    if (!name || !selectedArea) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);

    const machineData = {
      name,
      model,
      status,
      area_id: selectedArea,
    };

    try {
      const response = await fetch(`${BASE_URL}/machines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineData),
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Máquina creada correctamente.', [
          {
            text: 'Ok',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Hubo un problema al crear la máquina.');
      }
    } catch (error) {
      console.error('Error al crear la máquina:', error);
      Alert.alert('Error', 'Hubo un problema al crear la máquina.');
    } finally {
      setLoading(false);
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
          <Text style={tw`text-center text-xl text-gray-700 mb-4`}>Crear Máquina</Text>

          {/* Nombre */}
          <TextInputField placeholder="Nombre de la máquina" value={name} setValue={setName} />

          {/* Modelo */}
          <TextInputField placeholder="Modelo" value={model} setValue={setModel} />

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

          {/* Estado */}
          <View style={tw`border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
            <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)}>
              <Picker.Item label="Activo" value="activo" />
              <Picker.Item label="Inactivo" value="inactivo" />
            </Picker>
          </View>

          {/* Botón de crear */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={tw`bg-black rounded-xl mt-4 py-3 justify-center items-center`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>
              {loading ? 'Cargando...' : 'Crear Máquina'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const TextInputField = ({
  placeholder,
  value,
  setValue,
}: {
  placeholder: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) => (
  <View style={tw`flex-row items-center border rounded-xl bg-gray-100 px-3 py-2 mt-4`}>
    <Ionicons name="cog-outline" size={20} color="gray" style={tw`mr-2`} />
    <TextInput
      style={tw`flex-1 text-base`}
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
    />
  </View>
);

export default CreateMachine;
