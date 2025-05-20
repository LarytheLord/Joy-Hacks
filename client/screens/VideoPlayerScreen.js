import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Text, IconButton, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';
import { Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videos, initialIndex = 0 } = route.params || { videos: [] };
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const theme = useTheme();

  const currentVideo = videos[currentIndex] || {};

  useEffect(() => {
    // Check if the current video is liked by the user
    const checkIfLiked = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId && currentVideo.likes) {
          setIsLiked(currentVideo.likes.includes(userId));
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkIfLiked();
  }, [currentIndex, currentVideo]);

  const handleLike = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLiked(!isLiked);

      await axios.post(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/videos/${currentVideo.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error liking video:', error);
      // Revert UI state if the API call fails
      setIsLiked(isLiked);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
    }
  };

  const toggleCodeVisibility = () => {
    setIsCodeVisible(!isCodeVisible);
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile', { userId: currentVideo.userId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <TouchableOpacity activeOpacity={1} onPress={togglePlayPause} style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: currentVideo.videoUrl }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={isPlaying}
          isLooping
          style={styles.video}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <View style={styles.playOverlay}>
            <IconButton
              icon="play"
              size={50}
              iconColor="white"
              onPress={togglePlayPause}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Split Screen Toggle */}
      <IconButton
        icon={isCodeVisible ? "code-tags" : "code-tags-check"}
        size={24}
        style={styles.codeToggleButton}
        onPress={toggleCodeVisibility}
      />

      {/* Code and Output Section */}
      {isCodeVisible && (
        <View style={styles.codeContainer}>
          <View style={styles.codeTitleBar}>
            <Text style={styles.codeTitle}>{currentVideo.language || 'JavaScript'}</Text>
          </View>
          <ScrollView style={styles.codeScrollView}>
            <Text style={styles.codeText} selectable>
              {currentVideo.codeContent || '// No code available'}
            </Text>
          </ScrollView>
          <View style={styles.outputContainer}>
            <Text style={styles.outputTitle}>Output:</Text>
            <ScrollView style={styles.outputScrollView}>
              <Text style={styles.outputText}>
                {currentVideo.codeOutput || 'No output available'}
              </Text>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Video Info and Controls */}
      <View style={styles.infoContainer}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={navigateToProfile}>
            <Avatar.Image
              size={40}
              source={currentVideo.userAvatar ? { uri: currentVideo.userAvatar } : require('../assets/default-avatar.png')}
            />
          </TouchableOpacity>
          <View style={styles.textInfo}>
            <TouchableOpacity onPress={navigateToProfile}>
              <Text style={styles.username}>{currentVideo.userName || 'Anonymous'}</Text>
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>{currentVideo.title}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <IconButton
            icon="heart"
            size={30}
            iconColor={isLiked ? theme.colors.error : 'white'}
            onPress={handleLike}
          />
          <Text style={styles.likeCount}>{currentVideo.likes?.length || 0}</Text>
          
          <IconButton
            icon="comment-outline"
            size={30}
            iconColor="white"
            onPress={() => navigation.navigate('Comments', { videoId: currentVideo.id })}
          />
          <Text style={styles.commentCount}>{currentVideo.comments?.length || 0}</Text>
          
          <IconButton
            icon="share-variant"
            size={30}
            iconColor="white"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <IconButton
          icon="chevron-up"
          size={40}
          iconColor="white"
          style={styles.navButton}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        />
        <IconButton
          icon="chevron-down"
          size={40}
          iconColor="white"
          style={styles.navButton}
          onPress={handleNext}
          disabled={currentIndex === videos.length - 1}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoContainer: {
    width: width,
    height: height,
    position: 'absolute',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  codeToggleButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  codeContainer: {
    position: 'absolute',
    width: width * 0.6,
    height: height * 0.7,
    right: 0,
    top: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    overflow: 'hidden',
  },
  codeTitleBar: {
    padding: 8,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  codeTitle: {
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  codeScrollView: {
    flex: 1,
    padding: 10,
  },
  codeText: {
    color: '#f8fafc',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  outputContainer: {
    height: '40%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#0f172a',
  },
  outputTitle: {
    color: '#f8fafc',
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: '#1e293b',
  },
  outputScrollView: {
    flex: 1,
    padding: 10,
  },
  outputText: {
    color: '#a5f3fc',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  textInfo: {
    marginLeft: 10,
    flex: 1,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  videoTitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  controls: {
    alignItems: 'center',
  },
  likeCount: {
    color: 'white',
    fontSize: 14,
    marginTop: -10,
  },
  commentCount: {
    color: 'white',
    fontSize: 14,
    marginTop: -10,
  },
  navigationButtons: {
    position: 'absolute',
    right: 10,
    top: '40%',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 5,
  },
});

export default VideoPlayerScreen;