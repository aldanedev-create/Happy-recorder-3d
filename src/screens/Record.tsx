import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

type RecordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Record'>;

type RecordingMode = 'normal' | 'tutorial' | 'project' | 'bug';

interface RecordingConfig {
  mode: RecordingMode;
  screen: {
    fullScreen: boolean;
    window: boolean;
    region: boolean;
    monitor: boolean;
  };
  camera: boolean;
  microphone: boolean;
  systemAudio: boolean;
  quality: '720p' | '1080p' | '4K';
  fps: 30 | 60 | 120;
  projectName?: string;
  bugTitle?: string;
  bugApplication?: string;
  bugVersion?: string;
}

const Record: React.FC = () => {
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [config, setConfig] = useState<RecordingConfig>({
    mode: 'normal',
    screen: {
      fullScreen: true,
      window: false,
      region: false,
      monitor: false,
    },
    camera: true,
    microphone: true,
    systemAudio: false,
    quality: '1080p',
    fps: 60,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectPurpose, setProjectPurpose] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugApplication, setBugApplication] = useState('');
  const [bugVersion, setBugVersion] = useState('');
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const handleModeSelect = (mode: RecordingMode) => {
    setConfig({ ...config, mode });
    if (mode === 'project') {
      setShowProjectModal(true);
    } else if (mode === 'bug') {
      setShowBugModal(true);
    }
  };

  const handleStartRecording = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setCountdown(3);
    setShowCountdown(true);
    let count = 3;
    countdownInterval.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        countdownInterval.current = null;
        setShowCountdown(false);
        setIsRecording(true);
        // Start actual recording logic here
        console.log('🎥 Recording started with config:', config);
      }
    }, 1000);
  };

  const handleStopRecording = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    countdownInterval.current = null;
    setShowCountdown(false);
    setIsRecording(false);
    // Stop recording logic here
    console.log('⏹ Recording stopped');
    navigation.navigate('Editor');
  };

  const renderScreenOptions = () => {
    const options = [
      { key: 'fullScreen', label: 'Full Screen' },
      { key: 'window', label: 'Window' },
      { key: 'region', label: 'Region' },
      { key: 'monitor', label: 'Monitor' },
    ];

    return (
      <View style={styles.screenOptions}>
        <Text style={styles.label}>Screen Recording</Text>
        <View style={styles.screenOptionGrid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.screenOption,
                config.screen[option.key as keyof typeof config.screen] && styles.screenOptionActive,
              ]}
              onPress={() => {
                // Reset all screen options
                const newScreen = {
                  fullScreen: false,
                  window: false,
                  region: false,
                  monitor: false,
                };
                // Set the selected one
                newScreen[option.key as keyof typeof newScreen] = true;
                setConfig({ ...config, screen: newScreen });
              }}
            >
              <Text style={styles.screenOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderModeSpecificConfig = () => {
    switch (config.mode) {
      case 'tutorial':
        return (
          <Card style={styles.modeConfigCard}>
            <Text style={styles.modeConfigTitle}>🎓 Tutorial Mode Settings</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Cursor Highlighting</Text>
              <Switch value={true} onValueChange={() => undefined} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Click Effects</Text>
              <Switch value={true} onValueChange={() => undefined} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Zoom Effects</Text>
              <Switch value={false} onValueChange={() => undefined} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Keyboard Display</Text>
              <Switch value={false} onValueChange={() => undefined} />
            </View>
          </Card>
        );
      case 'project':
        return (
          <Card style={styles.modeConfigCard}>
            <Text style={styles.modeConfigTitle}>📁 Project Mode</Text>
            <Text style={styles.modeConfigSubtitle}>Project: {projectName || 'Not set'}</Text>
            <Text style={styles.modeConfigSubtitle}>Purpose: {projectPurpose || 'Not set'}</Text>
          </Card>
        );
      case 'bug':
        return (
          <Card style={styles.modeConfigCard}>
            <Text style={styles.modeConfigTitle}>🐛 Bug Report Mode</Text>
            <Text style={styles.modeConfigSubtitle}>Bug: {bugTitle || 'Not set'}</Text>
            <Text style={styles.modeConfigSubtitle}>App: {bugApplication || 'Not set'}</Text>
            <Text style={styles.modeConfigSubtitle}>Version: {bugVersion || 'Not set'}</Text>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Mode Selection */}
      <View style={styles.modeSection}>
        <Text style={styles.sectionTitle}>Recording Mode</Text>
        <View style={styles.modeGrid}>
          {['normal', 'tutorial', 'project', 'bug'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                config.mode === mode && styles.modeButtonActive,
              ]}
              onPress={() => handleModeSelect(mode as RecordingMode)}
            >
              <Text style={styles.modeIcon}>
                {mode === 'normal' && '🎥'}
                {mode === 'tutorial' && '🎓'}
                {mode === 'project' && '📁'}
                {mode === 'bug' && '🐛'}
              </Text>
              <Text style={styles.modeText}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Screen Options */}
      {renderScreenOptions()}

      {/* Audio/Video Toggles */}
      <Card style={styles.togglesCard}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>📷 Camera</Text>
          <Switch
            value={config.camera}
            onValueChange={(value) => setConfig({ ...config, camera: value })}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>🎙 Microphone</Text>
          <Switch
            value={config.microphone}
            onValueChange={(value) => setConfig({ ...config, microphone: value })}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>🔊 System Audio</Text>
          <Switch
            value={config.systemAudio}
            onValueChange={(value) => setConfig({ ...config, systemAudio: value })}
          />
        </View>
      </Card>

      {/* Quality Settings */}
      <Card style={styles.qualityCard}>
        <Text style={styles.label}>Quality & Performance</Text>
        <View style={styles.qualityRow}>
          <TouchableOpacity
            style={[styles.qualityOption, config.quality === '720p' && styles.qualityOptionActive]}
            onPress={() => setConfig({ ...config, quality: '720p' })}
          >
            <Text style={styles.qualityText}>720p</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qualityOption, config.quality === '1080p' && styles.qualityOptionActive]}
            onPress={() => setConfig({ ...config, quality: '1080p' })}
          >
            <Text style={styles.qualityText}>1080p</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qualityOption, config.quality === '4K' && styles.qualityOptionActive]}
            onPress={() => setConfig({ ...config, quality: '4K' })}
          >
            <Text style={styles.qualityText}>4K</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.qualityRow}>
          {[30, 60, 120].map((fps) => (
            <TouchableOpacity
              key={fps}
              style={[styles.qualityOption, config.fps === fps && styles.qualityOptionActive]}
              onPress={() => setConfig({ ...config, fps: fps as 30 | 60 | 120 })}
            >
              <Text style={styles.qualityText}>{fps} FPS</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Mode Specific Config */}
      {renderModeSpecificConfig()}

      {/* Recording Controls */}
      {!isRecording ? (
        <Button
          title="🎬 START RECORDING"
          onPress={handleStartRecording}
          variant="danger"
          size="large"
          style={styles.recordButton}
        />
      ) : (
        <Button
          title="⏹ STOP RECORDING"
          onPress={handleStopRecording}
          variant="danger"
          size="large"
          style={[styles.recordButton, styles.stopButton]}
        />
      )}

      {/* Countdown Modal */}
      <Modal
        visible={showCountdown}
        transparent
        animationType="fade"
      >
        <View style={styles.countdownContainer}>
          <Text testID="recording-countdown" style={styles.countdownText}>{countdown}</Text>
          <Text style={styles.countdownSubtext}>Recording starting...</Text>
        </View>
      </Modal>

      {/* Project Modal */}
      <Modal
        visible={showProjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📁 Project Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Project Name"
              placeholderTextColor="#666"
              value={projectName}
              onChangeText={setProjectName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Purpose (Demonstration, Presentation, etc.)"
              placeholderTextColor="#666"
              value={projectPurpose}
              onChangeText={setProjectPurpose}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowProjectModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => setShowProjectModal(false)}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bug Modal */}
      <Modal
        visible={showBugModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBugModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🐛 Bug Report</Text>
            <TextInput
              style={styles.input}
              placeholder="Bug Title"
              placeholderTextColor="#666"
              value={bugTitle}
              onChangeText={setBugTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Application"
              placeholderTextColor="#666"
              value={bugApplication}
              onChangeText={setBugApplication}
            />
            <TextInput
              style={styles.input}
              placeholder="Version"
              placeholderTextColor="#666"
              value={bugVersion}
              onChangeText={setBugVersion}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowBugModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => setShowBugModal(false)}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  modeSection: {
    marginBottom: 20,
  },
  modeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  modeText: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  screenOptions: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#a8a8b8',
    marginBottom: 8,
  },
  screenOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  screenOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  screenOptionActive: {
    backgroundColor: '#6c63ff',
  },
  screenOptionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  togglesCard: {
    marginBottom: 20,
    padding: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    color: '#e0e0e0',
    fontSize: 16,
  },
  qualityCard: {
    marginBottom: 20,
    padding: 16,
  },
  qualityRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  qualityOption: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  qualityOptionActive: {
    backgroundColor: '#6c63ff',
  },
  qualityText: {
    color: '#ffffff',
    fontSize: 14,
  },
  modeConfigCard: {
    marginBottom: 20,
    padding: 16,
  },
  modeConfigTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  modeConfigSubtitle: {
    fontSize: 14,
    color: '#a8a8b8',
    marginBottom: 4,
  },
  recordButton: {
    marginTop: 10,
  },
  stopButton: {
    backgroundColor: '#ff4444',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  countdownSubtext: {
    fontSize: 20,
    color: '#a8a8b8',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonConfirm: {
    backgroundColor: '#6c63ff',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Record;
