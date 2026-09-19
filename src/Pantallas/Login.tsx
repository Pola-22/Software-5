import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../config/supabase';

export default function Login({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  // Función principal de Inicio de Sesión (HU-03)
  const handleLogin = async () => {
    // 1. Validar campos vacíos
    if (!correo.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setCargando(true);

    try {
      // 2. Consultar el usuario en la tabla 'login' en Supabase
      const { data: usuario, error } = await supabase
        .from('login')
        .select('*')
        .eq('correo', correo.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      // 3. Validar existencia y coincidencia de contraseña (admite columna 'password' o 'contrasena')
      const contrasenaBD = usuario?.password || usuario?.contrasena;
      if (!usuario || contrasenaBD !== password) {
        Alert.alert('Acceso denegado', 'Correo o contraseña incorrectos.');
        setCargando(false);
        return;
      }

      // 4. Criterio de Aceptación HU-03: Denegar acceso si la cuenta no está activa
      const estadoActual = usuario.estado || usuario.rol;
      if (
        estadoActual === 'Pendiente' ||
        estadoActual === 'Pendiente/Inactivo' ||
        usuario.estado === 'Inactivo'
      ) {
        Alert.alert(
          'Acceso restringido',
          'Tu cuenta se encuentra en estado PENDIENTE de aprobación por un administrador.'
        );
        setCargando(false);
        return;
      }

      // 5. Redirección basada en ROL (HU-03)
      if (usuario.rol === 'Admin') {
        Alert.alert('Bienvenido Admin', `Hola, ${usuario.correo}`);
        // Redirige al panel del Administrador (HU-02)
        navigation.navigate('GestionUsuarios'); 
      } else if (usuario.rol === 'Cliente') {
        // Redirige al perfil del Cliente (HU-04) enviando los datos del usuario
        navigation.navigate('PerfilCliente', { usuario });
      } else {
        Alert.alert('Error de rol', 'Tu cuenta no tiene un rol válido asignado.');
      }

    } catch (error: any) {
      Alert.alert('Error al ingresar', error.message || 'Ocurrió un error inesperado.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Iniciar Sesión</Text>

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
        secureTextEntry={true}
      />

      {/* Botón principal de Ingreso */}
      <TouchableOpacity
        style={[styles.boton, styles.botonIngresar, cargando && styles.botonDeshabilitado]}
        onPress={handleLogin}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Ingresar</Text>
        )}
      </TouchableOpacity>

      {/* Botón secundario para Ir al Registro */}
      <TouchableOpacity
        style={[styles.boton, styles.botonRegistro]}
        onPress={() => navigation.navigate('Registro')}
      >
        <Text style={styles.textoBoton}>Solicitar Acceso (Registrarse)</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    fontSize: 16,
  },
  boton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonIngresar: {
    backgroundColor: '#007BFF',
  },
  botonRegistro: {
    backgroundColor: '#841584',
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