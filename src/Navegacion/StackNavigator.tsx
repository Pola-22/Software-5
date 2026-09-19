import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importación de las pantallas
import Login from '../Pantallas/Login';
import Registro from '../Pantallas/Registro';
import Home from '../Pantallas/Home';
import GestionUsuario from '../Pantallas/GestionUsuario';
import PerfilCliente from '../Pantallas/PerfilCliente';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* HU-03: Pantalla de Login */}
      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ headerShown: false }} 
      /> 

      {/* HU-01: Pantalla de Registro */}
      <Stack.Screen 
        name="Registro" 
        component={Registro} 
        options={{ title: 'Registro' }} 
      />

      {/* Pantalla principal previa */}
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={{ title: 'Inicio' }} 
      />

      {/* HU-02: Gestión y activación de usuarios por el Administrador */}
      <Stack.Screen 
        name="GestionUsuarios" 
        component={GestionUsuario} 
        options={{ title: 'Aprobación de Cuentas' }} 
      />

      {/* HU-04: Perfil y consulta de datos del Cliente */}
      <Stack.Screen 
        name="PerfilCliente" 
        component={PerfilCliente} 
        options={{ title: 'Perfil del Cliente' }} 
      />
    </Stack.Navigator>
  );
}