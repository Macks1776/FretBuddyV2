import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, FlatList, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDrumMachineStore } from '../../store/useDrumMachineStore';
import { PRESET_SEQUENCES } from '../../store/presetSequences';
import { X, Save, FolderOpen } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from '../ui/GlassCard';
import LabelWithTooltip from '../ui/LabelWithTooltip';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SequencerSaveLoadModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { saveSequence, loadSequence, deleteSequence, startNewSequence, currentSequenceName } = useDrumMachineStore();
  const [name, setName] = useState('');
  const [savedSequences, setSavedSequences] = useState<string[]>([]);
  const [mode, setMode] = useState<'save' | 'load'>('save');
  const [confirmModal, setConfirmModal] = useState<{title: string, message: string, confirmText: string, onConfirm: () => void, hideCancel?: boolean} | null>(null);

  useEffect(() => {
    if (visible) {
      loadSequenceList();
      if (currentSequenceName) {
        setName(currentSequenceName);
      } else {
        setName('');
      }
    }
  }, [visible, currentSequenceName]);

  const loadSequenceList = async () => {
    try {
      const stored = await AsyncStorage.getItem('@drum_sequences_v2');
      if (stored) {
        const sequences = JSON.parse(stored);
        setSavedSequences(Object.keys(sequences));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const finalName = name.trim();
    if (!finalName) return;

    if (PRESET_SEQUENCES[finalName]) {
      setConfirmModal({
        title: "Immutable Beat",
        message: "You cannot overwrite a built-in beat. Please save your changes under a different name.",
        confirmText: "Understood",
        hideCancel: true,
        onConfirm: () => setConfirmModal(null)
      });
      return;
    }
    
    if (savedSequences.includes(finalName)) {
      setConfirmModal({
        title: "Overwrite Sequence",
        message: `A sequence named "${finalName}" already exists. Do you want to overwrite it?`,
        confirmText: "Overwrite",
        onConfirm: async () => {
          await saveSequence(finalName);
          setName('');
          setConfirmModal(null);
          onClose();
        }
      });
    } else {
      await saveSequence(finalName);
      setName('');
      onClose();
    }
  };

  const handleLoad = async (seqName: string) => {
    await loadSequence(seqName);
    onClose();
  };

  const handleDelete = (seqName: string) => {
    setConfirmModal({
      title: "Delete Sequence",
      message: `Are you sure you want to delete "${seqName}"?`,
      confirmText: "Delete",
      onConfirm: async () => {
        await deleteSequence(seqName);
        loadSequenceList();
        setConfirmModal(null);
      }
    });
  };

  const handleNew = () => {
    setConfirmModal({
      title: "New Sequence",
      message: "Are you sure you want to start a completely new sequence? Unsaved changes will be lost.",
      confirmText: "Start New",
      onConfirm: () => {
        startNewSequence();
        setConfirmModal(null);
        onClose();
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sequence Manager</Text>
            <Pressable onPress={onClose}>
              <X color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.tabs, { backgroundColor: colors.background }]}>
            <Pressable 
              style={[styles.tab, mode === 'save' && { backgroundColor: '#a855f7' }]}
              onPress={() => setMode('save')}
            >
              <Text style={{ color: mode === 'save' ? '#FFF' : colors.textSecondary, fontWeight: '700' }}>Save</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, mode === 'load' && { backgroundColor: '#a855f7' }]}
              onPress={() => setMode('load')}
            >
              <Text style={{ color: mode === 'load' ? '#FFF' : colors.textSecondary, fontWeight: '700' }}>Load</Text>
            </Pressable>
          </View>

          {mode === 'save' ? (
            <View style={styles.content}>
              <LabelWithTooltip 
                label="Sequence Name" 
                tooltip="Enter a unique name to save your current sequencer pattern so you can load it later." 
                tooltipTitle="Save Sequence" 
              />
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Sequence Name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
              <Pressable style={styles.btn} onPress={handleSave}>
                <Save color="#FFF" size={20} />
                <Text style={styles.btnText}>Save Sequence</Text>
              </Pressable>

              <View style={styles.divider} />
              
              <Pressable style={[styles.btn, { backgroundColor: 'transparent', borderColor: '#FF2A5F', borderWidth: 1 }]} onPress={handleNew}>
                <Text style={[styles.btnText, { color: '#FF2A5F' }]}>Start New Sequence</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={[
                { type: 'header', title: 'Built-in Beats' },
                ...Object.keys(PRESET_SEQUENCES).map(k => ({ type: 'item', name: k, isPreset: true })),
                { type: 'header', title: 'Your Beats' },
                ...savedSequences.map(k => ({ type: 'item', name: k, isPreset: false }))
              ]}
              keyExtractor={(item, index) => item.type === 'header' ? `header-${index}` : `item-${item.name}`}
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return (
                    <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', marginTop: 16, marginBottom: 8, letterSpacing: 1 }}>
                      {item.title}
                    </Text>
                  );
                }
                return (
                  <Pressable onPress={() => handleLoad(item.name as string)}>
                    <GlassCard style={styles.seqItem}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{item.name}</Text>
                      <Pressable 
                        onPress={(e) => { e.stopPropagation(); handleLoad(item.name as string); }} 
                        style={{ padding: 8, marginRight: 8, backgroundColor: `${colors.tint}20`, borderRadius: 8 }}
                      >
                        <FolderOpen color={colors.tint} size={18} />
                      </Pressable>
                      {!item.isPreset && (
                        <Pressable 
                          onPress={(e) => { e.stopPropagation(); handleDelete(item.name as string); }}
                          style={{ padding: 8, backgroundColor: '#FF2A5F20', borderRadius: 8 }}
                        >
                          <X color="#FF2A5F" size={18} />
                        </Pressable>
                      )}
                    </GlassCard>
                  </Pressable>
                );
              }}
            />
          )}

        </View>
      </View>

      {confirmModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>{confirmModal.title}</Text>
              <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>{confirmModal.message}</Text>
              
              <View style={styles.confirmActions}>
                {!confirmModal.hideCancel && (
                  <Pressable 
                    style={[styles.confirmBtn, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }]}
                    onPress={() => setConfirmModal(null)}
                  >
                    <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                  </Pressable>
                )}
                <Pressable 
                  style={[styles.confirmBtn, { backgroundColor: '#FF2A5F' }]}
                  onPress={confirmModal.onConfirm}
                >
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>{confirmModal.confirmText}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  content: {
    gap: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#a855f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  seqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmContainer: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  }
});
