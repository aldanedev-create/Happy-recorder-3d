import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Animated,
} from 'react-native';

interface Clip {
  id: string;
  start: number;
  end: number;
  type: 'video' | 'audio' | 'effect';
  label: string;
}

interface TimelineProps {
  duration: number;
  currentTime: number;
  clips: Clip[];
  onTimeChange: (time: number) => void;
  onClipSelect?: (clip: Clip) => void;
  zoomLevel?: number;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  clips,
  onTimeChange,
  onClipSelect,
  zoomLevel = 1,
}) => {
  const timelineWidth = Dimensions.get('window').width - 32;
  const [isDragging, setIsDragging] = useState(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const x = gestureState.moveX - 16; // Account for padding
        const ratio = Math.max(0, Math.min(1, x / timelineWidth));
        const time = ratio * duration;
        onTimeChange(Math.round(time));
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const getTimeString = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getClipColor = (type: string): string => {
    switch (type) {
      case 'video': return '#6c63ff';
      case 'audio': return '#4caf50';
      case 'effect': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getTimelineMarkers = (): number[] => {
    const markers: number[] = [];
    const interval = duration > 60 ? 10 : 5;
    for (let i = 0; i <= duration; i += interval) {
      markers.push(i);
    }
    return markers;
  };

  const renderClips = () => {
    return clips.map((clip) => {
      const startPercent = (clip.start / duration) * 100;
      const widthPercent = ((clip.end - clip.start) / duration) * 100;
      
      return (
        <TouchableOpacity
          key={clip.id}
          style={[
            styles.clip,
            {
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: getClipColor(clip.type),
            },
          ]}
          onPress={() => onClipSelect?.(clip)}
        >
          <Text style={styles.clipLabel}>{clip.label}</Text>
        </TouchableOpacity>
      );
    });
  };

  const renderRuler = () => {
    const markers = getTimelineMarkers();
    return (
      <View style={styles.ruler}>
        {markers.map((marker, index) => {
          const position = (marker / duration) * 100;
          return (
            <View key={index} style={[styles.rulerMark, { left: `${position}%` }]}>
              <View style={styles.rulerTick} />
              <Text style={styles.rulerLabel}>{getTimeString(marker)}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Ruler */}
      {renderRuler()}

      {/* Timeline Track */}
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          {/* Clips */}
          {renderClips()}
          
          {/* Playhead */}
          <View
            style={[
              styles.playhead,
              { left: `${(currentTime / duration) * 100}%` },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.playheadLine} />
            <View style={styles.playheadHandle}>
              <Text style={styles.playheadTime}>{getTimeString(currentTime)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Time Display */}
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>{getTimeString(currentTime)}</Text>
        <Text style={styles.timeText}>{getTimeString(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  ruler: {
    height: 30,
    position: 'relative',
    marginBottom: 4,
  },
  rulerMark: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -8 }],
  },
  rulerTick: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  rulerLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  trackContainer: {
    height: 60,
    position: 'relative',
  },
  track: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  clip: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
    opacity: 0.8,
  },
  clipLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 20,
    alignItems: 'center',
    transform: [{ translateX: -10 }],
    zIndex: 10,
  },
  playheadLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#ff4444',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  playheadHandle: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#ff4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  playheadTime: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default Timeline;