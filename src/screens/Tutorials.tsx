import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import Card from '../components/Card';
import Button from '../components/Button';
import { storageService } from '../services/storage';

// Wired to the shared data file instead of a local hardcoded copy.
// This gives us all 12 tutorials (not just 7), the full step-by-step
// content, categories, and prerequisites for free.
import { TUTORIALS, Tutorial } from '../data/tutorials';

type TutorialsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tutorials'>;

const Tutorials: React.FC = () => {
  const navigation = useNavigation<TutorialsScreenNavigationProp>();

  // Seed from the shared data file, then apply any persisted
  // completion state once it loads (see useEffect below).
  const [tutorials, setTutorials] = useState<Tutorial[]>(TUTORIALS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    storageService
      .loadTutorialProgress()
      .then((completedIds) => {
        if (!mounted) return;
        const completedSet = new Set(completedIds);
        setTutorials(
          TUTORIALS.map((t) => ({
            ...t,
            completed: completedSet.has(t.id) || t.completed,
          }))
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

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
    const updated = tutorials.map((t) =>
      t.id === tutorial.id ? { ...t, completed: true } : t
    );
    setTutorials(updated);

    const completedIds = updated.filter((t) => t.completed).map((t) => t.id);
    storageService.saveTutorialProgress(completedIds).catch((error) => {
      console.error('Failed to save tutorial progress:', error);
    });
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

            {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
              <Text style={styles.prereqText}>
                Requires: {tutorial.prerequisites.join(', ')}
              </Text>
            )}

            {/* Step-by-step breakdown — this data existed in data/tutorials.ts
                but the old screen never rendered it. */}
            <View style={styles.stepsList}>
              {tutorial.steps.map((step, index) => (
                <View key={step.id} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <View style={styles.stepTextContainer}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      {step.duration && (
                        <Text style={styles.stepDuration}>{step.duration}</Text>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.tagRow}>
              {tutorial.tags.map((tag) => (
                <Text key={tag} style={styles.tagChip}>#{tag}</Text>
              ))}
            </View>

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
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Loading tutorials…</Text>
      </View>
    );
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a8a8b8',
    marginTop: 12,
    fontSize: 14,
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
    marginBottom: 8,
    lineHeight: 20,
  },
  prereqText: {
    fontSize: 12,
    color: '#ff9800',
    marginBottom: 12,
  },
  stepsList: {
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    color: '#ffffff',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 10,
    overflow: 'hidden',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
  },
  stepDuration: {
    fontSize: 11,
    color: '#a8a8b8',
  },
  stepDescription: {
    fontSize: 12,
    color: '#a8a8b8',
    marginTop: 2,
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    fontSize: 11,
    color: '#6c63ff',
    marginRight: 8,
    marginBottom: 4,
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