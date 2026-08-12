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
    backgroundColor: 'transparent',
  },
  previewContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    margin: 16,
    borderRadius: 12,
  },
  previewPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 24,
    color: '#ffffff',
    opacity: 0.6,
  },
  previewSubtext: {
    fontSize: 14,
    color: '#a8a8b8',
    marginTop: 8,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  playbackIcon: {
    fontSize: 24,
  },
  timeDisplay: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 16,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toolsContainer: {
    flex: 1,
  },
  toolsContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  toolbar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toolButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: '#6c63ff',
  },
  toolButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  exportButton: {
    marginTop: 8,
  },
});

export default Editor;