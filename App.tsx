import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/Navegacion/StackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}