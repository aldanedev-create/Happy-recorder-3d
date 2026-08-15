import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import Home from './screens/Home';
import Record from './screens/Record';
import Editor from './screens/Editor';
import Recordings from './screens/Recordings';
import Tutorials from './screens/Tutorials';
import Settings from './screens/Settings';

// Import Three.js background component
import ThreeBackground from './components/ThreeBackground';
import { storageService } from './services/storage';
import { nativeService } from './services/native';

// Navigation stack
const Stack = createNativeStackNavigator();

// Type definitions for navigation
export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Editor: undefined;
  Recordings: undefined;
  Tutorials: undefined;
  Settings: undefined;
};

const App = (): React.ReactElement => {
  useEffect(() => {
    void storageService.initialize().catch((error) =>
      console.error('Unable to initialize app storage:', error)
    );
    void nativeService.getSystemInfo().catch((error: unknown) =>
      console.error('Unable to fetch system info:', error)
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Three.js Background - Renders behind everything */}
      <View style={styles.threeContainer}>
        <ThreeBackground />
      </View>
      
      {/* Navigation */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: 'rgba(26, 26, 46, 0.8)',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitle: 'Back',
            contentStyle: styles.screenContent,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={Home} 
            options={{ 
              title: '🎥 Happy Recorder 3D',
              headerLargeTitle: true,
            }}
          />
          <Stack.Screen 
            name="Record" 
            component={Record} 
            options={{ title: '🎬 Record' }}
          />
          <Stack.Screen 
            name="Editor" 
            component={Editor} 
            options={{ title: '✂️ Editor' }}
          />
          <Stack.Screen 
            name="Recordings" 
            component={Recordings} 
            options={{ title: '📁 Recordings' }}
          />
          <Stack.Screen 
            name="Tutorials" 
            component={Tutorials} 
            options={{ title: '📚 Tutorials' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={Settings} 
            options={{ title: '⚙️ Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  threeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  screenContent: {
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    flex: 1,
  },
});

export default App;