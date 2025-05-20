import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [username, setUsername] = useState('');
 const [isLogin, setIsLogin] = useState(true);
 const navigation = useNavigation();

 const handleAuth = async () => {
 // TODO: Implement Firebase authentication
 navigation.navigate('Feed');
 };

 return (
 <View style={styles.container}>
 <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
 
 {!isLogin && (
 <TextInput
 style={styles.input}
 placeholder="Username"
 value={username}
 onChangeText={setUsername}
 />
 )}

 <TextInput
 style={styles.input}
 placeholder="Email"
 keyboardType="email-address"
 autoCapitalize="none"
 value={email}
 onChangeText={setEmail}
 />

 <TextInput
 style={styles.input}
 placeholder="Password"
 secureTextEntry
 value={password}
 onChangeText={setPassword}
 />

 <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />

 <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
 <Text style={styles.switchText}>
 {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
 </Text>
 </TouchableOpacity>
 </View>
 );
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 justifyContent: 'center',
 padding: 20
 },
 title: {
 fontSize: 24,
 marginBottom: 20,
 textAlign: 'center'
 },
 input: {
 height: 40,
 borderColor: 'gray',
 borderWidth: 1,
 marginBottom: 12,
 padding: 10,
 borderRadius: 5
 },
 switchText: {
 color: '#007AFF',
 marginTop: 15,
 textAlign: 'center'
 }
});

export default AuthScreen;