declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      OPENAI_API_KEY: string;
      GEMINI_API_KEY: string;
    }
  }
}

export {};