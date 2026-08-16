import React, { useState } from 'react';
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

import Card from '../components/Card';
import Button from '../components/Button';
import Timeline from '../components/Timeline';

type EditorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Editor'>;

interface Clip {
  id: string;
  start: number;
  end: number;
  type: 'video' | 'audio' | 'effect';
  label: string;
}

const Editor: React.FC = () => {
  const navigation = useNavigation<EditorScreenNavigationProp>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes in seconds
  const [selectedTool, setSelectedTool] = useState<'trim' | 'cut' | 'split' | 'crop' | null>(null);
  const [clips, setClips] = useState<Clip[]>([
    { id: '1', start: 0, end: 120, type: 'video', label: 'Main Video' },
    { id: '2', start: 120, end: 240, type: 'video', label: 'Main Video' },
    { id: '3', start: 240, end: 300, type: 'video', label: 'Main Video' },
  ]);

  const handlePlay = () => {
    console.log('▶️ Play');
  };

  const handlePause = () => {
    console.log('⏸ Pause');
  };

  const handleExport = () => {
    console.log('📤 Exporting video...');
    navigation.navigate('Recordings');
  };

  const handleAddMusic = () => {
    console.log('🎵 Add music');
  };

  const handleAddEffect = () => {
    console.log('✨ Add effect');
  };

  const handleAdd3DElement = () => {
    console.log('🧊 Add 3D element');
  };

  const renderToolbar = () => {
    const tools = [
      { id: 'trim', label: '✂️ Trim' },
      { id: 'cut', label: '🔪 Cut' },
      { id: 'split', label: '📎 Split' },
      { id: 'crop', label: '🌾 Crop' },
    ];

    return (
      <View style={styles.toolbar}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.toolButton,
              selectedTool === tool.id && styles.toolButtonActive,
            ]}
            onPress={() => setSelectedTool(tool.id as typeof selectedTool)}
          >
            <Text style={styles.toolButtonText}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Video Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.previewPlaceholder}>
          <Text style={styles.previewText}>🎬 Video Preview</Text>
          <Text style={styles.previewSubtext}>{duration}s • 1080p</Text>
        </View>
        
        {/* Playback Controls */}
        <View style={styles.playbackControls}>
          <TouchableOpacity onPress={handlePlay} style={styles.playbackButton}>
            <Text style={styles.playbackIcon}>▶️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePause} style={styles.playbackButton}>
            <Text style={styles.playbackIcon}>⏸️</Text>
          </TouchableOpacity>
          <Text style={styles.timeDisplay}>
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / 
            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <Timeline
          duration={duration}
          currentTime={currentTime}
          clips={clips}
          onTimeChange={setCurrentTime}
        />
      </View>

      {/* Tools */}
      <ScrollView style={styles.toolsContainer} contentContainerStyle={styles.toolsContent}>
        {renderToolbar()}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            title="🎵 Add Music"
            onPress={handleAddMusic}
            variant="secondary"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="✨ Add Effect"
            onPress={handleAddEffect}
            variant="secondary"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="🧊 3D Element"
            onPress={handleAdd3DElement}
            variant="secondary"
            size="small"
            style={styles.actionButton}
          />
        </View>

        {/* Export Button */}
        <Button
          title="📤 Export Video"
          onPress={handleExport}
          variant="primary"
          size="large"
          style={styles.exportButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090a0f',
  },
  previewContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewPlaceholder: {
    height: 260,
    backgroundColor: '#030407',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  previewSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
  },
  playbackButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 4,
  },
  playbackIcon: {
    fontSize: 18,
  },
  timeDisplay: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    fontVariant: ['tabular-nums'],
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
  },
  toolsContainer: {
    flex: 1,
  },
  toolsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  toolbar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toolButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
  },
  toolButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justify: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  exportButton: {
    marginTop: 8,
    backgroundColor: '#6366f1',
    borderRadius: 10,
  },
});

export default Editor;