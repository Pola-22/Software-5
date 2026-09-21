import React, { useState } from 'react';
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

interface ItemCarrito {
  producto: {
    id: number;
    nombre: string;
    descripcion: string;
    valor_unitario: number;
    valorunitario?: number;
    stock: number;
  };
  cantidad: number;
}

export default function ConfirmarCompra({ route, navigation }: any) {
  const { carrito, idCliente } = route.params as {
    carrito: ItemCarrito[];
    idCliente: number;
  };

  const [procesando, setProcesando] = useState(false);

  // Calcular subtotales y total global
  const itemsConSubtotal = carrito.map((item) => {
    const precioUnitario = item.producto.valor_unitario ?? item.producto.valorunitario ?? 0;
    const subtotal = precioUnitario * item.cantidad;
    return {
      ...item,
      subtotal,
    };
  });

  const totalGeneral = itemsConSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

  const realizarCompra = async () => {
    if (!idCliente) {
      Alert.alert('Error', 'No se identificó el cliente para registrar la compra.');
      return;
    }

    setProcesando(true);

    try {
      // Estructurar el array JSON para enviar al procedimiento RPC
      const detallesJSON = itemsConSubtotal.map((item) => ({
        id_producto: item.producto.id,
        cantidad: item.cantidad,
        valor_subtotal: item.subtotal,
      }));

      // Llamada atómica a la función almacenada en Supabase
      const { data, error } = await supabase.rpc('procesar_compra', {
        p_id_cliente: idCliente,
        p_total: totalGeneral,
        p_detalles: detallesJSON,
      });

      if (error) throw error;

      Alert.alert(
        '¡Compra Exitosa!',
        `Su pedido #${data} ha sido procesado correctamente.`,
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.navigate('SeleccionProductos'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error al procesar la compra', error.message || 'Ocurrió un problema en la transacción.');
    } finally {
      setProcesando(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombreProd}>{item.producto.nombre}</Text>
        <Text style={styles.cantText}>
          Cantidad: {item.cantidad} x ${ (item.producto.valor_unitario ?? item.producto.valorunitario ?? 0).toLocaleString('es-CO') }
        </Text>
      </View>
      <Text style={styles.subtotalText}>
        ${item.subtotal.toLocaleString('es-CO')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumen de la Compra</Text>
      <Text style={styles.subtitulo}>Verifica el detalle de tus productos antes de confirmar</Text>

      <FlatList
        data={itemsConSubtotal}
        keyExtractor={(item) => item.producto.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.footerContainer}>
        <View style={styles.rowTotal}>
          <Text style={styles.labelTotal}>Total a Pagar:</Text>
          <Text style={styles.valorTotal}>${totalGeneral.toLocaleString('es-CO')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.botonConfirmar, procesando && styles.botonDeshabilitado]}
          onPress={realizarCompra}
          disabled={procesando}
        >
          {procesando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBoton}>Confirmar Compra</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCancelar}
          onPress={() => navigation.goBack()}
          disabled={procesando}
        >
          <Text style={styles.textoBotonCancelar}>Volver a la Selección</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitulo: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  nombreProd: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  cantText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  subtotalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#28a745',
  },
  footerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  valorTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
  },
  botonConfirmar: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDeshabilitado: {
    backgroundColor: '#94d3a2',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textoBotonCancelar: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
  },
});