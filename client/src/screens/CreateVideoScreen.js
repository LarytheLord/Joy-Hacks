import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import VideoRecorder from '../components/video/VideoRecorder';
import VideoUploadForm from '../components/video/VideoUploadForm';
import { useNavigation } from '@react-navigation/native';

const CreateVideoScreen = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const { theme } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.navigate('Auth');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigation.navigate('Auth');
      }
    };

    checkAuth();
  }, []);

  const handleRecordingComplete = (video) => {
    setRecordedVideo(video);
  };

  const handleUploadComplete = (response) => {
    Alert.alert(
      'Success',
      'Video uploaded successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!recordedVideo ? (
        <VideoRecorder onRecordingComplete={handleRecordingComplete} />
      ) : (
        <VideoUploadForm
          video={recordedVideo}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CreateVideoScreen;