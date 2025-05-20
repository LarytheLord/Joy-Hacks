import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, FlatList } from 'react-native';
import { Text, Button, Card, Avatar, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';

const ProfileScreen = ({ route, navigation }) => {
  const [profile, setProfile] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  
  // Get user ID from route params or use current user ID
  const userId = route?.params?.userId || null;
  
  useEffect(() => {
    fetchProfile();
    fetchUserVideos();
  }, [userId]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // If userId is provided, fetch that user's profile, otherwise fetch current user's profile
      const endpoint = userId 
        ? `/users/${userId}` 
        : '/users/me';
      
      const response = await axios.get(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );
      
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserVideos = async () => {
    try {
      const endpoint = userId 
        ? `/videos/user/${userId}` 
        : '/videos/my-videos';
      
      const response = await axios.get(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );
      
      setUserVideos(response.data);
    } catch (err) {
      console.error('Error fetching user videos:', err);
    }
  };
  
  const handleFollowToggle = async () => {
    try {
      if (!userId) return; // Can't follow yourself
      
      await axios.post(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );
      
      // Refresh profile to update followers count
      fetchProfile();
    } catch (err) {
      console.error('Error toggling follow:', err);
      Alert.alert('Error', 'Failed to follow/unfollow user');
    }
  };
  
  const renderVideoItem = ({ item }) => (
    <Card style={styles.videoCard}>
      <Card.Content>
        <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.videoStats}>
          <Icon name="heart" size={16} color={theme.colors.primary} />
          <Text style={styles.statText}>{item.likes?.length || 0}</Text>
          <Icon name="comment" size={16} color={theme.colors.primary} style={styles.statIcon} />
          <Text style={styles.statText}>{item.comments?.length || 0}</Text>
        </View>
      </Card.Content>
    </Card>
  );
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle" size={24} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchProfile}>Retry</Button>
      </View>
    );
  }
  
  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>User not found</Text>
      </View>
    );
  }
  
  const isCurrentUser = !userId;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image 
          size={80} 
          source={profile.avatar ? { uri: profile.avatar } : require('../assets/default-avatar.png')} 
        />
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.bio}>{profile.bio || 'No bio yet'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userVideos.length}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        
        {!isCurrentUser && (
          <Button 
            mode="contained" 
            onPress={handleFollowToggle}
            style={styles.followButton}
          >
            {profile.followers?.includes(currentUserId) ? 'Unfollow' : 'Follow'}
          </Button>
        )}
        
        {isCurrentUser && (
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editButton}
            icon="pencil"
          >
            Edit Profile
          </Button>
        )}
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.languagesContainer}>
        <Text style={styles.sectionTitle}>Programming Languages</Text>
        <View style={styles.languagesList}>
          {profile.languages?.map((lang) => (
            <View key={lang} style={styles.languageChip}>
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          )) || <Text>No languages added yet</Text>}
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Videos</Text>
      {userVideos.length > 0 ? (
        <FlatList
          data={userVideos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.videosGrid}
        />
      ) : (
        <Text style={styles.noVideosText}>No videos yet</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  bio: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  followButton: {
    marginTop: 16,
    width: 120,
  },
  editButton: {
    marginTop: 16,
    width: 150,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  languagesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  languageChip: {
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  languageText: {
    fontSize: 14,
  },
  videosGrid: {
    paddingHorizontal: 8,
  },
  videoCard: {
    flex: 1,
    margin: 8,
    maxWidth: '46%',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statIcon: {
    marginLeft: 12,
  },
  noVideosText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#64748b',
  },
  errorText: {
    marginVertical: 16,
    color: '#dc2626',
    fontSize: 16,
  },
});

export default ProfileScreen;