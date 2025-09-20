import { ConversationMessage, ConversationState, RedditPost } from './types';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export class ConversationService {
  private static conversationState: ConversationState = {
    messages: [],
    isRecording: false,
    isProcessing: false,
    isPlaying: false,
    currentRedditPost: undefined
  };
  
  private static recording: Audio.Recording | null = null;
  private static sound: Audio.Sound | null = null;
  
  static getState(): ConversationState {
    return { ...this.conversationState };
  }
  
  static setRedditPost(post: RedditPost): void {
    this.conversationState.currentRedditPost = post;
    this.conversationState.messages = [{
      id: Date.now().toString(),
      role: 'assistant',
      content: `I'm ready to discuss this Reddit post: "${post.title}". What would you like to know?`,
      timestamp: new Date(),
      isAudio: false
    }];
  }
  
  static async initializeAudio(): Promise<void> {
    if (Platform.OS === 'web') {
      console.warn('Audio recording not available on web platform');
      return;
    }
    
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }
  
  static async startRecording(): Promise<void> {
    if (Platform.OS === 'web') {
      // Simulate recording for web
      this.conversationState.isRecording = true;
      return;
    }
    
    try {
      await this.initializeAudio();
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
      this.conversationState.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.conversationState.isRecording = false;
    }
  }
  
  static async stopRecording(): Promise<string | null> {
    this.conversationState.isRecording = false;
    
    if (Platform.OS === 'web') {
      // Simulate voice input for web
      return "This is a simulated voice input for web platform";
    }
    
    try {
      if (!this.recording) return null;
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      
      // In a real implementation, you would send this audio to a speech-to-text service
      // For now, we'll simulate the transcription
      return this.simulateTranscription();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }
  
  private static simulateTranscription(): string {
    const sampleQuestions = [
      "What are the main arguments in this discussion?",
      "Can you explain this topic in more detail?",
      "What do you think about the different viewpoints?",
      "How does this relate to current events?",
      "What are the implications of this discussion?"
    ];
    
    return sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
  }
  
  static async processUserMessage(message: string): Promise<ConversationMessage> {
    // Add user message
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      isAudio: true
    };
    
    this.conversationState.messages.push(userMessage);
    this.conversationState.isProcessing = true;
    
    try {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = await this.generateAIResponse(message);
      
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isAudio: true
      };
      
      this.conversationState.messages.push(assistantMessage);
      this.conversationState.isProcessing = false;
      
      // Play AI response as audio
      await this.playAIResponse(aiResponse);
      
      return assistantMessage;
    } catch (error) {
      this.conversationState.isProcessing = false;
      throw error;
    }
  }
  
  private static async generateAIResponse(userMessage: string): Promise<string> {
    const post = this.conversationState.currentRedditPost;
    
    if (!post) {
      return "I don't have a Reddit post loaded to discuss. Please share a Reddit URL first.";
    }
    
    // Enhanced AI response generation based on context
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
      return `Here's a comprehensive summary: ${post.summary}. This discussion has generated significant interest due to its relevance to current trends and diverse perspectives.`;
    }
    
    if (lowerMessage.includes('viewpoint') || lowerMessage.includes('opinion') || lowerMessage.includes('perspective')) {
      const viewpoint = post.viewpoints[Math.floor(Math.random() * post.viewpoints.length)];
      return `One particularly interesting perspective from the discussion is: ${viewpoint}. This viewpoint reflects a broader trend in how people are thinking about this topic.`;
    }
    
    if (lowerMessage.includes('detail') || lowerMessage.includes('more') || lowerMessage.includes('explain')) {
      return `Let me elaborate on that. ${post.summary} The community discussion reveals several key themes: ${post.viewpoints.slice(0, 2).join(', and ')}. These perspectives highlight the complexity of the issue.`;
    }
    
    if (lowerMessage.includes('argument') || lowerMessage.includes('debate')) {
      return `The main arguments in this discussion center around different approaches to the topic. ${post.viewpoints.join('. Another perspective suggests ')}. These varying viewpoints create a rich dialogue.`;
    }
    
    if (lowerMessage.includes('implication') || lowerMessage.includes('impact')) {
      return `The implications of this discussion are quite significant. Based on the Reddit thread, this could impact how we think about similar issues in the future. The community seems particularly concerned about the long-term effects.`;
    }
    
    // Contextual responses based on conversation history
    const conversationLength = this.conversationState.messages.length;
    if (conversationLength > 4) {
      return `That's a great follow-up question. Building on our previous discussion about ${post.title}, I think this adds another layer to consider. The Reddit community's insights suggest there are multiple valid approaches to this topic.`;
    }
    
    // Default contextual responses
    const responses = [
      `That's an insightful question about this Reddit discussion. Based on the thread about ${post.title}, the community seems divided but engaged.`,
      `Interesting point. The Reddit post you shared touches on this topic, and the community responses show there's real depth to this issue.`,
      `Good question. From what I can see in the Reddit discussion, this is exactly the kind of nuanced topic that generates thoughtful debate.`,
      `That's worth exploring further. The original Reddit post and community responses suggest this is a multifaceted issue with valid concerns on different sides.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  private static async playAIResponse(text: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use Web Speech API for text-to-speech on web
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
          this.conversationState.isPlaying = true;
        };
        
        utterance.onend = () => {
          this.conversationState.isPlaying = false;
        };
        
        speechSynthesis.speak(utterance);
      }
      return;
    }
    
    try {
      // For native platforms, you would typically use a TTS service
      // For now, we'll simulate audio playback
      this.conversationState.isPlaying = true;
      
      // Simulate audio duration based on text length
      const duration = Math.max(2000, text.length * 50);
      
      setTimeout(() => {
        this.conversationState.isPlaying = false;
      }, duration);
      
    } catch (error) {
      console.error('Failed to play AI response:', error);
      this.conversationState.isPlaying = false;
    }
  }
  
  static stopPlayback(): void {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (this.sound) {
      this.sound.stopAsync();
    }
    
    this.conversationState.isPlaying = false;
  }
  
  static clearConversation(): void {
    this.conversationState.messages = [];
    this.conversationState.currentRedditPost = undefined;
    this.conversationState.isRecording = false;
    this.conversationState.isProcessing = false;
    this.conversationState.isPlaying = false;
  }
}