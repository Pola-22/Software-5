import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Pantallas/Login';
import Registro from '../Pantallas/Registro';
import Home from '../Pantallas/Home';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} /> 
      <Stack.Screen name="Registro" component={Registro} options={{ title: 'Registro' }} />
      <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />
    </Stack.Navigator>
  );
}