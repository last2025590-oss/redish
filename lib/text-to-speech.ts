import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { RedditPost } from './types';

export class TextToSpeechService {
  private static isPlaying = false;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  
  static async generatePodcast(post: RedditPost): Promise<void> {
    if (this.isPlaying) {
      this.stop();
      return;
    }
    
    // Create a podcast-style script (60-120 seconds)
    const script = this.createPodcastScript(post);
    
    this.isPlaying = true;
    
    if (Platform.OS === 'web') {
      // Use Web Speech API for web platform
      if ('speechSynthesis' in window) {
        this.currentUtterance = new SpeechSynthesisUtterance(script);
        this.currentUtterance.rate = 0.85;
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 0.9;
        
        // Try to use a more natural voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.lang.startsWith('en')
        );
        if (preferredVoice) {
          this.currentUtterance.voice = preferredVoice;
        }
        
        this.currentUtterance.onstart = () => {
          this.isPlaying = true;
        };
        
        this.currentUtterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
        };
        
        this.currentUtterance.onerror = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
        };
        
        speechSynthesis.speak(this.currentUtterance);
      } else {
        console.warn('Speech synthesis not supported in this browser');
        this.isPlaying = false;
      }
    } else {
      // Use Expo Speech for native platforms
      const options = {
        rate: 0.85,
        pitch: 1.0,
        quality: Speech.VoiceQuality.Enhanced,
        language: 'en-US',
        onDone: () => {
          this.isPlaying = false;
        },
        onStopped: () => {
          this.isPlaying = false;
        },
        onError: () => {
          this.isPlaying = false;
        }
      };
      
      await Speech.speak(script, options);
    }
  }
  
  static stop(): void {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      this.currentUtterance = null;
    } else {
      Speech.stop();
    }
    this.isPlaying = false;
  }
  
  static getPlayingStatus(): boolean {
    return this.isPlaying;
  }
  
  private static createPodcastScript(post: RedditPost): string {
    // Create a more engaging podcast-style script
    const intro = `Welcome to your personalized Reddit digest. Today we're exploring a fascinating discussion from the Reddit community titled: ${post.title}.`;
    
    const summary = `Here's what's happening in this thread. ${post.summary}`;
    
    const viewpointsIntro = "What makes this discussion particularly engaging are the diverse perspectives from Reddit users.";
    
    const viewpointsContent = post.viewpoints
      .map((viewpoint, index) => {
        const transitions = [
          "First, many Redditors argue that",
          "However, others in the thread believe that",
          "There's also a compelling perspective that",
          "Another interesting viewpoint suggests that",
          "Finally, some community members emphasize that"
        ];
        const transition = transitions[index] || "Another viewpoint suggests that";
        return `${transition} ${viewpoint.toLowerCase()}`;
      })
      .join('. ');
    
    const outro = "That's your Reddit digest for this thread. These discussions showcase the depth and complexity of online community conversations. Keep exploring and stay curious!";
    
    // Add natural pauses for better flow
    return [intro, summary, viewpointsIntro, viewpointsContent, outro].join('... ');
  }
}