import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

// Import components
import Card from '../components/Card';
import Button from '../components/Button';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface RecentRecording {
  id: string;
  title: string;
  duration: string;
  date: string;
  type: 'project' | 'tutorial' | 'bug';
}

const Home: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Sample recent recordings data
  const recentRecordings: RecentRecording[] = [
    {
      id: '1',
      title: 'Network Security Project',
      duration: '04:32',
      date: '2026-08-10',
      type: 'project',
    },
    {
      id: '2',
      title: 'React Native Tutorial',
      duration: '08:21',
      date: '2026-08-09',
      type: 'tutorial',
    },
    {
      id: '3',
      title: 'Login Button Bug Report',
      duration: '02:15',
      date: '2026-08-08',
      type: 'bug',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📁';
      case 'tutorial':
        return '🎓';
      case 'bug':
        return '🐛';
      default:
        return '🎥';
    }
  };

  const handleStartRecording = () => {
    navigation.navigate('Record');
  };

  const handleViewRecordings = () => {
    navigation.navigate('Recordings');
  };

  const handleOpenTutorials = () => {
    navigation.navigate('Tutorials');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>✨ Welcome Back</Text>
        <Text style={styles.subtitle}>Ready to record something amazing?</Text>
      </View>

      {/* Main Record Button */}
      <Button
        title="🎥 START RECORDING"
        onPress={handleStartRecording}
        variant="primary"
        size="large"
        style={styles.recordButton}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Card style={styles.quickActionCard}>
          <TouchableOpacity onPress={handleViewRecordings} style={styles.quickActionContent}>
            <Text style={styles.quickActionIcon}>📁</Text>
            <Text style={styles.quickActionText}>Library</Text>
          </TouchableOpacity>
        </Card>
        <Card style={styles.quickActionCard}>
          <TouchableOpacity onPress={handleOpenTutorials} style={styles.quickActionContent}>
            <Text style={styles.quickActionIcon}>📚</Text>
            <Text style={styles.quickActionText}>Tutorials</Text>
          </TouchableOpacity>
        </Card>
        <Card style={styles.quickActionCard}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.quickActionContent}>
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Recent Recordings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📹 Recent Recordings</Text>
          <TouchableOpacity onPress={handleViewRecordings}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
          {recentRecordings.map((recording) => (
            <Card key={recording.id} style={styles.recentCard}>
              <View style={styles.recentCardContent}>
                <Text style={styles.recentTypeIcon}>
                  {getTypeIcon(recording.type)}
                </Text>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {recording.title}
                </Text>
                <View style={styles.recentMeta}>
                  <Text style={styles.recentDuration}>⏱ {recording.duration}</Text>
                  <Text style={styles.recentDate}>{recording.date}</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Status Section */}
      <Card style={styles.statusCard}>
        <View style={styles.statusContent}>
          <Text style={styles.statusText}>🟢 Application Status</Text>
          <Text style={styles.statusDetail}>Ready to record • Storage: 245GB free</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  content: {
    paddingHorizontal: 40,
    paddingVertical: 32,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 6,
  },
  recordButton: {
    marginBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 160,
    height: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 0,
  },
  quickActionContent: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    padding: 12,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  seeAllText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '500',
  },
  recentScroll: {
    flexDirection: 'row',
  },
  recentCard: {
    width: 220,
    height: 130,
    marginRight: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  recentCardContent: {
    flex: 1,
    justify: 'space-between',
  },
  recentTypeIcon: {
    fontSize: 22,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  recentMeta: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  recentDuration: {
    fontSize: 12,
    color: '#94a3b8',
  },
  recentDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#818cf8',
  },
  statusCard: {
    marginTop: 8,
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statusContent: {
    padding: 0,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  statusDetail: {
    fontSize: 13,
    color: '#94a3b8',
  },
});

export default Home;