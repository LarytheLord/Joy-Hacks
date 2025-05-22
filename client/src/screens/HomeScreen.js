import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import VideoCard from '../components/video/VideoCard';
import { getVideos } from '../services/api';
import { handleApiError } from '../services/api';

const HomeScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();

  const loadVideos = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const response = await getVideos(pageNum);
      const newVideos = response.videos;
      
      if (shouldRefresh) {
        setVideos(newVideos);
      } else {
        setVideos((prevVideos) => [...prevVideos, ...newVideos]);
      }
      
      setHasMore(pageNum < response.pages);
      setPage(pageNum);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVideos(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadVideos(page + 1);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={videos}
        renderItem={({ item }) => <VideoCard video={item} />}
        keyExtractor={(item) => item._id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default HomeScreen; 