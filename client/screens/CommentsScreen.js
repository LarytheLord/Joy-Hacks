import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Avatar, Card, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';

const CommentsScreen = ({ route }) => {
  const { videoId } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/videos/${videoId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );
      setComments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${Config.API_BASE_URL || 'http://localhost:5000/api'}/videos/${videoId}/comments`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        }
      );

      // Add the new comment to the list
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToProfile = (userId) => {
    navigation.navigate('Profile', { userId });
  };

  const renderCommentItem = ({ item }) => (
    <Card style={styles.commentCard}>
      <Card.Content style={styles.commentContent}>
        <TouchableOpacity onPress={() => navigateToProfile(item.userId)}>
          <Avatar.Image
            size={40}
            source={item.userAvatar ? { uri: item.userAvatar } : require('../assets/default-avatar.png')}
          />
        </TouchableOpacity>
        <View style={styles.commentTextContainer}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => navigateToProfile(item.userId)}>
              <Text style={styles.username}>{item.userName}</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.commentsContainer}>
        {loading ? (
          <ActivityIndicator animating={true} size="large" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={fetchComments}>Retry</Button>
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
            }
            contentContainerStyle={styles.commentsList}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          mode="outlined"
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleAddComment}
              disabled={submitting || !newComment.trim()}
              color={theme.colors.primary}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  commentsContainer: {
    flex: 1,
  },
  commentsList: {
    padding: 16,
  },
  commentCard: {
    marginBottom: 8,
    elevation: 1,
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 8,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  input: {
    maxHeight: 100,
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b',
    fontSize: 16,
  },
});

export default CommentsScreen;