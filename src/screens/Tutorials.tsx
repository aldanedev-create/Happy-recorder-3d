import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import Card from '../components/Card';
import Button from '../components/Button';

type TutorialsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tutorials'>;

interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
}

const Tutorials: React.FC = () => {
  const navigation = useNavigation<TutorialsScreenNavigationProp>();
  const [tutorials, setTutorials] = useState<Tutorial[]>([
    {
      id: '1',
      title: 'Getting Started',
      description: 'Learn the basics of Happy Recorder 3D',
      icon: '🚀',
      duration: '2:30',
      level: 'beginner',
      completed: false,
    },
    {
      id: '2',
      title: 'Record Your Screen',
      description: 'How to capture your screen with different modes',
      icon: '🎥',
      duration: '3:15',
      level: 'beginner',
      completed: false,
    },
    {
      id: '3',
      title: 'Record Your Camera',
      description: 'Add camera overlay to your recordings',
      icon: '📷',
      duration: '4:00',
      level: 'beginner',
      completed: true,
    },
    {
      id: '4',
      title: 'Edit a Recording',
      description: 'Trim, cut, and enhance your videos',
      icon: '✂️',
      duration: '5:20',
      level: 'intermediate',
      completed: false,
    },
    {
      id: '5',
      title: 'Add Background Music',
      description: 'Import and edit music for your recordings',
      icon: '🎵',
      duration: '3:45',
      level: 'intermediate',
      completed: false,
    },
    {
      id: '6',
      title: 'Add 3D Elements',
      description: 'Incorporate 3D objects into your videos',
      icon: '🧊',
      duration: '6:10',
      level: 'advanced',
      completed: false,
    },
    {
      id: '7',
      title: 'Export Your Video',
      description: 'Export recordings in different formats',
      icon: '📤',
      duration: '2:50',
      level: 'beginner',
      completed: false,
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return '🟢 Beginner';
      case 'intermediate': return '🟡 Intermediate';
      case 'advanced': return '🔴 Advanced';
      default: return level;
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStartTutorial = (tutorial: Tutorial) => {
    console.log(`▶️ Starting tutorial: ${tutorial.title}`);
    // Mark as completed
    setTutorials(
      tutorials.map((t) =>
        t.id === tutorial.id ? { ...t, completed: true } : t
      )
    );
  };

  const renderTutorial = (tutorial: Tutorial) => {
    const isExpanded = expandedId === tutorial.id;

    return (
      <Card key={tutorial.id} style={styles.tutorialCard}>
        <TouchableOpacity
          style={styles.tutorialHeader}
          onPress={() => handleToggleExpand(tutorial.id)}
        >
          <View style={styles.tutorialIconContainer}>
            <Text style={styles.tutorialIcon}>{tutorial.icon}</Text>
          </View>
          <View style={styles.tutorialInfo}>
            <View style={styles.tutorialTitleRow}>
              <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
              {tutorial.completed && (
                <Text style={styles.completedBadge}>✅ Done</Text>
              )}
            </View>
            <View style={styles.tutorialMeta}>
              <Text style={styles.metaText}>⏱ {tutorial.duration}</Text>
              <Text style={[styles.levelBadge, { backgroundColor: getLevelColor(tutorial.level) }]}>
                {getLevelLabel(tutorial.level)}
              </Text>
            </View>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.tutorialBody}>
            <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
            <View style={styles.tutorialActions}>
              <Button
                title={tutorial.completed ? '🔄 Replay' : '▶️ Start Tutorial'}
                onPress={() => handleStartTutorial(tutorial)}
                variant={tutorial.completed ? 'secondary' : 'primary'}
                size="small"
                style={styles.tutorialButton}
              />
            </View>
          </View>
        )}
      </Card>
    );
  };

  const completedCount = tutorials.filter((t) => t.completed).length;
  const totalCount = tutorials.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Section */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>📚 Tutorial Progress</Text>
          <Text style={styles.progressText}>
            {completedCount} / {totalCount} completed
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </Card>

      {/* Tutorials List */}
      <View style={styles.tutorialsSection}>
        <Text style={styles.sectionTitle}>📖 Available Tutorials</Text>
        {tutorials.map(renderTutorial)}
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Record')}
          >
            <Text style={styles.quickActionIcon}>🎬</Text>
            <Text style={styles.quickActionLabel}>Start Recording</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Recordings')}
          >
            <Text style={styles.quickActionIcon}>📁</Text>
            <Text style={styles.quickActionLabel}>View Recordings</Text>
          </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 40,
  },
  progressCard: {
    marginBottom: 20,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressText: {
    fontSize: 14,
    color: '#a8a8b8',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#a8a8b8',
    textAlign: 'right',
  },
  tutorialsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  tutorialCard: {
    marginBottom: 10,
    padding: 0,
    overflow: 'hidden',
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tutorialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tutorialIcon: {
    fontSize: 20,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginRight: 8,
  },
  completedBadge: {
    fontSize: 12,
    color: '#4caf50',
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#a8a8b8',
    marginRight: 12,
  },
  levelBadge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    color: '#ffffff',
    overflow: 'hidden',
  },
  expandIcon: {
    fontSize: 12,
    color: '#a8a8b8',
  },
  tutorialBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#a8a8b8',
    marginBottom: 12,
    lineHeight: 20,
  },
  tutorialActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tutorialButton: {
    minWidth: 140,
  },
  quickActionsCard: {
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#a8a8b8',
  },
});

export default Tutorials;