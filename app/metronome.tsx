import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, DeviceEventEmitter, Animated, Switch, Modal } from 'react-native';
import { useMetronomeStore } from '../src/store/useMetronomeStore';
import { useTheme } from '../src/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import HapticService from '../src/services/HapticService';
import { Play, Square, Minus, Plus, Settings, X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Stack } from 'expo-router';

export default function MetronomeScreen() {
  const { colors } = useTheme();
  const { 
    bpm, isPlaying, beatsPerBar, 
    backgroundFlashEnabled, ringPulseEnabled, soundType,
    setBpm, togglePlay, setPlaying, setBeatsPerBar, 
    setBackgroundFlashEnabled, setRingPulseEnabled, setSoundType
  } = useMetronomeStore();
  
  const [currentBeat, setCurrentBeat] = useState(0);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setPlaying(false);
    };
  }, []);

  // Listen to beat events from ToneService
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('onMetronomeBeat', (beatNumber: number) => {
      setCurrentBeat(beatNumber);
      
      // Haptics (Heavy on downbeat, medium on offbeats)
      if (beatNumber === 0) {
        HapticService.heavy();
      } else {
        HapticService.light();
      }

      // Visual pulse
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      subscription.remove();
    };
  }, [pulseAnim]);

  const pulseBackgroundColor = backgroundFlashEnabled ? pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background, currentBeat === 0 ? '#ff007f30' : '#00e5ff30']
  }) : colors.background;

  const pulseBorderColor = ringPulseEnabled ? pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, currentBeat === 0 ? '#ff007f' : '#00e5ff']
  }) : colors.border;

  return (
    <>
      <Stack.Screen options={{ title: 'Metronome' }} />
      <Animated.View style={[styles.container, { backgroundColor: pulseBackgroundColor }]}>
        
        {/* Settings Icon */}
        <Pressable 
          style={styles.settingsIconBtn}
        onPress={() => {
          HapticService.light();
          setSettingsModalVisible(true);
        }}
      >
        <Settings color={colors.textSecondary} size={28} />
      </Pressable>

      {/* Visualizer Ring */}
      <View style={styles.visualizerContainer}>
        <Animated.View style={[
          styles.visualizerRing, 
          { borderColor: pulseBorderColor, shadowColor: pulseBorderColor }
        ]}>
          <Text style={[styles.bpmText, { color: colors.text, textShadowColor: '#ff007f', textShadowRadius: 10 }]}>
            {bpm}
          </Text>
          <Text style={[styles.bpmLabel, { color: colors.textSecondary }]}>BPM</Text>
        </Animated.View>
      </View>

      {/* Time Signature */}
      <View style={styles.timeSignatureContainer}>
        {[3, 4, 5, 6].map((beats) => (
          <Pressable 
            key={beats}
            style={[
              styles.tsBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
              beatsPerBar === beats && { borderColor: '#a855f7', backgroundColor: '#a855f720' }
            ]}
            onPress={() => {
              HapticService.medium();
              setBeatsPerBar(beats);
            }}
          >
            <Text style={[
              styles.tsBtnText, 
              { color: colors.textSecondary },
              beatsPerBar === beats && { color: '#a855f7', fontWeight: 'bold' }
            ]}>
              {beats}/4
            </Text>
          </Pressable>
        ))}
      </View>

      {/* BPM Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.sliderRow}>
          <Pressable 
            style={[styles.adjustBtn, { backgroundColor: colors.surface }]}
            onPress={() => {
              HapticService.light();
              setBpm(Math.max(30, bpm - 1));
            }}
          >
            <Minus color={colors.text} size={24} />
          </Pressable>
          
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={300}
            step={1}
            value={bpm}
            onValueChange={(val) => setBpm(val)}
            minimumTrackTintColor="#ff007f"
            maximumTrackTintColor={colors.border}
            thumbTintColor="#00e5ff"
          />

          <Pressable 
            style={[styles.adjustBtn, { backgroundColor: colors.surface }]}
            onPress={() => {
              HapticService.light();
              setBpm(Math.min(300, bpm + 1));
            }}
          >
            <Plus color={colors.text} size={24} />
          </Pressable>
        </View>
      </View>

      {/* Play Button */}
      <View style={styles.playContainer}>
        <Pressable 
          onPress={() => {
            HapticService.heavy();
            togglePlay();
          }}
        >
          <LinearGradient
            colors={isPlaying ? ['#ff007f', '#d946ef'] : ['#00e5ff', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playBtn}
          >
            {isPlaying ? (
              <Square color="#fff" size={40} fill="#fff" />
            ) : (
              <Play color="#fff" size={40} fill="#fff" style={{ marginLeft: 6 }} />
            )}
          </LinearGradient>
        </Pressable>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Visual Settings</Text>
              <Pressable onPress={() => { HapticService.light(); setSettingsModalVisible(false); }}>
                <X color={colors.textSecondary} size={24} />
              </Pressable>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Background Flash</Text>
              <Switch 
                value={backgroundFlashEnabled}
                onValueChange={setBackgroundFlashEnabled}
                trackColor={{ false: colors.border, true: '#a855f7' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Ring Pulse</Text>
              <Switch 
                value={ringPulseEnabled}
                onValueChange={setRingPulseEnabled}
                trackColor={{ false: colors.border, true: '#a855f7' }}
                thumbColor="#fff"
              />
            </View>

            <Text style={[styles.settingSectionTitle, { color: colors.textSecondary }]}>Audio Sound</Text>
            <View style={styles.soundTypeContainer}>
              {(['beep', 'click', 'woodblock'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.soundTypeBtn,
                    { borderColor: colors.border },
                    soundType === type && { backgroundColor: '#3b82f640', borderColor: '#3b82f6' }
                  ]}
                  onPress={() => {
                    HapticService.light();
                    setSoundType(type);
                  }}
                >
                  <Text style={[
                    styles.soundTypeBtnText,
                    { color: colors.textSecondary },
                    soundType === type && { color: '#00e5ff', fontWeight: 'bold' }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

          </View>
        </View>
      </Modal>

      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  settingsIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  visualizerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000040',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  bpmText: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowOffset: { width: 0, height: 0 },
  },
  bpmLabel: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: -8,
  },
  timeSignatureContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  tsBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tsBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlsContainer: {
    marginVertical: 40,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  adjustBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
  },
  soundTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundTypeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  soundTypeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
