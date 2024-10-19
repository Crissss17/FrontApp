import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { makeProtectedRequest } from '../services/authUtils';

const ProtectedComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeProtectedRequest('http://localhost:8082/protected-endpoint');
        const data = await response.json();
        setData(data);
      } catch (err) {
        const errorMessage = (err as Error).message || 'Ocurrió un error';
        setError(errorMessage);
      }
    };
  
    fetchData();
  }, []);
  

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!data) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View>
      <Text>Datos protegidos: {JSON.stringify(data)}</Text>
    </View>
  );
};

export default ProtectedComponent;
