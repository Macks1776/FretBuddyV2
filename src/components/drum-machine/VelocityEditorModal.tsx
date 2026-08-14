import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import HapticService from '../../services/HapticService';

interface Props {
  visible: boolean;
  onClose: () => void;
  velocity: number;
  onVelocityChange: (vel: number) => void;
  trackName: string;
  stepIndex: number;
}

export default function VelocityEditorModal({ visible, onClose, velocity, onVelocityChange, trackName, stepIndex }: Props) {
  const { colors } = useTheme();
  const [localVelocity, setLocalVelocity] = useState(velocity);

  useEffect(() => {
    setLocalVelocity(velocity);
  }, [velocity]);

  const handleSlidingComplete = (val: number) => {
    HapticService.light();
    onVelocityChange(val);
  };

  const handleValueChange = (val: number) => {
    setLocalVelocity(val);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Step Velocity</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {trackName} • Step {stepIndex + 1}
              </Text>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.sliderRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Soft</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={2.0}
                value={localVelocity}
                onValueChange={handleValueChange}
                onSlidingComplete={handleSlidingComplete}
                minimumTrackTintColor={colors.tint}
                maximumTrackTintColor={colors.border}
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>Loud</Text>
            </View>
            <Text style={[styles.valueText, { color: colors.text }]}>
              {localVelocity.toFixed(2)}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  valueText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  }
});
