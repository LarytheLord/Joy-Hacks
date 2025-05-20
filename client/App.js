import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';

const Stack = createNativeStackNavigator();

export default function App() {
 return (
 <NavigationContainer>
 <Stack.Navigator initialRouteName="Auth">
 <Stack.Screen 
 name="Auth" 
 component={AuthScreen} 
 options={{ headerShown: false }}
 />
 <Stack.Screen 
 name="Feed" 
 component={FeedScreen}
 options={{ headerTitle: 'Code Reels' }}
 />
 </Stack.Navigator>
 </NavigationContainer>
 );
}