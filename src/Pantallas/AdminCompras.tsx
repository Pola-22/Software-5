import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { supabase } from '../config/supabase';

export default function AdminCompras({ navigation }: any) {
  const [compras, setCompras] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Detalles
  const [modalVisible, setModalVisible] = useState(false);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [compraActiva, setCompraActiva] = useState<any>(null);

  // Diccionario para mapear ID de producto con su Nombre
  const [productosMap, setProductosMap] = useState<any>({});

  useEffect(() => {
    cargarDatosGenerales();
  }, []);

  const cargarDatosGenerales = async () => {
    setCargando(true);
    try {
      // 1. Obtener productos para poder mostrar el nombre en los detalles
      const { data: prodData } = await supabase.from('producto').select('id, nombre');
      const pMap: any = {};
      if (prodData) {
        prodData.forEach(p => { pMap[p.id] = p.nombre; });
      }
      setProductosMap(pMap);

      // 2. Obtener los encabezados (todas las compras)
      const { data: comprasData, error } = await supabase
        .from('encabezado')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setCompras(comprasData || []);

    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las compras: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalles = async (compra: any) => {
    setCompraActiva(compra);
    setModalVisible(true);
    setCargandoDetalles(true);

    try {
      // 3. Obtener los detalles asociados a la factura seleccionada
      const { data, error } = await supabase
        .from('detalles')
        .select('*')
        .eq('id_encabezado', compra.id);

      if (error) throw error;
      setDetalles(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los detalles: ' + error.message);
    } finally {
      setCargandoDetalles(false);
    }
  };

  const renderCompra = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.textoBold}>Factura #{item.id}</Text>
        <Text style={styles.textoFecha}>{new Date(item.fecha).toLocaleString('es-CO')}</Text>
      </View>
      <Text style={styles.textoCliente}>ID Cliente: {item.id_cliente}</Text>
      <Text style={styles.textoTotal}>Total: ${Number(item.total).toLocaleString('es-CO')}</Text>

      <TouchableOpacity style={styles.btnDetalles} onPress={() => abrirDetalles(item)}>
        <Text style={styles.textoBtnDetalles}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetalle = ({ item }: { item: any }) => (
    <View style={styles.detalleCard}>
      <Text style={styles.detalleNombre}>
        {productosMap[item.id_producto] || `Producto ID: ${item.id_producto}`}
      </Text>
      <Text style={styles.detalleInfo}>Cantidad: {item.cantidad}</Text>
      <Text style={styles.detalleSubtotal}>Subtotal: ${Number(item.valor).toLocaleString('es-CO')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Módulo de Ventas</Text>
      <Text style={styles.subtitulo}>Historial de Compras (Encabezados y Detalles)</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCompra}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay compras registradas en el sistema.</Text>}
        />
      )}

      {/* MODAL PARA MOSTRAR LA TABLA DETALLES */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Detalles Factura #{compraActiva?.id}</Text>

            {cargandoDetalles ? (
              <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={detalles}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                renderItem={renderDetalle}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay detalles registrados para esta compra.</Text>}
              />
            )}

            <TouchableOpacity style={styles.btnCerrar} onPress={() => setModalVisible(false)}>
              <Text style={styles.textoBtnCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitulo: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16 },
  
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  textoBold: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  textoFecha: { fontSize: 13, color: '#666' },
  textoCliente: { fontSize: 14, color: '#444', marginBottom: 4 },
  textoTotal: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 12 },
  
  btnDetalles: { backgroundColor: '#007BFF', padding: 10, borderRadius: 6, alignItems: 'center' },
  textoBtnDetalles: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 30, fontSize: 15 },
  
  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '80%' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#333' },
  detalleCard: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
  detalleNombre: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  detalleInfo: { fontSize: 13, color: '#666', marginTop: 3 },
  detalleSubtotal: { fontSize: 14, fontWeight: 'bold', color: '#28a745', marginTop: 3 },
  btnCerrar: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  textoBtnCerrar: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});