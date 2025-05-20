import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
];

const CreateVideoScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const theme = useTheme();
  const navigation = useNavigation();

  // Execute code and get result
  const executeCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter some code to execute');
      return;
    }

    try {
      setIsExecuting(true);
      setCodeOutput('');

      const response = await axios.post(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/code/execute`,
        { language, code },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );

      setCodeOutput(response.data.output || 'No output');
    } catch (error) {
      console.error('Code execution error:', error);
      setCodeOutput(
        error.response?.data?.error ||
        'Error executing code. Please try again.'
      );
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle video upload
  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter some code');
      return;
    }

    if (!codeOutput) {
      Alert.alert('Error', 'Please execute your code first');
      return;
    }

    // For now, we'll just simulate a video upload
    // In a real implementation, you would use expo-image-picker or similar
    // to allow users to record or select a video
    Alert.alert(
      'Success',
      'Your code reel has been created successfully!',
      [{ text: 'OK', onPress: () => navigation.navigate('Feed') }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Code Reel</Title>
          
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
          />
          
          <View style={styles.languageSelector}>
            <Title style={styles.sectionTitle}>Language</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Chip
                  key={lang.value}
                  selected={language === lang.value}
                  onPress={() => setLanguage(lang.value)}
                  style={styles.chip}
                  selectedColor={theme.colors.primary}
                >
                  {lang.label}
                </Chip>
              ))}
            </ScrollView>
          </View>
          
          <Title style={styles.sectionTitle}>Code</Title>
          <TextInput
            value={code}
            onChangeText={setCode}
            style={styles.codeInput}
            mode="outlined"
            multiline
            numberOfLines={10}
            placeholder="Enter your code here..."
            autoCapitalize="none"
            autoCorrect={false}
            fontFamily="monospace"
          />
          
          <Button 
            mode="contained" 
            onPress={executeCode} 
            style={styles.executeButton}
            loading={isExecuting}
            disabled={isExecuting}
          >
            Execute Code
          </Button>
          
          <Title style={styles.sectionTitle}>Output</Title>
          <View style={styles.outputContainer}>
            {isExecuting ? (
              <ActivityIndicator animating={true} size="large" />
            ) : (
              <ScrollView style={styles.output}>
                <TextInput
                  value={codeOutput}
                  editable={false}
                  multiline
                  style={styles.outputText}
                />
              </ScrollView>
            )}
          </View>
          
          <Button 
            mode="contained" 
            onPress={handleUpload} 
            style={styles.uploadButton}
            loading={isUploading}
            disabled={isUploading || !codeOutput}
          >
            Create Reel
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const [hasCameraPermission, setHasCameraPermission] = useState(null);

useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
  })();
}, []);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  languageSelector: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  codeInput: {
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  executeButton: {
    marginBottom: 16,
  },
  outputContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    minHeight: 150,
    marginBottom: 16,
    justifyContent: 'center',
  },
  output: {
    maxHeight: 200,
  },
  outputText: {
    color: '#f8fafc',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
  },
  uploadButton: {
    marginTop: 8,
  },
});

export default CreateVideoScreen;
<View style={styles.splitContainer}>
  <Camera
    ref={cameraRef}
    style={styles.cameraPreview}
    type={Camera.Constants.Type.back}
  >
    <View style={styles.codeOverlay}>
      <CodeEditor
        style={styles.editor}
        language={language}
        value={code}
        onChangeText={setCode}
      />
    </View>
  </Camera>

  <View style={styles.controls}>
    <Picker
      selectedValue={language}
      onValueChange={setLanguage}
      style={styles.languagePicker}>
      <Picker.Item label="JavaScript" value="javascript" />
      <Picker.Item label="Python" value="python" />
      <Picker.Item label="Java" value="java" />
    </Picker>
    <TouchableOpacity
      style={styles.executeButton}
      onPress={handleCodeExecution}>
      <Text>▶ Run Code</Text>
    </TouchableOpacity>
  </View>
</View>