import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

const VideoCard = ({ video }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleProtectedAction = async (action) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Auth');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  const handlePress = () => {
    navigation.navigate('VideoDetail', { videoId: video._id });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      onPress={handlePress}
    >
      <Image
        source={{ uri: video.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: video.user.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: theme.text }]}>
              {video.user.username}
            </Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {video.title}
        </Text>

        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {video.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.stats}>
            <MaterialIcons name="visibility" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {video.views}
            </Text>
            <MaterialIcons name="favorite" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {video.likes.length}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={async () => {
              const authed = await handleProtectedAction('comment');
              if (authed) {
                // Implement comment action
              }
            }}
          >
            <MaterialIcons name="comment" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={async () => {
              const authed = await handleProtectedAction('share');
              if (authed) {
                // Implement share action
              }
            }}
          >
            <MaterialIcons name="share" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>Share</Text>
          </TouchableOpacity>
          <View style={styles.language}>
            <Text style={[styles.languageText, { color: theme.primary }]}>
              {video.language}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: width - 32,
    height: (width - 32) * 0.5625, // 16:9 aspect ratio
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 12,
  },
  language: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VideoCard;