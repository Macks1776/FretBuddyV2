import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, FlatList, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDrumMachineStore } from '../../store/useDrumMachineStore';
import { X, Save, FolderOpen } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from '../ui/GlassCard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SequencerSaveLoadModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { saveSequence, loadSequence, currentSequenceName } = useDrumMachineStore();
  const [name, setName] = useState('');
  const [savedSequences, setSavedSequences] = useState<string[]>([]);
  const [mode, setMode] = useState<'save' | 'load'>('save');

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
    
    if (savedSequences.includes(finalName)) {
      Alert.alert(
        "Overwrite Sequence",
        `A sequence named "${finalName}" already exists. Do you want to overwrite it?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Overwrite", 
            style: "destructive",
            onPress: async () => {
              await saveSequence(finalName);
              setName('');
              onClose();
            }
          }
        ]
      );
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
            </View>
          ) : (
            <FlatList
              data={savedSequences}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleLoad(item)}>
                  <GlassCard style={styles.seqItem}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{item}</Text>
                    <FolderOpen color={colors.textSecondary} size={20} />
                  </GlassCard>
                </Pressable>
              )}
              ListEmptyComponent={() => (
                <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 20 }}>No saved sequences.</Text>
              )}
            />
          )}

        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  }
});
