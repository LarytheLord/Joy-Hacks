import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CommentsScreen = ({ route }) => {
  const { videoId } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { theme } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      // Implement API call to get comments
      const mockComments = [
        { id: '1', user: 'user1', text: 'Great video!' },
        { id: '2', user: 'user2', text: 'Awesome content 👏' },
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Auth');
        return;
      }

      if (newComment.trim()) {
        // Implement API call to post comment
        const mockComment = {
          id: Date.now().toString(),
          user: 'currentUser',
          text: newComment.trim(),
        };
        setComments([...comments, mockComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Comment submission failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <Text style={[styles.commentUser, { color: theme.primary }]}>{item.user}</Text>
            <Text style={[styles.commentText, { color: theme.text }]}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      
      <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Add a comment..."
          placeholderTextColor={theme.textSecondary}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleCommentSubmit}>
          <MaterialIcons name="send" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  commentUser: {
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginRight: 12,
    fontSize: 16,
  },
});

export default CommentsScreen;