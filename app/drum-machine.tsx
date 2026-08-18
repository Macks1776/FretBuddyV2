import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Modal, ScrollView } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { useDrumMachineStore } from '../src/store/useDrumMachineStore';
import DrumPadView from '../src/components/drum-machine/DrumPadView';
import SequencerView from '../src/components/drum-machine/SequencerView';
import HapticService from '../src/services/HapticService';
import { HelpCircle, X } from 'lucide-react-native';

export default function DrumMachineScreen() {
  const { colors } = useTheme();
  const [activeView, setActiveView] = useState<'pad' | 'sequencer'>('pad');
  const [showHelp, setShowHelp] = useState(false);

  // Stop playback when leaving screen if global playback is disabled
  useFocusEffect(
    useCallback(() => {
      // Screen focused
      return () => {
        // Screen blurred
        if (!useSettingsStore.getState().drumMachineGlobalPlayback) {
          useDrumMachineStore.getState().setPlaying(false);
        }
      };
    }, [])
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Drum Machine',
          headerRight: () => (
            <Pressable onPress={() => setShowHelp(true)}>
              <HelpCircle size={24} color={colors.text} />
            </Pressable>
          )
        }} 
      />
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

        {/* Help Modal */}
        <Modal visible={showHelp} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Reference</Text>
                <Pressable onPress={() => setShowHelp(false)}>
                  <X size={24} color={colors.textSecondary} />
                </Pressable>
              </View>
              <ScrollView>
                <Text style={[styles.helpSubtitle, { color: '#a855f7' }]}>Drum Pad</Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Tap pads to play sounds manually.
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Long-press a pad to assign a different sound or adjust its volume.
                </Text>

                <Text style={[styles.helpSubtitle, { color: '#a855f7', marginTop: 16 }]}>Sequencer</Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Tap the grid to create a beat. Each row represents a sound, and each column is a step in time.
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Press Play to start the loop.
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Tap the Sound Icon on the left of any row to assign a new sound for that track.
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Adjust Tempo (BPM) using the top controls.
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Steps:</Text> Controls the total length of your loop (e.g., 16 or 32 steps).
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Res (Resolution):</Text> Determines the musical duration of each step. "16n" means each step is a 16th note, while "8n" means each step is an 8th note.
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Swing:</Text> Delays off-beat notes to create a shuffle or groove feel (adjustable per part).
                </Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  • Save and load your favorite chains using the folder icon.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  helpSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  }
});
