import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function Login({ navigation }: any) {
  // Estados para guardar lo que el usuario escribe (aunque por ahora sea solo visual)
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Loguearse</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address" // Muestra el teclado optimizado para correos (con el @)
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Oculta el texto con puntos por seguridad
      />
      
      <View style={styles.botonContainer}>
        {/* Este botón nos lleva a la pantalla Home (simulando que el login fue exitoso) */}
        <Button 
          title="Ingresar" 
          onPress={() => navigation.navigate('Home')} 
        />
      </View>

      <View style={styles.botonContainer}>
        {/* Este botón nos lleva a la pantalla de Registro */}
        <Button 
          title="Registrarse" 
          color="#841584" // Le ponemos otro color para diferenciarlo
          onPress={() => navigation.navigate('Registro')} 
        />
      </View>
    </View>
  );
}

// Estilos visuales básicos para que se vea ordenado
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonContainer: {
    marginTop: 10,
  }
});