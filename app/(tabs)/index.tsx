import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { RedditAPI } from '@/lib/reddit-api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RedditPostCard } from '@/components/RedditPostCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthForm } from '@/components/AuthForm';
import { RedditPost } from '@/lib/types';
import { ConversationService } from '@/lib/conversation';
import { Sparkles, TrendingUp, Clock, ExternalLink, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { incrementSavedPosts } = useAnalytics();
  const router = useRouter();
  const [redditUrl, setRedditUrl] = useState('');
  const [currentPost, setCurrentPost] = useState<RedditPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [processingStep, setProcessingStep] = useState('');
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} />;
  }

  const handleSubmitUrl = async () => {
    if (!redditUrl.trim()) {
      Alert.alert('Error', 'Please enter a Reddit URL');
      return;
    }

    if (!RedditAPI.isValidRedditUrl(redditUrl.trim())) {
      Alert.alert('Error', 'Please enter a valid Reddit post URL');
      return;
    }

    setLoading(true);
    setProcessingStep('Analyzing Reddit post...');
    
    try {
      // Simulate processing steps for better UX
      setTimeout(() => setProcessingStep('Extracting key viewpoints...'), 1000);
      setTimeout(() => setProcessingStep('Generating summary...'), 2000);
      
      const summary = await RedditAPI.summarizePost(redditUrl.trim());
      
      const post: RedditPost = {
        id: Date.now().toString(),
        user_id: user.id,
        reddit_url: redditUrl.trim(),
        title: summary.title,
        summary: summary.summary,
        viewpoints: summary.viewpoints,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentPost(post);
      setProcessingStep('');
    } catch (error) {
      Alert.alert('Error', 'Failed to process Reddit URL');
      setProcessingStep('');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (post: RedditPost) => {
    try {
      // Check if post already exists
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', post.user_id)
        .eq('reddit_url', post.reddit_url)
        .single();

      if (existingPost) {
        Alert.alert('Already Saved', 'This post is already in your saved collection');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .insert([{
          user_id: post.user_id,
          reddit_url: post.reddit_url,
          title: post.title,
          summary: post.summary,
          viewpoints: post.viewpoints,
        }]);

      if (error) throw error;

      await incrementSavedPosts();
      setSavedPostIds(prev => new Set(prev).add(post.reddit_url));
      Alert.alert('Success', 'Post saved to your collection!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const openRedditUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const handleStartConversation = (post: RedditPost) => {
    ConversationService.setRedditPost(post);
    router.push('/conversation');
  };

  const clearCurrentPost = () => {
    setCurrentPost(null);
    setRedditUrl('');
  };

  const handleExampleUrl = (url: string, title: string) => {
    setRedditUrl(url);
    Alert.alert('Example Loaded', `Loaded: ${title}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sparkles size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Reddit Post Digester</Text>
          <Text style={styles.subtitle}>Paste a Reddit URL to get an AI-powered summary</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Reddit Post URL</Text>
          <TextInput
            style={styles.input}
            value={redditUrl}
            onChangeText={setRedditUrl}
            placeholder="https://www.reddit.com/r/..."
            multiline
            numberOfLines={3}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmitUrl}
            disabled={loading}
          >
            <TrendingUp size={20} color="white" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Processing...' : 'Analyze Post'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <LoadingSpinner message={processingStep || "Analyzing Reddit post..."} />}

        {currentPost && (
          <View style={styles.resultContainer}>
            <RedditPostCard 
              post={currentPost} 
              onSave={handleSavePost}
              onStartConversation={handleStartConversation}
              isSaved={savedPostIds.has(currentPost.reddit_url)}
              onOpenUrl={openRedditUrl}
            />
            <TouchableOpacity style={styles.clearButton} onPress={clearCurrentPost}>
              <TrendingUp size={16} color="#6B7280" />
              <Text style={styles.clearButtonText}>Clear & Analyze Another</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.exampleContainer}>
          <View style={styles.exampleHeader}>
            <Clock size={20} color="#6B7280" />
            <Text style={styles.exampleTitle}>Try these example Reddit URLs:</Text>
          </View>
          <TouchableOpacity 
            style={styles.exampleItem}
            onPress={() => handleExampleUrl(
              'https://www.reddit.com/r/technology/comments/example1',
              'AI Development Discussion'
            )}
          >
            <View style={styles.exampleContent}>
              <Text style={styles.exampleSubreddit}>r/technology</Text>
              <Text style={styles.exampleDescription}>AI Development Discussion</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.exampleItem}
            onPress={() => handleExampleUrl(
              'https://www.reddit.com/r/environment/comments/example2',
              'Climate Solutions'
            )}
          >
            <View style={styles.exampleContent}>
              <Text style={styles.exampleSubreddit}>r/environment</Text>
              <Text style={styles.exampleDescription}>Climate Solutions</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.exampleItem}
            onPress={() => handleExampleUrl(
              'https://www.reddit.com/r/remotework/comments/example3',
              'Work Culture'
            )}
          >
            <View style={styles.exampleContent}>
              <Text style={styles.exampleSubreddit}>r/remotework</Text>
              <Text style={styles.exampleDescription}>Work Culture</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultContainer: {
    margin: 20,
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  exampleContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  exampleItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  exampleContent: {
    flexDirection: 'column',
  },
  exampleSubreddit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 2,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});