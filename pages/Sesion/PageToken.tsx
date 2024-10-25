import { View, Text, ImageBackground, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
const FondoApp = require('../../assets/Fondo_App.png');

const PageToken: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { accessToken = '', refreshToken = '' } = route.params || {};

  return (
    <ImageBackground 
      source={FondoApp} 
      style={{ flex: 1, width: '100%', height: '100%' }} 
      resizeMode="cover">
      <ScrollView contentContainerStyle={tw`flex-1 justify-center items-center p-4`}>
        <View style={tw`bg-white p-4 rounded-lg mb-4 w-full max-w-md items-center`}>
          <Ionicons name="key-outline" size={64} color="gray" style={tw`mb-6`} />
          <Text style={tw`text-2xl text-black mb-4 font-semibold text-center`}>Tokens de Autenticación</Text>

          <Text style={tw`text-lg text-black mb-2 font-semibold`}>AccessToken:</Text>
          <View style={tw`bg-gray-200 p-2 rounded-md mb-4 w-full`}>
            {/* En lugar de 'break-all', usa flexWrap o ajusta la vista para mostrar el texto largo */}
            <Text style={[tw`text-sm text-black`, { flexWrap: 'wrap' }]}>{accessToken}</Text>
          </View>

          <Text style={tw`text-lg text-black mb-2 font-semibold`}>RefreshToken:</Text>
          <View style={tw`bg-gray-200 p-2 rounded-md mb-4 w-full`}>
            <Text style={[tw`text-sm text-black`, { flexWrap: 'wrap' }]}>{refreshToken}</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default PageToken;
