import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchVideos } from '../src/api/apiService';

const FeedScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await fetchVideos();
      setVideos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const renderVideoItem = ({ item }) => (
 <Card style={styles.card}>
 <Card.Content>
 <Title style={styles.title}>{item.title}</Title>
 
 <View style={styles.codeBlock}>
 <Text selectable style={styles.codeText}>{item.codeContent}</Text>
 </View>

 <View style={styles.interactionBar}>
 <Button mode="text" icon="heart-outline" style={styles.interactionButton}>
 {item.likes?.length || 0}
 </Button>
 <Button mode="text" icon="comment-outline" style={styles.interactionButton}>
 {item.comments?.length || 0}
 </Button>
 </View>
 </Card.Content>
 </Card>
 );

 if (error) {
 return (
 <View style={styles.centered}>
 <Icon name="alert-circle" size={24} color={theme.colors.error} />
 <Text style={styles.errorText}>{error}</Text>
 <Button mode="contained" onPress={fetchVideos}>Retry</Button>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {loading ? (
 <ActivityIndicator animating={true} size="large" style={styles.loader} />
 ) : (
 <FlatList
 data={videos}
 renderItem={renderVideoItem}
 keyExtractor={item => item._id}
 contentContainerStyle={styles.listContent}
 />
 )}
 </View>
 );
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f8fafc'
 },
 card: {
 margin: 12,
 borderRadius: 12,
 elevation: 2
 },
 title: {
 marginBottom: 12
 },
 codeBlock: {
 backgroundColor: '#ffffff',
 borderRadius: 8,
 padding: 16,
 marginBottom: 16
 },
 codeText: {
 fontFamily: 'monospace',
 fontSize: 14,
 color: '#334155'
 },
 interactionBar: {
 flexDirection: 'row',
 justifyContent: 'flex-start',
 marginTop: 8
 },
 interactionButton: {
 marginRight: 16
 },
 loader: {
 flex: 1,
 justifyContent: 'center'
 },
 centered: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 padding: 20
 },
 errorText: {
 marginVertical: 16,
 color: '#dc2626',
 fontSize: 16
 }
});

export default FeedScreen;