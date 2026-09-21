import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../config/supabase';

export default function RegistroScreen() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    const correoLimpio = correo.trim().toLowerCase();

    // Validar correo
    if (!correoLimpio.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Validar contraseña (entre 6 y 10 caracteres)
    if (password.length < 6 || password.length > 10) {
      Alert.alert('Error', 'La contraseña debe tener entre 6 y 10 caracteres.');
      return;
    }

    setCargando(true);

    try {
      // Validar si el usuario ya existe en la base de datos
      const { data: usuarioExistente } = await supabase
        .from('login')
        .select('correo')
        .eq('correo', correoLimpio)
        .maybeSingle();

      if (usuarioExistente) {
        Alert.alert('Usuario ya registrado', 'Ya existe una cuenta vinculada a este correo electrónico.');
        setCargando(false);
        return;
      }

      // Inserción en la tabla 'login'
      const { error } = await supabase
        .from('login')
        .insert([
          { 
            correo: correoLimpio, 
            password: password, 
            rol: 'Cliente', 
            estado: 'Pendiente/Inactivo' 
          }
        ]);

      if (error) throw error;

      Alert.alert(
        'Registro Exitoso', 
        'Tu cuenta ha sido creada. Un administrador debe aprobarla para que puedas ingresar.'
      );
      
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
        placeholder="Contraseña (6 a 10 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        maxLength={10}
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