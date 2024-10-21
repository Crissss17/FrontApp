import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../services/authUtils';

const TokenScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { accessToken, refreshToken } = route.params;

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-100 p-4`}>
      <Ionicons name="key-outline" size={64} color="gray" style={tw`mb-6`} />
      
      <Text style={tw`text-xl text-black mb-2`}>Tokens de Autenticación</Text>

      <Text style={tw`text-lg text-black mb-2`}>AccessToken:</Text>
      <View style={tw`bg-gray-200 p-2 rounded-lg mb-4 w-full`}>
        <Text style={tw`text-base text-black`}>{accessToken}</Text>
      </View>

      <Text style={tw`text-lg text-black mb-2`}>RefreshToken:</Text>
      <View style={tw`bg-gray-200 p-2 rounded-lg mb-4 w-full`}>
        <Text style={tw`text-base text-black`}>{refreshToken}</Text>
      </View>
      
      <TouchableOpacity
        onPress={() => logout(navigation)}
        style={tw`bg-red-500 rounded-lg mt-5 py-3 px-6 justify-center items-center`}
      >
        <Text style={tw`text-white text-lg font-semibold`}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TokenScreen;
