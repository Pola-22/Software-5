import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../config/supabase';

interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  valorunitario: number;
  stock: number;
}

export default function ProductosScreen({ navigation }: any) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estados del formulario
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [stock, setStock] = useState('');

  // 1. Cargar la lista de productos desde la tabla 'producto' en Supabase
  const cargarProductos = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase.from('producto').select('*');
      if (error) throw error;
      setProductos(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron obtener los productos: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Limpiar campos del formulario
  const limpiarFormulario = () => {
    setIdSeleccionado(null);
    setNombre('');
    setDescripcion('');
    setValorUnitario('');
    setStock('');
  };

  // Seleccionar producto para editar
  const seleccionarParaEditar = (prod: any) => {
    setIdSeleccionado(prod.id || prod.Id);
    setNombre(prod.nombre || prod.Nombre || '');
    setDescripcion(prod.descripcion || prod.Descripcion || '');
    setValorUnitario((prod.valorunitario || prod.ValorUnitario || 0).toString());
    setStock((prod.stock || prod.Stock || 0).toString());
  };

  // 2. Guardar o actualizar producto (HU-07)
  const guardarProducto = async () => {
    // Validaciones
    if (!nombre.trim() || !descripcion.trim() || !valorUnitario.trim() || !stock.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const precioNum = parseFloat(valorUnitario);
    const stockNum = parseInt(stock, 10);

    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El valor unitario debe ser un número positivo.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'El stock debe ser un entero mayor o igual a cero.');
      return;
    }

    setCargando(true);
    try {
      if (idSeleccionado) {
        // Editar producto existente
        const { error } = await supabase
          .from('producto')
          .update({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            valorunitario: precioNum,
            stock: stockNum
          })
          .eq('id', idSeleccionado);

        if (error) throw error;
        Alert.alert('Éxito', 'Producto actualizado correctamente.');
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('producto')
          .insert([
            {
              nombre: nombre.trim(),
              descripcion: descripcion.trim(),
              valorunitario: precioNum,
              stock: stockNum
            }
          ]);

        if (error) throw error;
        Alert.alert('Éxito', 'Producto creado correctamente.');
      }

      limpiarFormulario();
      cargarProductos();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Productos</Text>
      <Text style={styles.subtitulo}>Administración de inventario (HU-07)</Text>

      {/* Formulario de producto */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Valor Unitario ($)"
            value={valorUnitario}
            onChangeText={setValorUnitario}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.botonGuardar} onPress={guardarProducto}>
          <Text style={styles.textoBoton}>
            {idSeleccionado ? 'Actualizar Producto' : 'Crear Producto'}
          </Text>
        </TouchableOpacity>

        {idSeleccionado && (
          <TouchableOpacity style={styles.botonCancelar} onPress={limpiarFormulario}>
            <Text style={styles.textoBoton}>Cancelar Edición</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Listado de productos */}
      <Text style={styles.listTitulo}>Inventario Actual</Text>
      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prodNombre}>{item.nombre}</Text>
                <Text style={styles.prodDesc}>{item.descripcion}</Text>
                <Text style={styles.prodInfo}>
                  Precio: ${item.valorunitario} | Stock: {item.stock}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={() => seleccionarParaEditar(item)}
              >
                <Text style={styles.textoBotonEditar}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitulo: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 12 },
  form: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 16, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  botonGuardar: { backgroundColor: '#28a745', padding: 12, borderRadius: 6, alignItems: 'center' },
  botonCancelar: { backgroundColor: '#6c757d', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  textoBoton: { color: '#fff', fontWeight: 'bold' },
  listTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#444' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  prodNombre: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  prodDesc: { fontSize: 13, color: '#666', marginVertical: 2 },
  prodInfo: { fontSize: 13, fontWeight: '600', color: '#007BFF' },
  botonEditar: { backgroundColor: '#007BFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  textoBotonEditar: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});