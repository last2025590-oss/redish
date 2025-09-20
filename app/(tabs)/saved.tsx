import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { RedditPostCard } from '@/components/RedditPostCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthForm } from '@/components/AuthForm';
import { RedditPost } from '@/lib/types';
import { ConversationService } from '@/lib/conversation';
import { BookmarkCheck, Trash2, RefreshCw } from 'lucide-react-native';

export default function SavedScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadSavedPosts();
    }
  }, [user]);

  const loadSavedPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedPosts();
    setRefreshing(false);
  };

  const handleStartConversation = (post: RedditPost) => {
    ConversationService.setRedditPost(post);
    router.push('/conversation');
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to remove this post from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingIds(prev => new Set(prev).add(postId));
            
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user?.id);

              if (error) throw error;
              
              setPosts(prev => prev.filter(post => post.id !== postId));
              Alert.alert('Success', 'Post removed from saved list');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            } finally {
              setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading saved posts..." />;
  }

  const renderPost = ({ item }: { item: RedditPost }) => (
    <View style={styles.postContainer}>
      <RedditPostCard 
        post={item} 
        showSaveButton={false}
        isSaved={true}
        onStartConversation={handleStartConversation}
      />
      <TouchableOpacity
        style={[styles.deleteButton, deletingIds.has(item.id) && styles.deletingButton]}
        onPress={() => handleDeletePost(item.id)}
        disabled={deletingIds.has(item.id)}
      >
        <Trash2 size={16} color={deletingIds.has(item.id) ? '#9CA3AF' : '#EF4444'} />
        <Text style={[styles.deleteButtonText, deletingIds.has(item.id) && styles.deletingText]}>
          {deletingIds.has(item.id) ? 'Removing...' : 'Remove'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <BookmarkCheck size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Saved Posts</Text>
      <Text style={styles.emptyMessage}>
        Posts you save from the Home tab will appear here
      </Text>
      <TouchableOpacity 
        style={styles.goHomeButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.goHomeButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BookmarkCheck size={28} color="#3B82F6" />
            <Text style={styles.title}>Saved Posts</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <RefreshCw size={24} color={refreshing ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} saved
        </Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  postContainer: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deletingButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 4,
  },
  deletingText: {
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  goHomeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goHomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});