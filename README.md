# Reddit Post Digester

A React Native app built with Expo Router that transforms Reddit posts into digestible summaries with AI-powered insights and conversation capabilities.

## Features

### Core Features
- **Tab Navigation**: Home, Saved, Profile, and Conversation tabs
- **Supabase Authentication**: Secure email/password auth with Row Level Security
- **Reddit URL Processing**: Paste Reddit URLs to get AI-powered summaries
- **Text-to-Speech**: Generate 60-120 second mini-podcasts from summaries
- **Save & Share**: Save posts to your personal collection and share with others
- **Analytics**: Track your saved posts count and listening time
- **User Profile**: View account info, statistics, and manage settings

### Bonus - Conversation Mode 🚀
- **Real-time Voice Chat**: Ask follow-up questions about Reddit posts
- **Two-way Conversation**: Support for back-and-forth dialogue
- **Mock AI Integration**: Simulates Gemini Live/OpenAI Realtime API responses
- **Visual Feedback**: Waveform animations and transcript display
- **Voice Controls**: Tap-to-talk with mic toggle functionality

## Tech Stack

- **React Native** with Expo Router for navigation
- **Supabase** for authentication and database
- **TypeScript** for type safety
- **Expo Speech** for text-to-speech functionality
- **Expo Sharing** for sharing posts
- **Expo AV** for audio recording/playback (placeholder)
- **Lucide React Native** for icons

## Project Structure

```
├── app/
│   ├── (tabs)/           # Tab navigation screens
│   │   ├── index.tsx     # Home screen
│   │   ├── saved.tsx     # Saved posts
│   │   ├── conversation.tsx # AI conversation
│   │   └── profile.tsx   # User profile
│   └── _layout.tsx       # Root layout
├── components/           # Reusable UI components
│   ├── AuthForm.tsx      # Authentication form
│   ├── RedditPostCard.tsx # Post display component
│   └── LoadingSpinner.tsx # Loading indicator
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication logic
│   └── useAnalytics.ts   # User analytics
├── lib/                  # Core business logic
│   ├── supabase.ts       # Database client
│   ├── reddit-api.ts     # Reddit URL processing
│   ├── text-to-speech.ts # TTS functionality
│   ├── conversation.ts   # AI conversation logic
│   └── types.ts          # TypeScript definitions
└── supabase/
    └── migrations/       # Database schema
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key  # Optional for conversation mode
GEMINI_API_KEY=your_gemini_api_key  # Optional for conversation mode
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the migration file in the SQL editor (copy the entire contents):
   ```sql
   -- Copy contents from supabase/migrations/20250919030155_soft_grove.sql
   ```
3. Update your `.env` with the project URL and anon key
4. Verify both `posts` and `analytics` tables are created with proper RLS policies

### 4. Start Development Server
```bash
expo start
```

## Usage Guide

### Getting Started
1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Process Reddit Posts**: Paste a Reddit URL in the Home tab to get an AI summary
3. **Listen to Summaries**: Tap "Listen" to hear a generated podcast-style summary
4. **Save Posts**: Tap the bookmark icon to save posts to your collection
5. **Share Posts**: Use the share icon to share summaries with others

### Conversation Mode
1. **Start a Chat**: Tap "Chat" on any processed Reddit post
2. **Ask Questions**: Type or use voice input to ask follow-up questions
3. **Voice Interaction**: Tap the microphone for voice-to-voice conversation
4. **View Transcript**: See the full conversation history with timestamps

### Profile & Analytics
- View your email and member since date
- Track total saved posts count
- See estimated listening time
- Sign out when needed

## Architecture Notes

### Authentication & Security
- Uses Supabase Auth with email/password (no magic links)
- Row Level Security (RLS) ensures users only access their own data
- All database queries are properly secured with user-specific policies

### Data Flow
1. **Reddit Processing**: URL → Mock API → Summary + Viewpoints
2. **Storage**: Processed posts saved to Supabase with user association
3. **Analytics**: Real-time tracking of user engagement metrics
4. **Conversation**: Stateful chat with context about specific Reddit posts

### Mock Services
- **Reddit API**: Simulates post analysis with realistic responses
- **AI Conversation**: Mock responses based on post content and user input
- **Voice Processing**: Placeholder for actual speech-to-text integration

## Trade-offs & Considerations

### Conversation Mode Implementation
- **Mock API**: Uses simulated responses instead of real Gemini/OpenAI integration
- **Voice Input**: Placeholder implementation - would need actual STT in production
- **State Management**: Simple client-side state - could benefit from Redux for complex apps
- **Audio Processing**: Uses basic Expo AV - production would need advanced audio handling

### Performance Considerations
- **Offline Support**: Not implemented - all features require internet
- **Caching**: Limited caching of Reddit summaries - could improve with AsyncStorage
- **Audio Quality**: Basic TTS - production would benefit from premium voices
- **Database Queries**: Optimized with indexes but could add pagination for large datasets

### Production Readiness
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Loading States**: Proper loading indicators throughout the app
- **Form Validation**: Input validation for Reddit URLs and user data
- **Security**: RLS policies prevent unauthorized data access
- **Responsive Design**: Optimized for various screen sizes

## Future Enhancements

1. **Real AI Integration**: Connect to actual Gemini Live or OpenAI Realtime APIs
2. **Advanced Voice**: Implement true speech-to-text with noise cancellation  
3. **Offline Mode**: Cache summaries for offline reading
4. **Push Notifications**: Notify users of trending discussions
5. **Social Features**: Share conversations and collaborate on post analysis
6. **Analytics Dashboard**: Detailed insights on reading patterns and preferences

## Development Notes

- All hooks are called at the top of components (no conditional hook calls)
- Proper TypeScript typing throughout the application
- Clean, modern UI with consistent spacing and shadow patterns
- Comprehensive error handling with user-friendly messages
- Modular architecture allows easy feature additions and testing