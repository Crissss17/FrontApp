import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { logout } from '../services/authUtils';

const TokenScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  // Extraemos los tokens desde los parámetros de la ruta
  const { accessToken, refreshToken } = route.params;

  return (
    <View style={tw`flex-1 justify-center items-center bg-[#95D5B2] p-4`}>
      <Text style={tw`text-2xl text-black mb-4`}>Tokens de Autenticación</Text>
      
      <Text style={tw`text-lg text-black mb-2`}>AccessToken:</Text>
      <View style={tw`bg-[#1B4332] p-2 rounded-lg mb-4 max-w-[90%]`}>
        <Text style={tw`text-base text-white break-words`}>{accessToken}</Text>
      </View>

      <Text style={tw`text-lg text-black mb-2`}>RefreshToken:</Text>
      <View style={tw`bg-[#1B4332] p-2 rounded-lg mb-4 max-w-[90%]`}>
        <Text style={tw`text-base text-white break-words`}>{refreshToken}</Text>
      </View>
      {/* Pasamos navigation al logout */}
      <TouchableOpacity onPress={() => logout(navigation)} style={tw`bg-red-500 rounded-lg mt-5 text-xl py-2 px-4 justify-center items-center`}>
        <Text style={tw`text-white`}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TokenScreen;
