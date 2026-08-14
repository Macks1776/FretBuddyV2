import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDrumMachineStore } from '../../store/useDrumMachineStore';
import { X, Trash2, CheckCircle2 } from 'lucide-react-native';
import GlassCard from '../ui/GlassCard';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (soundId: string) => void;
  onRemove?: () => void; // Optional: used if we want to allow deleting the track/pad entirely
  selectedSoundId?: string;
}

const DEFAULT_SOUNDS = ['kick', 'snare', 'closed_hat', 'open_hat', 'high_tom', 'low_tom', 'crash'];

export default function SoundSelectorModal({ visible, onClose, onSelect, onRemove, selectedSoundId }: Props) {
  const { colors } = useTheme();
  const { customSounds, deleteCustomSound } = useDrumMachineStore();

  const customSoundIds = Object.keys(customSounds);

  const formatName = (id: string) => {
    return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Select Sound</Text>
            <Pressable onPress={onClose}>
              <X color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Default Sounds</Text>
            {DEFAULT_SOUNDS.map(id => (
              <Pressable key={id} onPress={() => { onSelect(id); onClose(); }}>
                <GlassCard style={[styles.item, selectedSoundId === id && { borderColor: colors.tint, borderWidth: 1 }]}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{formatName(id)}</Text>
                  {selectedSoundId === id && <CheckCircle2 color={colors.tint} size={20} />}
                </GlassCard>
              </Pressable>
            ))}

            <View style={styles.divider} />

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Custom Sounds</Text>
            {customSoundIds.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontStyle: 'italic', marginBottom: 16 }}>
                No custom sounds yet. Use the Sound Designer to create some!
              </Text>
            ) : (
              customSoundIds.map(id => (
                <Pressable key={id} onPress={() => { onSelect(id); onClose(); }}>
                  <GlassCard style={[styles.item, selectedSoundId === id && { borderColor: colors.tint, borderWidth: 1 }]}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{formatName(id)}</Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      {selectedSoundId === id && <CheckCircle2 color={colors.tint} size={20} />}
                      <Pressable onPress={(e) => { e.stopPropagation(); deleteCustomSound(id); }}>
                        <Trash2 color="#F43F5E" size={20} />
                      </Pressable>
                    </View>
                  </GlassCard>
                </Pressable>
              ))
            )}

            {onRemove && (
              <>
                <View style={styles.divider} />
                <Pressable style={styles.removeBtn} onPress={() => { onRemove(); onClose(); }}>
                  <Trash2 color="#F43F5E" size={20} />
                  <Text style={styles.removeBtnText}>Remove Track</Text>
                </Pressable>
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: '80%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    flexGrow: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F43F5E',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    gap: 8,
  },
  removeBtnText: {
    color: '#F43F5E',
    fontSize: 16,
    fontWeight: '700',
  }
});
