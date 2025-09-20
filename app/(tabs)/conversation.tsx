import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ConversationService } from '@/lib/conversation';
import { ConversationMessage, ConversationState } from '@/lib/types';
import { Mic, MicOff, Send, Trash2, Volume2, VolumeX } from 'lucide-react-native';

export default function ConversationScreen() {
  const { user, loading: authLoading } = useAuth();
  const [conversationState, setConversationState] = useState<ConversationState>(
    ConversationService.getState()
  );
  const [inputText, setInputText] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [waveformAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setConversationState(ConversationService.getState());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (conversationState.isRecording || conversationState.isProcessing) {
      startWaveformAnimation();
    } else {
      stopWaveformAnimation();
    }
  }, [conversationState.isRecording, conversationState.isProcessing]);

  const startWaveformAnimation = () => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveformAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(waveformAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
  };

  const stopWaveformAnimation = () => {
    Animated.timing(waveformAnimation).stop();
    waveformAnimation.setValue(0);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (!conversationState.currentRedditPost) {
      Alert.alert('No Reddit Post', 'Please select a Reddit post from the Home or Saved tab first.');
      return;
    }

    try {
      const message = inputText.trim();
      setInputText('');
      
      await ConversationService.processUserMessage(message);
      setConversationState(ConversationService.getState());
    } catch (error) {
      Alert.alert('Error', 'Failed to process message');
    }
  };

  const handleVoiceToggle = () => {
    if (!conversationState.currentRedditPost) {
      Alert.alert('No Reddit Post', 'Please select a Reddit post from the Home or Saved tab first.');
      return;
    }

    if (conversationState.isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleStartRecording = async () => {
    try {
      await ConversationService.startRecording();
      setConversationState(ConversationService.getState());
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      const transcription = await ConversationService.stopRecording();
      setConversationState(ConversationService.getState());
      
      if (transcription) {
        // Process the transcribed message
        await ConversationService.processUserMessage(transcription);
        setConversationState(ConversationService.getState());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice input');
    }
  };

  const handleStopPlayback = () => {
    ConversationService.stopPlayback();
    setConversationState(ConversationService.getState());
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the current conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            ConversationService.clearConversation();
            setConversationState(ConversationService.getState());
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

  const renderMessage = ({ item }: { item: ConversationMessage }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.role === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={styles.messageTime}>
        {item.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {[...Array(8)].map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: waveformAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [10, Math.random() * 40 + 20],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <MessageCircle size={28} color="#3B82F6" />
            <Text style={styles.title}>AI Chat</Text>
          </View>
          <TouchableOpacity onPress={handleClearConversation}>
            <Trash2 size={24} color="#EF4444" />
          </TouchableOpacity>
          {conversationState.isPlaying && (
            <TouchableOpacity onPress={handleStopPlayback} style={styles.stopButton}>
              <VolumeX size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
        {conversationState.currentRedditPost ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            💬 Discussing: {conversationState.currentRedditPost.title}
          </Text>
        ) : (
          <Text style={styles.subtitle}>🔍 Select a Reddit post to start chatting</Text>
        )}
      </View>

      {conversationState.messages.length === 0 && !conversationState.currentRedditPost ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MessageCircle size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Ready to Chat!</Text>
          <Text style={styles.emptyMessage}>
            Go to Home or Saved tabs and tap the 💬 Chat button on any Reddit post to start an AI-powered conversation.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={conversationState.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />

          {(conversationState.isRecording || conversationState.isProcessing) && renderWaveform()}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your question..."
              multiline
              maxLength={500}
              editable={!conversationState.isProcessing}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  conversationState.isRecording && styles.voiceButtonActive,
                  Platform.OS === 'web' && styles.webVoiceButton
                ]}
                onPress={handleVoiceToggle}
                disabled={conversationState.isProcessing}
              >
                {conversationState.isRecording ? (
                  <MicOff size={24} color="white" />
                ) : (
                  <Mic size={24} color="white" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || conversationState.isProcessing}
              >
                <Send size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {conversationState.isProcessing && (
            <View style={styles.processingContainer}>
              <LoadingSpinner message="AI is thinking..." size="small" />
            </View>
          )}
        </>
      )}
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
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButton: {
    marginLeft: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#14B8A6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
  },
  webVoiceButton: {
    opacity: Platform.OS === 'web' ? 0.8 : 1,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});