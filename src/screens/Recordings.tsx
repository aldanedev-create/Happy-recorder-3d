import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import Card from '../components/Card';
import Button from '../components/Button';
import { storageService } from '../services/storage';

type RecordingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recordings'>;

interface RecordingItem {
  id: string;
  title: string;
  duration: string;
  date: string;
  size: string;
  mode: 'normal' | 'tutorial' | 'project' | 'bug';
  thumbnail?: string;
}

const Recordings: React.FC = () => {
  const navigation = useNavigation<RecordingsScreenNavigationProp>();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  /*
    {
      id: '1',
      title: 'Network Security Project Demo',
      duration: '04:32',
      date: '2026-08-10 14:30',
      size: '245 MB',
      mode: 'project',
    },
    {
      id: '2',
      title: 'React Native Tutorial - Part 2',
      duration: '08:21',
      date: '2026-08-09 10:15',
      size: '412 MB',
      mode: 'tutorial',
    },
    {
      id: '3',
      title: 'Login Button Bug Report',
      duration: '02:15',
      date: '2026-08-08 16:45',
      size: '89 MB',
      mode: 'bug',
    },
    {
      id: '4',
      title: 'Project Presentation - Team Meeting',
      duration: '12:08',
      date: '2026-08-07 09:00',
      size: '678 MB',
      mode: 'normal',
    },
    {
      id: '5',
      title: 'Code Review Session',
      duration: '06:42',
      date: '2026-08-06 11:20',
      size: '324 MB',
      mode: 'normal',
    },
  ];
  */

  const [filter, setFilter] = useState<'all' | 'normal' | 'tutorial' | 'project' | 'bug'>('all');

  useEffect(() => {
    void storageService.getAllRecordings().then((items) => {
      setRecordings(items.map((item) => ({
        id: item.id,
        title: item.title,
        duration: new Date(item.duration * 1000).toISOString().slice(14, 19),
        date: new Date(item.timestamp).toLocaleString(),
        size: `${Math.max(1, Math.round(item.fileSize / (1024 * 1024)))} MB`,
        mode: item.mode,
      })));
    }).catch((error) => console.error('Failed to load recordings:', error));
  }, []);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'project': return '📁';
      case 'tutorial': return '🎓';
      case 'bug': return '🐛';
      default: return '🎥';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'project': return '#6c63ff';
      case 'tutorial': return '#ff6b6b';
      case 'bug': return '#ffd93d';
      default: return '#6bcbff';
    }
  };

  const filteredRecordings = recordings.filter(
    (rec) => filter === 'all' || rec.mode === filter
  );

  const handlePlayRecording = (id: string) => {
    console.log(`▶️ Playing recording ${id}`);
    navigation.navigate('Editor');
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings(recordings.filter((rec) => rec.id !== id));
  };

  const renderFilterButtons = () => {
    const filters = [
      { id: 'all', label: 'All' },
      { id: 'normal', label: '🎥 Normal' },
      { id: 'tutorial', label: '🎓 Tutorial' },
      { id: 'project', label: '📁 Project' },
      { id: 'bug', label: '🐛 Bug' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterButton,
              filter === f.id && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.id as typeof filter)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === f.id && styles.filterButtonTextActive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderRecordingItem = ({ item }: { item: RecordingItem }) => (
    <Card style={styles.recordingCard}>
      <View style={styles.recordingContent}>
        <View style={styles.recordingHeader}>
          <View style={[styles.modeBadge, { backgroundColor: getModeColor(item.mode) }]}>
            <Text style={styles.modeBadgeText}>{getModeIcon(item.mode)}</Text>
          </View>
          <Text style={styles.recordingTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <View style={styles.recordingMeta}>
          <Text style={styles.metaText}>⏱ {item.duration}</Text>
          <Text style={styles.metaText}>📅 {item.date}</Text>
          <Text style={styles.metaText}>💾 {item.size}</Text>
        </View>

        <View style={styles.recordingActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={() => handlePlayRecording(item.id)}
          >
            <Text style={styles.actionButtonText}>▶️ Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('Editor')}
          >
            <Text style={styles.actionButtonText}>✂️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteRecording(item.id)}
          >
            <Text style={styles.actionButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {renderFilterButtons()}

      <FlatList
        data={filteredRecordings}
        renderItem={renderRecordingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>No recordings found</Text>
            <Text style={styles.emptySubtext}>Start recording to see your videos here</Text>
            <Button
              title="Start Recording"
              onPress={() => navigation.navigate('Record')}
              variant="primary"
              size="medium"
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxHeight: 64,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: '#6366f1',
  },
  filterButtonText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filterButtonTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  recordingCard: {
    marginBottom: 14,
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  recordingContent: {
    flex: 1,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeBadgeText: {
    fontSize: 18,
  },
  recordingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  recordingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 16,
    fontVariant: ['tabular-nums'],
  },
  recordingActions: {
    flexDirection: 'row',
    justify: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  playButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
    borderColor: '#6366f1',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  actionButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.85,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 28,
  },
  emptyButton: {
    width: 220,
    borderRadius: 12,
  },
});

export default Recordings;
