import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function Registro({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Cuenta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nuevo correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} 
      />
      
      <View style={styles.botonContainer}>
        {/* El botón enviar me manda directo al Login por el momento */}
        <Button 
          title="Enviar" 
          onPress={() => navigation.navigate('Login')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#e6f7ff', // Un fondo celestito claro para diferenciarla
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#0059b3',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  botonContainer: {
    marginTop: 10,
  }
});