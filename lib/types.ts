export interface RedditPost {
  id: string;
  user_id: string;
  reddit_url: string;
  title: string;
  summary: string;
  viewpoints: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  user_id: string;
  saved_posts_count: number;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

export interface ConversationState {
  messages: ConversationMessage[];
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  currentRedditPost?: RedditPost;
}

export interface SummaryResponse {
  title: string;
  summary: string;
  viewpoints: string[];
}