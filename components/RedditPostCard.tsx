import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Platform,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { RedditPost } from '@/lib/types';
import { TextToSpeechService } from '@/lib/text-to-speech';
import { Play, Pause, Share as ShareIcon, Bookmark, BookmarkCheck, ExternalLink, MessageCircle } from 'lucide-react-native';

interface RedditPostCardProps {
  post: RedditPost;
  onSave?: (post: RedditPost) => void;
  showSaveButton?: boolean;
  isSaved?: boolean;
  onStartConversation?: (post: RedditPost) => void;
}

export function RedditPostCard({ 
  post, 
  onSave, 
  showSaveButton = true,
  isSaved = false,
  onStartConversation 
}: RedditPostCardProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [localIsSaved, setLocalIsSaved] = React.useState(isSaved);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        TextToSpeechService.stop();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await TextToSpeechService.generatePodcast(post);
        setIsPlaying(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleShare = async () => {
    try {
      const content = `Check out this Reddit post summary:\n\n${post.title}\n\n${post.summary}\n\nOriginal: ${post.reddit_url}`;
      
      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(content);
      } else {
        await Share.share({
          message: content,
          title: post.title,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleSave = () => {
    if (onSave) {
      setLocalIsSaved(true);
      onSave(post);
    }
  };

  const openRedditUrl = () => {
    // In a real app, you would use Linking.openURL(post.reddit_url)
    Alert.alert('Open Reddit', `Would open: ${post.reddit_url}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={openRedditUrl}
        >
          <ExternalLink size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.summary} numberOfLines={4}>
        {post.summary}
      </Text>

      <View style={styles.viewpointsContainer}>
        <Text style={styles.viewpointsTitle}>Key Viewpoints:</Text>
        {post.viewpoints.slice(0, 2).map((viewpoint, index) => (
          <Text key={index} style={styles.viewpoint} numberOfLines={2}>
            • {viewpoint}
          </Text>
        ))}
        {post.viewpoints.length > 2 && (
          <Text style={styles.moreViewpoints}>
            +{post.viewpoints.length - 2} more viewpoints
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.playButton]} 
          onPress={handlePlayPause}
          disabled={isPlaying}
        >
          {isPlaying ? (
            <Pause size={20} color="white" />
          ) : (
            <Play size={20} color="white" />
          )}
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause' : 'Listen'}
          </Text>
        </TouchableOpacity>

        {onStartConversation && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.conversationButton]} 
            onPress={() => onStartConversation(post)}
          >
            <MessageCircle size={16} color="white" />
            <Text style={styles.conversationButtonText}>Chat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <ShareIcon size={20} color="#6B7280" />
        </TouchableOpacity>

        {showSaveButton && (
          <TouchableOpacity 
            style={[styles.iconButton, localIsSaved && styles.savedButton]} 
            onPress={handleSave}
            disabled={localIsSaved}
          >
            {localIsSaved ? (
              <BookmarkCheck size={20} color="#10B981" />
            ) : (
              <Bookmark size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.timestamp}>
        {new Date(post.created_at).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 24,
  },
  linkButton: {
    padding: 4,
    marginLeft: 8,
  },
  summary: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewpointsContainer: {
    marginBottom: 16,
  },
  viewpointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  viewpoint: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  moreViewpoints: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  playButton: {
    backgroundColor: '#3B82F6',
  },
  playButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  conversationButton: {
    backgroundColor: '#14B8A6',
  },
  conversationButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
  },
  savedButton: {
    backgroundColor: '#F0FDF4',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
});