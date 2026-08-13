import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import Card from '../components/Card';
import Button from '../components/Button';
import { storageService } from '../services/storage';

// Wired to the shared data file instead of a flat local duplicate.
import {
  AppSettings,
  DEFAULT_SETTINGS,
  validateSettings,
} from '../data/settings';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const Settings: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    let mounted = true;
    storageService
      .loadSettings()
      .then((loaded) => {
        if (mounted) setSettings(loaded);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Small typed helpers for updating nested slices without repeating
  // { ...settings, x: { ...settings.x, y: value } } everywhere.
  const updateTheme = (patch: Partial<AppSettings['theme']>) =>
    setSettings({ ...settings, theme: { ...settings.theme, ...patch } });

  const updateUI = (patch: Partial<AppSettings['ui']>) =>
    setSettings({ ...settings, ui: { ...settings.ui, ...patch } });

  const updateRecording = (patch: Partial<AppSettings['recording']>) =>
    setSettings({ ...settings, recording: { ...settings.recording, ...patch } });

  const updateAudio = (patch: Partial<AppSettings['audio']>) =>
    setSettings({ ...settings, audio: { ...settings.audio, ...patch } });

  const updateExport = (patch: Partial<AppSettings['export']>) =>
    setSettings({ ...settings, export: { ...settings.export, ...patch } });

  const updateStorage = (patch: Partial<AppSettings['storage']>) =>
    setSettings({ ...settings, storage: { ...settings.storage, ...patch } });

  const updatePrivacy = (patch: Partial<AppSettings['privacy']>) =>
    setSettings({ ...settings, privacy: { ...settings.privacy, ...patch } });

  // Requires the PerformanceSettings patch from data/settings.patch.ts.
  // If you haven't applied it yet, this line (and the section below)
  // will error — apply the patch first, or delete the Performance
  // section below until you do.
  const updatePerformance = (patch: Partial<AppSettings['performance']>) =>
    setSettings({ ...settings, performance: { ...settings.performance, ...patch } });

  const renderGeneralSettings = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('general')}
      >
        <Text style={styles.sectionTitle}>⚙️ General</Text>
        <Text style={styles.sectionIcon}>{activeSection === 'general' ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeSection === 'general' && (
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeButtons}>
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeButton,
                    settings.theme.mode === mode && styles.themeButtonActive,
                  ]}
                  onPress={() => updateTheme({ mode })}
                >
                  <Text style={styles.themeButtonText}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Language</Text>
            <TextInput
              style={styles.input}
              value={settings.ui.language}
              onChangeText={(text) => updateUI({ language: text })}
              placeholder="Language"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Cleanup</Text>
            <Switch
              value={settings.storage.autoCleanup}
              onValueChange={(value) => updateStorage({ autoCleanup: value })}
            />
          </View>

          {settings.storage.autoCleanup && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Recordings Path</Text>
              <TextInput
                style={styles.input}
                value={settings.storage.recordingsPath}
                onChangeText={(text) => updateStorage({ recordingsPath: text })}
                placeholder="Recordings path"
                placeholderTextColor="#666"
              />
            </View>
          )}
        </View>
      )}
    </Card>
  );

  const renderRecordingSettings = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('recording')}
      >
        <Text style={styles.sectionTitle}>🎥 Recording</Text>
        <Text style={styles.sectionIcon}>{activeSection === 'recording' ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeSection === 'recording' && (
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Quality</Text>
            <View style={styles.qualityButtons}>
              {(['720p', '1080p', '4K'] as const).map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityButton,
                    settings.recording.defaultQuality === quality && styles.qualityButtonActive,
                  ]}
                  onPress={() => updateRecording({ defaultQuality: quality })}
                >
                  <Text style={styles.qualityButtonText}>{quality}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default FPS</Text>
            <View style={styles.fpsButtons}>
              {([30, 60, 120] as const).map((fps) => (
                <TouchableOpacity
                  key={fps}
                  style={[
                    styles.fpsButton,
                    settings.recording.defaultFps === fps && styles.fpsButtonActive,
                  ]}
                  onPress={() => updateRecording({ defaultFps: fps })}
                >
                  <Text style={styles.fpsButtonText}>{fps}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Cursor</Text>
            <Switch
              value={settings.recording.showCursor}
              onValueChange={(value) => updateRecording({ showCursor: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Highlight Clicks</Text>
            <Switch
              value={settings.recording.highlightClicks}
              onValueChange={(value) => updateRecording({ highlightClicks: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Hotkeys</Text>
            <Switch
              value={settings.recording.showHotkeys}
              onValueChange={(value) => updateRecording({ showHotkeys: value })}
            />
          </View>
        </View>
      )}
    </Card>
  );

  const renderAudioSettings = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('audio')}
      >
        <Text style={styles.sectionTitle}>🎙 Audio</Text>
        <Text style={styles.sectionIcon}>{activeSection === 'audio' ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeSection === 'audio' && (
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Microphone</Text>
            <TextInput
              style={styles.input}
              value={settings.audio.microphoneDevice}
              onChangeText={(text) => updateAudio({ microphoneDevice: text })}
              placeholder="Microphone device"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Microphone Volume</Text>
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeValue}>{settings.audio.microphoneVolume}%</Text>
              <View style={styles.volumeBar}>
                <View style={[styles.volumeFill, { width: `${settings.audio.microphoneVolume}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>System Audio</Text>
            <Switch
              value={settings.audio.systemAudioEnabled}
              onValueChange={(value) => updateAudio({ systemAudioEnabled: value })}
            />
          </View>

          {settings.audio.systemAudioEnabled && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>System Audio Device</Text>
              <TextInput
                style={styles.input}
                value={settings.audio.systemAudioDevice}
                onChangeText={(text) => updateAudio({ systemAudioDevice: text })}
                placeholder="System audio device"
                placeholderTextColor="#666"
              />
            </View>
          )}
        </View>
      )}
    </Card>
  );

  const renderExportSettings = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('export')}
      >
        <Text style={styles.sectionTitle}>📤 Export</Text>
        <Text style={styles.sectionIcon}>{activeSection === 'export' ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeSection === 'export' && (
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Format</Text>
            <View style={styles.formatButtons}>
              {(['mp4', 'mov', 'avi'] as const).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatButton,
                    settings.export.format === format && styles.formatButtonActive,
                  ]}
                  onPress={() => updateExport({ format })}
                >
                  <Text style={styles.formatButtonText}>{format.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Quality</Text>
            <View style={styles.exportQualityButtons}>
              {(['high', 'medium', 'low'] as const).map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.exportQualityButton,
                    settings.export.quality === quality && styles.exportQualityButtonActive,
                  ]}
                  onPress={() => updateExport({ quality })}
                >
                  <Text style={styles.exportQualityButtonText}>
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Export Path</Text>
            <TextInput
              style={styles.input}
              value={settings.export.exportPath}
              onChangeText={(text) => updateExport({ exportPath: text })}
              placeholder="Export path"
              placeholderTextColor="#666"
            />
          </View>
        </View>
      )}
    </Card>
  );

  const renderPerformanceSettings = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('performance')}
      >
        <Text style={styles.sectionTitle}>⚡ Performance</Text>
        <Text style={styles.sectionIcon}>{activeSection === 'performance' ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeSection === 'performance' && (
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Hardware Acceleration</Text>
            <Switch
              value={settings.performance.hardwareAcceleration}
              onValueChange={(value) => updatePerformance({ hardwareAcceleration: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Max Memory Usage</Text>
            <View style={styles.memoryButtons}>
              {(['low', 'medium', 'high'] as const).map((memory) => (
                <TouchableOpacity
                  key={memory}
                  style={[
                    styles.memoryButton,
                    settings.performance.maxMemoryUsage === memory && styles.memoryButtonActive,
                  ]}
                  onPress={() => updatePerformance({ maxMemoryUsage: memory })}
                >
                  <Text style={styles.memoryButtonText}>
                    {memory.charAt(0).toUpperCase() + memory.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('privacy')}
      >
        <Text style={styles.sectionTitle}>🔒 Privacy</Text>
        <Text style={styles.sectionIcon}>{activeSection === 'privacy' ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {activeSection === 'privacy' && (
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Analytics Opt-in</Text>
            <Switch
              value={settings.privacy.analyticsEnabled}
              onValueChange={(value) => updatePrivacy({ analyticsEnabled: value })}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Crash Reports</Text>
            <Switch
              value={settings.privacy.crashReportsEnabled}
              onValueChange={(value) => updatePrivacy({ crashReportsEnabled: value })}
            />
          </View>
        </View>
      )}
    </Card>
  );

  const handleSaveSettings = async () => {
    const result = validateSettings(settings);
    if (!result.valid) {
      setErrors(result.errors);
      console.warn('⚠️ Settings validation failed:', result.errors);
      return;
    }
    setErrors([]);
    try {
      await storageService.saveSettings(settings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setErrors(['Failed to save settings to disk. Check app permissions.']);
    }
  };

  const handleResetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    setErrors([]);
    try {
      await storageService.resetSettings();
    } catch (error) {
      console.error('Failed to reset settings on disk:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Loading settings…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderGeneralSettings()}
      {renderRecordingSettings()}
      {renderAudioSettings()}
      {renderExportSettings()}
      {renderPerformanceSettings()}
      {renderPrivacySettings()}

      {errors.length > 0 && (
        <View style={styles.errorBox}>
          {errors.map((err) => (
            <Text key={err} style={styles.errorText}>⚠️ {err}</Text>
          ))}
        </View>
      )}

      <View style={styles.actionContainer}>
        <Button
          title={saveStatus === 'saved' ? '✅ Saved' : '💾 Save Settings'}
          onPress={handleSaveSettings}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
        <Button
          title="🔄 Reset to Defaults"
          onPress={handleResetSettings}
          variant="secondary"
          size="medium"
          style={styles.actionButton}
        />
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Happy Recorder 3D v{settings.version}</Text>
        <Text style={styles.versionSubtext}>Open Source • MIT License</Text>
      </View>
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
  sectionCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionIcon: {
    fontSize: 12,
    color: '#a8a8b8',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#e0e0e0',
    flex: 1,
  },
  input: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 8,
    color: '#ffffff',
    fontSize: 14,
  },
  themeButtons: {
    flexDirection: 'row',
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 4,
  },
  themeButtonActive: {
    backgroundColor: '#6c63ff',
  },
  themeButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  qualityButtons: {
    flexDirection: 'row',
  },
  qualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 4,
  },
  qualityButtonActive: {
    backgroundColor: '#6c63ff',
  },
  qualityButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  fpsButtons: {
    flexDirection: 'row',
  },
  fpsButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 4,
  },
  fpsButtonActive: {
    backgroundColor: '#6c63ff',
  },
  fpsButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  volumeContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeValue: {
    color: '#ffffff',
    fontSize: 14,
    marginRight: 8,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 2,
  },
  formatButtons: {
    flexDirection: 'row',
  },
  formatButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 4,
  },
  formatButtonActive: {
    backgroundColor: '#6c63ff',
  },
  formatButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  exportQualityButtons: {
    flexDirection: 'row',
  },
  exportQualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 4,
  },
  exportQualityButtonActive: {
    backgroundColor: '#6c63ff',
  },
  exportQualityButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  memoryButtons: {
    flexDirection: 'row',
  },
  memoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginLeft: 4,
  },
  memoryButtonActive: {
    backgroundColor: '#6c63ff',
  },
  memoryButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 13,
    marginBottom: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  versionText: {
    fontSize: 14,
    color: '#a8a8b8',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default Settings;