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

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  valor_unitario: number;
  valorunitario?: number;
  stock: number;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export default function SeleccionProductos({ route, navigation }: any) {
  const idCliente = route?.params?.idCliente;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [cantidades, setCantidades] = useState<{ [key: number]: number }>({});
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase.from('producto').select('*');
      if (error) throw error;

      setProductos(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const incrementarCantidad = (item: Producto) => {
    const actual = cantidades[item.id] || 0;
    if (actual >= item.stock) {
      Alert.alert(
        'Límite de Stock',
        `No puedes agregar más de ${item.stock} unidades de "${item.nombre}".`
      );
      return;
    }
    setCantidades({ ...cantidades, [item.id]: actual + 1 });
  };

  const decrementarCantidad = (item: Producto) => {
    const actual = cantidades[item.id] || 0;
    if (actual > 0) {
      setCantidades({ ...cantidades, [item.id]: actual - 1 });
    }
  };

  const agregarAlCarrito = (item: Producto) => {
    const cantidadSeleccionada = cantidades[item.id] || 0;

    if (item.stock <= 0) {
      Alert.alert('Producto Agotado', 'Este producto no cuenta con stock disponible.');
      return;
    }

    if (cantidadSeleccionada <= 0) {
      Alert.alert('Cantidad requerida', 'Selecciona al menos 1 unidad para agregar.');
      return;
    }

    if (cantidadSeleccionada > item.stock) {
      Alert.alert('Stock insuficiente', `Solo hay ${item.stock} unidades disponibles.`);
      return;
    }

    const existeIndice = carrito.findIndex((c) => c.producto.id === item.id);
    let nuevoCarrito = [...carrito];

    if (existeIndice >= 0) {
      nuevoCarrito[existeIndice].cantidad = cantidadSeleccionada;
    } else {
      nuevoCarrito.push({ producto: item, cantidad: cantidadSeleccionada });
    }

    setCarrito(nuevoCarrito);
    Alert.alert('Añadido', `${cantidadSeleccionada} unidad(es) de "${item.nombre}" agregada(s) a la selección.`);
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => {
      const precio = item.producto.valor_unitario ?? item.producto.valorunitario ?? 0;
      return acc + precio * item.cantidad;
    }, 0);
  };

  const renderProducto = ({ item }: { item: Producto }) => {
    const precio = item.valor_unitario ?? item.valorunitario ?? 0;
    const cantidadActual = cantidades[item.id] || 0;
    const sinStock = item.stock <= 0;

    return (
      <View style={[styles.card, sinStock && styles.cardAgotado]}>
        <View style={styles.headerCard}>
          <Text style={styles.nombreProducto}>{item.nombre}</Text>
          {sinStock ? (
            <Text style={styles.badgeAgotado}>AGOTADO</Text>
          ) : (
            <Text style={styles.badgeStock}>Stock: {item.stock}</Text>
          )}
        </View>

        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.precio}>${precio.toLocaleString('es-CO')} c/u</Text>

        {!sinStock && (
          <View style={styles.accionContainer}>
            <View style={styles.contadorContainer}>
              <TouchableOpacity
                style={styles.btnContador}
                onPress={() => decrementarCantidad(item)}
              >
                <Text style={styles.textoBtnContador}>-</Text>
              </TouchableOpacity>

              <Text style={styles.textoCantidad}>{cantidadActual}</Text>

              <TouchableOpacity
                style={[styles.btnContador, cantidadActual >= item.stock && styles.btnDeshabilitado]}
                onPress={() => incrementarCantidad(item)}
                disabled={cantidadActual >= item.stock}
              >
                <Text style={styles.textoBtnContador}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnAgregar, cantidadActual === 0 && styles.btnDeshabilitado]}
              onPress={() => agregarAlCarrito(item)}
              disabled={cantidadActual === 0}
            >
              <Text style={styles.textoBtnAgregar}>Agregar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Catálogo de Productos</Text>
      <Text style={styles.subtitulo}>Selecciona los artículos que deseas comprar</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProducto}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay productos disponibles en este momento.</Text>
          }
        />
      )}

      {carrito.length > 0 && (
        <View style={styles.resumenContainer}>
          <View>
            <Text style={styles.textoResumen}>
              {carrito.reduce((a, b) => a + b.cantidad, 0)} ítem(s) seleccionados
            </Text>
            <Text style={styles.totalResumen}>
              Total: ${calcularTotal().toLocaleString('es-CO')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.btnConfirmar}
            onPress={() => {
              if (!idCliente) {
                Alert.alert('Error', 'No se detectó tu ID de cliente. Vuelve al perfil e inténtalo de nuevo.');
                return;
              }
              navigation.navigate('ConfirmarCompra', {
                carrito: carrito,
                idCliente: idCliente
              });
            }}
          >
            <Text style={styles.textoBtnConfirmar}>Ver Selección</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitulo: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2 },
  cardAgotado: { backgroundColor: '#f8d7da', opacity: 0.8 },
  headerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nombreProducto: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  badgeStock: { backgroundColor: '#e3f2fd', color: '#0d47a1', fontWeight: 'bold', fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeAgotado: { backgroundColor: '#dc3545', color: '#fff', fontWeight: 'bold', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  descripcion: { fontSize: 13, color: '#666', marginBottom: 8 },
  precio: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 10 },
  accionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  contadorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 6 },
  btnContador: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#007BFF', borderRadius: 6 },
  textoBtnContador: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  textoCantidad: { paddingHorizontal: 14, fontSize: 15, fontWeight: 'bold' },
  btnAgregar: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  textoBtnAgregar: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnDeshabilitado: { backgroundColor: '#ccc' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 30, fontSize: 15 },
  resumenContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 10 },
  textoResumen: { fontSize: 12, color: '#666' },
  totalResumen: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  btnConfirmar: { backgroundColor: '#007BFF', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  textoBtnConfirmar: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});