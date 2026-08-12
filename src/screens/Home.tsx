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
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8b8',
    marginTop: 8,
  },
  recordButton: {
    marginBottom: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  quickActionCard: {
    width: Dimensions.get('window').width / 4 - 20,
    height: 80,
    padding: 0,
  },
  quickActionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#e0e0e0',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  seeAllText: {
    color: '#6c63ff',
    fontSize: 14,
  },
  recentScroll: {
    flexDirection: 'row',
  },
  recentCard: {
    width: 160,
    height: 120,
    marginRight: 12,
    padding: 12,
  },
  recentCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recentTypeIcon: {
    fontSize: 24,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  recentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentDuration: {
    fontSize: 12,
    color: '#a8a8b8',
  },
  recentDate: {
    fontSize: 12,
    color: '#6c63ff',
  },
  statusCard: {
    marginTop: 8,
  },
  statusContent: {
    padding: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusDetail: {
    fontSize: 12,
    color: '#a8a8b8',
  },
});

export default Home;