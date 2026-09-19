import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../config/supabase'; // Importamos la conexión a la BD

export default function RegistroScreen() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    // 1. Validación solicitada en la HU-01
    if (!correo.includes('@') || password.length < 6) {
      Alert.alert('Error', 'Por favor ingresa un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    try {
      // 2. Inserción en la tabla 'login' de Supabase
      const { error } = await supabase
        .from('login')
        .insert([
          { 
            correo: correo.toLowerCase(), 
            password: password, 
            rol: 'Cliente', // Asignamos el rol por defecto
            estado: 'Pendiente/Inactivo' // Estado inicial según HU-01
          }
        ]);

      // Si Supabase devuelve un error (por ejemplo, correo duplicado), lo lanzamos
      if (error) throw error;

      // 3. Mensaje de éxito según criterios de aceptación
      Alert.alert(
        'Registro Exitoso', 
        'Tu cuenta ha sido creada. Un administrador debe aprobarla para que puedas ingresar.'
      );
      
      // Limpiamos el formulario
      setCorreo('');
      setPassword('');

    } catch (error: any) {
      Alert.alert('Error en el registro', error.message || 'No se pudo completar el registro');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Solicitar Acceso</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.boton, cargando && styles.botonDeshabilitado]} 
        onPress={handleRegistro}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando ? 'Registrando...' : 'Registrarme'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  boton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#9bc9ff',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});