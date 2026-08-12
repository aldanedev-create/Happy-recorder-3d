import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import Card from '../components/Card';
import Button from '../components/Button';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsState {
  // General
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  autoSavePath: string;
  
  // Recording
  defaultQuality: '720p' | '1080p' | '4K';
  defaultFps: 30 | 60 | 120;
  showCursor: boolean;
  highlightClicks: boolean;
  showHotkeys: boolean;
  
  // Audio
  microphoneDevice: string;
  microphoneVolume: number;
  systemAudio: boolean;
  systemAudioDevice: string;
  
  // Export
  exportFormat: 'mp4' | 'mov' | 'avi';
  exportQuality: 'high' | 'medium' | 'low';
  exportPath: string;
  
  // Performance
  hardwareAcceleration: boolean;
  maxMemoryUsage: 'low' | 'medium' | 'high';
  
  // Privacy
  analyticsOptIn: boolean;
  crashReports: boolean;
}

const Settings: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    language: 'English',
    autoSave: true,
    autoSavePath: '~/Documents/HappyRecorder/Recordings',
    defaultQuality: '1080p',
    defaultFps: 60,
    showCursor: true,
    highlightClicks: true,
    showHotkeys: true,
    microphoneDevice: 'Default Microphone',
    microphoneVolume: 80,
    systemAudio: true,
    systemAudioDevice: 'Default System Audio',
    exportFormat: 'mp4',
    exportQuality: 'high',
    exportPath: '~/Documents/HappyRecorder/Exports',
    hardwareAcceleration: true,
    maxMemoryUsage: 'medium',
    analyticsOptIn: false,
    crashReports: true,
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

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
              {['light', 'dark', 'system'].map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeButton,
                    settings.theme === theme && styles.themeButtonActive,
                  ]}
                  onPress={() => setSettings({ ...settings, theme: theme as any })}
                >
                  <Text style={styles.themeButtonText}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Language</Text>
            <TextInput
              style={styles.input}
              value={settings.language}
              onChangeText={(text) => setSettings({ ...settings, language: text })}
              placeholder="Language"
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Save</Text>
            <Switch
              value={settings.autoSave}
              onValueChange={(value) => setSettings({ ...settings, autoSave: value })}
            />
          </View>
          
          {settings.autoSave && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Save Path</Text>
              <TextInput
                style={styles.input}
                value={settings.autoSavePath}
                onChangeText={(text) => setSettings({ ...settings, autoSavePath: text })}
                placeholder="Save path"
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
              {['720p', '1080p', '4K'].map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityButton,
                    settings.defaultQuality === quality && styles.qualityButtonActive,
                  ]}
                  onPress={() => setSettings({ ...settings, defaultQuality: quality as any })}
                >
                  <Text style={styles.qualityButtonText}>{quality}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default FPS</Text>
            <View style={styles.fpsButtons}>
              {[30, 60, 120].map((fps) => (
                <TouchableOpacity
                  key={fps}
                  style={[
                    styles.fpsButton,
                    settings.defaultFps === fps && styles.fpsButtonActive,
                  ]}
                  onPress={() => setSettings({ ...settings, defaultFps: fps as any })}
                >
                  <Text style={styles.fpsButtonText}>{fps}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Cursor</Text>
            <Switch
              value={settings.showCursor}
              onValueChange={(value) => setSettings({ ...settings, showCursor: value })}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Highlight Clicks</Text>
            <Switch
              value={settings.highlightClicks}
              onValueChange={(value) => setSettings({ ...settings, highlightClicks: value })}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Hotkeys</Text>
            <Switch
              value={settings.showHotkeys}
              onValueChange={(value) => setSettings({ ...settings, showHotkeys: value })}
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
              value={settings.microphoneDevice}
              onChangeText={(text) => setSettings({ ...settings, microphoneDevice: text })}
              placeholder="Microphone device"
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Microphone Volume</Text>
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeValue}>{settings.microphoneVolume}%</Text>
              <View style={styles.volumeBar}>
                <View style={[styles.volumeFill, { width: `${settings.microphoneVolume}%` }]} />
              </View>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>System Audio</Text>
            <Switch
              value={settings.systemAudio}
              onValueChange={(value) => setSettings({ ...settings, systemAudio: value })}
            />
          </View>
          
          {settings.systemAudio && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>System Audio Device</Text>
              <TextInput
                style={styles.input}
                value={settings.systemAudioDevice}
                onChangeText={(text) => setSettings({ ...settings, systemAudioDevice: text })}
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
              {['mp4', 'mov', 'avi'].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatButton,
                    settings.exportFormat === format && styles.formatButtonActive,
                  ]}
                  onPress={() => setSettings({ ...settings, exportFormat: format as any })}
                >
                  <Text style={styles.formatButtonText}>{format.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Quality</Text>
            <View style={styles.exportQualityButtons}>
              {['high', 'medium', 'low'].map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.exportQualityButton,
                    settings.exportQuality === quality && styles.exportQualityButtonActive,
                  ]}
                  onPress={() => setSettings({ ...settings, exportQuality: quality as any })}
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
              value={settings.exportPath}
              onChangeText={(text) => setSettings({ ...settings, exportPath: text })}
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
              value={settings.hardwareAcceleration}
              onValueChange={(value) => setSettings({ ...settings, hardwareAcceleration: value })}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Max Memory Usage</Text>
            <View style={styles.memoryButtons}>
              {['low', 'medium', 'high'].map((memory) => (
                <TouchableOpacity
                  key={memory}
                  style={[
                    styles.memoryButton,
                    settings.maxMemoryUsage === memory && styles.memoryButtonActive,
                  ]}
                  onPress={() => setSettings({ ...settings, maxMemoryUsage: memory as any })}
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
              value={settings.analyticsOptIn}
              onValueChange={(value) => setSettings({ ...settings, analyticsOptIn: value })}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Crash Reports</Text>
            <Switch
              value={settings.crashReports}
              onValueChange={(value) => setSettings({ ...settings, crashReports: value })}
            />
          </View>
        </View>
      )}
    </Card>
  );

  const handleSaveSettings = () => {
    console.log('💾 Settings saved:', settings);
    // Save to storage
  };

  const handleResetSettings = () => {
    console.log('🔄 Settings reset');
    // Reset to defaults
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Settings Sections */}
      {renderGeneralSettings()}
      {renderRecordingSettings()}
      {renderAudioSettings()}
      {renderExportSettings()}
      {renderPerformanceSettings()}
      {renderPrivacySettings()}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title="💾 Save Settings"
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

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Happy Recorder 3D v0.1.0</Text>
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