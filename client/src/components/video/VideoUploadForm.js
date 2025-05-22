import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { uploadVideo } from '../../services/api';

const VideoUploadForm = ({ video, onUploadComplete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { theme } = useTheme();

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Error', 'Please enter some code');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('video', {
        uri: video.uri,
        type: 'video/mp4',
        name: 'video.mp4',
      });
      formData.append('title', title);
      formData.append('description', description);
      formData.append('code', code);
      formData.append('language', language);
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())));
      formData.append('duration', video.duration);

      const response = await uploadVideo(formData);
      onUploadComplete(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.form}>
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter video title"
          required
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter video description"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Code"
          value={code}
          onChangeText={setCode}
          placeholder="Enter your code"
          multiline
          numberOfLines={10}
          style={styles.codeInput}
        />

        <Input
          label="Programming Language"
          value={language}
          onChangeText={setLanguage}
          placeholder="e.g., javascript, python, java"
        />

        <Input
          label="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          placeholder="e.g., react, javascript, tutorial"
        />

        <Button
          title={isUploading ? 'Uploading...' : 'Upload Video'}
          onPress={handleUpload}
          disabled={isUploading}
          style={styles.uploadButton}
        />

        {isUploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
    margin: 10,
  },
  codeInput: {
    fontFamily: 'monospace',
    height: 150,
    textAlignVertical: 'top',
  },
  uploadButton: {
    marginTop: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default VideoUploadForm; 