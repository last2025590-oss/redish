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
  onOpenUrl?: (url: string) => void;
}

export function RedditPostCard({ 
  post, 
  onSave, 
  showSaveButton = true,
  isSaved = false,
  onStartConversation,
  onOpenUrl
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
    if (onOpenUrl) {
      onOpenUrl(post.reddit_url);
    } else {
      Alert.alert('Open Reddit', `Would open: ${post.reddit_url}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.urlContainer}
        onPress={openRedditUrl}
        activeOpacity={0.7}
      >
        <ExternalLink size={14} color="#3B82F6" />
        <Text style={styles.urlText} numberOfLines={1}>
          {post.reddit_url.replace('https://www.reddit.com', 'reddit.com')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.summary} numberOfLines={5}>
        {post.summary}
      </Text>

      <View style={styles.viewpointsContainer}>
        <Text style={styles.viewpointsTitle}>💭 Key Community Viewpoints</Text>
        {post.viewpoints.slice(0, 2).map((viewpoint, index) => (
          <Text key={index} style={styles.viewpoint} numberOfLines={2}>
            {index === 0 ? '🔹' : '🔸'} {viewpoint}
          </Text>
        ))}
        {post.viewpoints.length > 2 && (
          <Text style={styles.moreViewpoints}>
            ✨ +{post.viewpoints.length - 2} more perspectives in discussion
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
            {isPlaying ? 'Playing...' : '🎧 Listen'}
          </Text>
        </TouchableOpacity>

        {onStartConversation && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.conversationButton]} 
            onPress={() => onStartConversation(post)}
          >
            <MessageCircle size={16} color="white" />
            <Text style={styles.conversationButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <ShareIcon size={18} color="#6B7280" />
          </TouchableOpacity>

          {showSaveButton && (
            <TouchableOpacity 
              style={[styles.iconButton, localIsSaved && styles.savedButton]} 
              onPress={handleSave}
              disabled={localIsSaved}
            >
              {localIsSaved ? (
                <BookmarkCheck size={18} color="#10B981" />
              ) : (
                <Bookmark size={18} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.timestamp}>
        📅 {new Date(post.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 26,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  urlText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  summary: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  viewpointsContainer: {
    marginBottom: 16,
  },
  viewpointsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  viewpoint: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  moreViewpoints: {
    fontSize: 13,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginTop: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playButton: {
    backgroundColor: '#4F46E5',
  },
  playButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  conversationButton: {
    backgroundColor: '#059669',
  },
  conversationButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  timestamp: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '500',
  },
});