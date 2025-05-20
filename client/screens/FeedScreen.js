import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FeedScreen = () => {
 const [videos, setVideos] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchVideos();
 }, []);

 const fetchVideos = async () => {
 try {
 const response = await fetch('http://localhost:5000/api/videos/feed');
 const data = await response.json();
 setVideos(data);
 } catch (error) {
 console.error('Error fetching videos:', error);
 } finally {
 setLoading(false);
 }
 };

 const renderVideoItem = ({ item }) => (
 <View style={styles.videoContainer}>
 <Text style={styles.videoTitle}>{item.title}</Text>
 
 <View style={styles.codeContainer}>
 <Text style={styles.codeContent}>{item.codeContent}</Text>
 </View>

 <View style={styles.interactionBar}>
 <TouchableOpacity style={styles.interactionButton}>
 <Text>❤️ {item.likes?.length || 0}</Text>
 </TouchableOpacity>

 <TouchableOpacity style={styles.interactionButton}>
 <Text>💬 {item.comments?.length || 0}</Text>
 </TouchableOpacity>
 </View>
 </View>
 );

 return (
 <View style={styles.container}>
 {loading ? (
 <Text>Loading videos...</Text>
 ) : (
 <FlatList
 data={videos}
 renderItem={renderVideoItem}
 keyExtractor={item => item._id}
 />
 )}
 </View>
 );
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 padding: 10
 },
 videoContainer: {
 backgroundColor: '#fff',
 borderRadius: 8,
 padding: 15,
 marginBottom: 15,
 elevation: 2
 },
 videoTitle: {
 fontSize: 18,
 fontWeight: '600',
 marginBottom: 10
 },
 codeContainer: {
 backgroundColor: '#f8f9fa',
 borderRadius: 6,
 padding: 10,
 marginBottom: 10
 },
 codeContent: {
 fontFamily: 'monospace',
 fontSize: 14
 },
 interactionBar: {
 flexDirection: 'row',
 gap: 15
 },
 interactionButton: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingVertical: 6,
 paddingHorizontal: 12,
 backgroundColor: '#e9ecef',
 borderRadius: 20
 }
});

export default FeedScreen;