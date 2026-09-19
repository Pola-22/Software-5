import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { supabase } from '../config/supabase';

export default function PerfilCliente({ route, navigation }: any) {
  // Recibimos los datos del usuario que inició sesión desde Login.tsx
  const usuarioLogueado = route?.params?.usuario;

  // Estados del formulario para el perfil del cliente
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState(usuarioLogueado?.correo || '');
  const [idCliente, setIdCliente] = useState<number | null>(null);

  const [cargando, setCargando] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [listaClientes, setListaClientes] = useState<any[]>([]);

  useEffect(() => {
    if (usuarioLogueado) {
      if (usuarioLogueado.rol === 'Admin') {
        setEsAdmin(true);
        cargarTodosLosClientes();
      } else {
        cargarPerfilCliente();
      }
    }
  }, [usuarioLogueado]);

  // 1. Cargar datos del cliente autenticado desde la tabla 'cliente' (HU-04)
  const cargarPerfilCliente = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .eq('correo', usuarioLogueado.correo)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIdCliente(data.id || data.Id);
        setNombre(data.nombre || data.Nombre || '');
        setApellido(data.apellido || data.Apellido || '');
        setCorreo(data.correo || data.Correo || usuarioLogueado.correo);
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  // 2. Si es Admin, cargar el listado completo de clientes (Criterio HU-04)
  const cargarTodosLosClientes = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase.from('cliente').select('*');
      if (error) throw error;
      setListaClientes(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron obtener los clientes: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  // 3. Guardar o actualizar datos en la tabla 'cliente'
  const guardarPerfil = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error de validación', 'Por favor ingresa tu nombre y apellido.');
      return;
    }

    setCargando(true);
    try {
      if (idCliente) {
        // UPDATE si el cliente ya existía
        const { error } = await supabase
          .from('cliente')
          .update({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            correo: correo.trim().toLowerCase(),
            fecha: new Date().toISOString()
          })
          .eq('id', idCliente);

        if (error) throw error;
      } else {
        // INSERT si es el primer ingreso del cliente
        const { data, error } = await supabase
          .from('cliente')
          .insert([
            {
              nombre: nombre.trim(),
              apellido: apellido.trim(),
              correo: correo.trim().toLowerCase(),
              fecha: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) setIdCliente(data.id || data.Id);
      }

      Alert.alert('Éxito', 'Tus datos personales han sido guardados correctamente.');
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message || 'No se pudieron guardar los cambios.');
    } finally {
      setCargando(false);
    }
  };

  // Si el usuario es Administrador, ve la lista completa de clientes
  if (esAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Listado de Clientes (Modo Admin)</Text>
        <Text style={styles.subtitulo}>Clientes registrados en el sistema</Text>

        {cargando ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={listaClientes}
            keyExtractor={(item) => (item.id || item.Id || item.correo).toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardNombre}>{item.nombre || item.Nombre} {item.apellido || item.Apellido}</Text>
                <Text style={styles.cardCorreo}>{item.correo || item.Correo}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay registros de clientes en este momento.</Text>
            }
          />
        )}

        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.textoBoton}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Vista predeterminada para el Cliente activo
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil del Cliente</Text>
      <Text style={styles.subtitulo}>Consulta y actualiza tus datos personales (HU-04)</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nombre"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu apellido"
            value={apellido}
            onChangeText={setApellido}
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, styles.inputDeshabilitado]}
            value={correo}
            editable={false}
          />

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={guardarPerfil}
            disabled={cargando}
          >
            <Text style={styles.textoBoton}>
              {idCliente ? 'Guardar Cambios' : 'Completar Registro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCerrar}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.textoBoton}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputDeshabilitado: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
  },
  boton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botonCerrar: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonVolver: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#94d3a2',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  cardNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardCorreo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
    fontSize: 15,
  },
});