import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User, Mail, ChartBar as BarChart3, LogOut, BookmarkCheck, Clock, Calendar, TrendingUp } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateListeningTime = (postsCount: number) => {
    // Estimate 2.5 minutes per post (average podcast length)
    return Math.floor(postsCount * 2.5);
  };

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and settings</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Account Information</Text>
            
            <View style={styles.infoRow}>
              <Mail size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Calendar size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {formatMemberSince(user.created_at)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.cardTitle}>Your Activity</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <BookmarkCheck size={24} color="#3B82F6" />
                </View>
                <Text style={styles.statNumber}>
                  {analyticsLoading ? '...' : (analytics?.saved_posts_count || 0)}
                </Text>
                <Text style={styles.statLabel}>Posts Saved</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Clock size={24} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>
                  {analyticsLoading ? '...' : calculateListeningTime(analytics?.saved_posts_count || 0)}
                </Text>
                <Text style={styles.statLabel}>Minutes Listened</Text>
              </View>
            </View>

            <View style={styles.achievementCard}>
              <TrendingUp size={20} color="#F59E0B" />
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>
                  {(analytics?.saved_posts_count || 0) >= 10 ? 'Power User!' : 'Getting Started'}
                </Text>
                <Text style={styles.achievementDescription}>
                  {(analytics?.saved_posts_count || 0) >= 10 
                    ? 'You\'ve saved 10+ posts! Keep exploring Reddit discussions.'
                    : `Save ${10 - (analytics?.saved_posts_count || 0)} more posts to become a Power User!`
                  }
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Reddit Post Digester v1.0</Text>
          </View>
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
  header: {
    alignItems: 'center',
    padding: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#4F46E5',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  achievementContent: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 18,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});