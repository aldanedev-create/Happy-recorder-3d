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
    color: '#a5b4fc',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(165, 180, 252, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- Progress Section ---
  progressCard: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(23, 23, 38, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(139, 92, 246, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#c4b5fd',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '700',
    textAlign: 'right',
    textShadowColor: 'rgba(56, 189, 248, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // --- Tutorials Section ---
  tutorialsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  tutorialCard: {
    marginBottom: 12,
    padding: 0,
    borderRadius: 14,
    backgroundColor: 'rgba(23, 23, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  tutorialIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  tutorialIcon: {
    fontSize: 22,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
    letterSpacing: 0.2,
  },
  completedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    textShadowColor: 'rgba(74, 222, 128, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
    marginRight: 12,
  },
  levelBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    color: '#ffffff',
    overflow: 'hidden',
    letterSpacing: 0.3,
  },
  expandIcon: {
    fontSize: 12,
    color: '#c4b5fd',
    fontWeight: 'bold',
  },

  // --- Expanded Body & Steps ---
  tutorialBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.15)',
    backgroundColor: 'rgba(15, 15, 26, 0.5)',
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 10,
    lineHeight: 20,
  },
  prereqText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
    marginBottom: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  stepsList: {
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  stepDuration: {
    fontSize: 11,
    color: '#a5b4fc',
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 3,
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  tagChip: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c4b5fd',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginRight: 6,
    marginBottom: 6,
  },
  tutorialActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tutorialButton: {
    minWidth: 140,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },

  // --- Quick Actions ---
  quickActionsCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(23, 23, 38, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minWidth: 120,
  },
  quickActionIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '600',
  },
});

export default Tutorials;