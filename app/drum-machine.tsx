import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';
import DrumPadView from '../src/components/drum-machine/DrumPadView';
import SequencerView from '../src/components/drum-machine/SequencerView';
import HapticService from '../src/services/HapticService';

export default function DrumMachineScreen() {
  const { colors } = useTheme();
  const [activeView, setActiveView] = useState<'pad' | 'sequencer'>('pad');

  return (
    <>
      <Stack.Screen options={{ title: 'Drum Machine' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* Segmented Control */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable 
            style={[styles.segmentBtn, activeView === 'pad' && { backgroundColor: '#a855f7' }]}
            onPress={() => {
              HapticService.light();
              setActiveView('pad');
            }}
          >
            <Text style={[styles.segmentText, { color: activeView === 'pad' ? '#FFF' : colors.textSecondary }]}>
              Drum Pad
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.segmentBtn, activeView === 'sequencer' && { backgroundColor: '#a855f7' }]}
            onPress={() => {
              HapticService.light();
              setActiveView('sequencer');
            }}
          >
            <Text style={[styles.segmentText, { color: activeView === 'sequencer' ? '#FFF' : colors.textSecondary }]}>
              Sequencer
            </Text>
          </Pressable>
        </View>

        {/* Content View */}
        <View style={styles.content}>
          {activeView === 'pad' ? <DrumPadView /> : <SequencerView />}
        </View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  }
});
