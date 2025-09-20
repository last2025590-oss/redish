import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Analytics } from '@/lib/types';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    } else {
      setAnalytics(null);
      setLoading(false);
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No analytics record exists, create one
        const { data: newData, error: insertError } = await supabase
          .from('analytics')
          .insert([
            {
              user_id: user.id,
              saved_posts_count: 0,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }

      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Don't show alert for missing analytics, just log it
    } finally {
      setLoading(false);
    }
  };

  const incrementSavedPosts = async () => {
    if (!user || !analytics) return;

    try {
      // Ensure analytics record exists before incrementing
      if (!analytics) {
        await loadAnalytics();
        return;
      }

      const { data, error } = await supabase
        .from('analytics')
        .update({
          saved_posts_count: analytics.saved_posts_count + 1,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error incrementing saved posts:', error);
    }
  };

  return {
    analytics,
    loading,
    incrementSavedPosts,
    refetch: loadAnalytics,
  };
}