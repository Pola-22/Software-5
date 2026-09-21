import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../config/supabase';

interface UsuarioPendiente {
  correo: string;
  rol: string;
  estado: string;
}

export default function GestionUsuario({ navigation }: any) {
  const [usuarios, setUsuarios] = useState<UsuarioPendiente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarUsuariosPendientes = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('login')
        .select('*')
        .or('estado.eq.Pendiente,estado.eq.Pendiente/Inactivo,rol.eq.Pendiente');

      if (error) throw error;

      setUsuarios(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios pendientes: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuariosPendientes();
  }, []);

  const activarCuenta = async (correoUsuario: string, nuevoRol: 'Admin' | 'Cliente') => {
    try {
      const { error } = await supabase
        .from('login')
        .update({
          rol: nuevoRol,
          estado: 'Activo'
        })
        .eq('correo', correoUsuario);

      if (error) throw error;

      Alert.alert('Éxito', `La cuenta ${correoUsuario} ha sido activada con el rol de ${nuevoRol}.`);
      cargarUsuariosPendientes();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar el usuario: ' + error.message);
    }
  };

  const renderItem = ({ item }: { item: UsuarioPendiente }) => (
    <View style={styles.card}>
      <Text style={styles.correoText}>{item.correo}</Text>
      <Text style={styles.estadoText}>Estado: {item.estado || item.rol}</Text>
      
      <Text style={styles.subtituloAccion}>Seleccionar rol y activar:</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.boton, styles.botonCliente]}
          onPress={() => activarCuenta(item.correo, 'Cliente')}
        >
          <Text style={styles.textoBoton}>Activar Cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonAdmin]}
          onPress={() => activarCuenta(item.correo, 'Admin')}
        >
          <Text style={styles.textoBoton}>Activar Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Aprobación de Cuentas</Text>
      <Text style={styles.subtitulo}>Solicitudes pendientes de activación</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : usuarios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay solicitudes pendientes en este momento.</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.correo}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      )}

      {/* Botón para ver la lista de clientes registrados */}
      <TouchableOpacity
        style={styles.botonClientes}
        onPress={() => navigation.navigate('PerfilCliente', { usuario: { rol: 'Admin' } })}
      >
        <Text style={styles.textoBoton}>Ver Listado de Clientes</Text>
      </TouchableOpacity>

      {/* Botón para ir a la Gestión de Productos */}
      <TouchableOpacity
        style={styles.botonProductos}
        onPress={() => navigation.navigate('Productos')}
      >
        <Text style={styles.textoBoton}>Gestionar Productos (Inventario)</Text>
      </TouchableOpacity>

      {/* NUEVO: Botón para ir al Módulo de Compras (Encabezados y Detalles) */}
      <TouchableOpacity
        style={styles.botonCompras}
        onPress={() => navigation.navigate('AdminCompras')}
      >
        <Text style={styles.textoBoton}>Ver Módulo de Compras (Encabezados y Detalles)</Text>
      </TouchableOpacity>

      {/* Botón para Cerrar Sesión */}
      <TouchableOpacity
        style={styles.botonCerrarSesion}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  correoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoText: {
    fontSize: 14,
    color: '#e67e22',
    marginVertical: 4,
  },
  subtituloAccion: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  boton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  botonCliente: {
    backgroundColor: '#28a745',
  },
  botonAdmin: {
    backgroundColor: '#007BFF',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
  },
  botonClientes: {
    backgroundColor: '#17a2b8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonProductos: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonCompras: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonCerrarSesion: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoCerrarSesion: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});