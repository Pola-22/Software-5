import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. IMPORTA TODAS TUS PANTALLAS
import Login from '../Pantallas/Login';
import GestionUsuario from '../Pantallas/GestionUsuario';
import PerfilCliente from '../Pantallas/PerfilCliente';
import Productos from '../Pantallas/Productos';
import AdminCompras from '../Pantallas/AdminCompras'; 

const Stack = createNativeStackNavigator();

export default function Navegacion() {
  return (
    <Stack.Navigator initialRouteName="Login">
      
      {/* Tus pantallas existentes */}
      <Stack.Screen name="Login" component={Login} options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="GestionUsuario" component={GestionUsuario} options={{ title: 'Panel Admin' }} />
      <Stack.Screen name="PerfilCliente" component={PerfilCliente} options={{ title: 'Clientes' }} />
      <Stack.Screen name="Productos" component={Productos} options={{ title: 'Inventario' }} />

      {/* REGISTRA LA NUEVA PANTALLA AQUÍ */}
      <Stack.Screen 
        name="AdminCompras" 
        component={AdminCompras} 
        options={{ title: 'Módulo de Compras' }} 
      />

    </Stack.Navigator>
  );
}