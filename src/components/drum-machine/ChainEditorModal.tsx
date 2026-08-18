import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDrumMachineStore } from '../../store/useDrumMachineStore';
import { X, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react-native';
import HapticService from '../../services/HapticService';

interface ChainEditorModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChainEditorModal({ visible, onClose }: ChainEditorModalProps) {
  const { colors } = useTheme();
  const { parts, partSequence, setPartSequence } = useDrumMachineStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    HapticService.light();
    const newSeq = [...partSequence];
    [newSeq[index - 1], newSeq[index]] = [newSeq[index], newSeq[index - 1]];
    setPartSequence(newSeq);
  };

  const handleMoveDown = (index: number) => {
    if (index === partSequence.length - 1) return;
    HapticService.light();
    const newSeq = [...partSequence];
    [newSeq[index + 1], newSeq[index]] = [newSeq[index], newSeq[index + 1]];
    setPartSequence(newSeq);
  };

  const handleRemove = (index: number) => {
    HapticService.light();
    const newSeq = [...partSequence];
    newSeq.splice(index, 1);
    if (newSeq.length > 0) {
      setPartSequence(newSeq);
    }
  };

  const handleAddPart = (partId: string) => {
    HapticService.light();
    setPartSequence([...partSequence, partId]);
  };

  const handleReplacePart = (index: number, partId: string) => {
    HapticService.light();
    const newSeq = [...partSequence];
    newSeq[index] = partId;
    setPartSequence(newSeq);
    setEditingIndex(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Edit Chain</Text>
            <Pressable onPress={onClose} style={styles.iconBtn}>
              <X color={colors.textSecondary} size={24} />
            </Pressable>
          </View>

          <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 24 }}>
            {partSequence.map((partId, idx) => {
              const partName = parts.find(p => p.id === partId)?.name || partId;
              const isEditing = editingIndex === idx;

              return (
                <View key={`${idx}-${partId}`} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.rowLeft}>
                    <Text style={[styles.indexText, { color: colors.textMuted }]}>{idx + 1}.</Text>
                    
                    {isEditing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                        {parts.map(p => (
                          <Pressable
                            key={p.id}
                            style={[
                              styles.replaceBtn,
                              { 
                                backgroundColor: p.id === partId ? colors.tint : 'transparent',
                                borderColor: colors.border,
                                borderWidth: 1
                              }
                            ]}
                            onPress={() => handleReplacePart(idx, p.id)}
                          >
                            <Text style={{ color: p.id === partId ? '#FFF' : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                              {p.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : (
                      <Pressable 
                        style={[styles.partNameBtn, { borderColor: colors.border }]}
                        onPress={() => setEditingIndex(idx)}
                      >
                        <Text style={[styles.partNameText, { color: colors.text }]}>{partName}</Text>
                        <Text style={[styles.editLabel, { color: colors.textMuted }]}>Tap to replace</Text>
                      </Pressable>
                    )}
                  </View>

                  {!isEditing && (
                    <View style={styles.rowRight}>
                      <Pressable 
                        style={[styles.actionBtn, idx === 0 && { opacity: 0.3 }]}
                        onPress={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                      >
                        <ArrowUp color={colors.textSecondary} size={18} />
                      </Pressable>
                      <Pressable 
                        style={[styles.actionBtn, idx === partSequence.length - 1 && { opacity: 0.3 }]}
                        onPress={() => handleMoveDown(idx)}
                        disabled={idx === partSequence.length - 1}
                      >
                        <ArrowDown color={colors.textSecondary} size={18} />
                      </Pressable>
                      <Pressable 
                        style={[styles.actionBtn, partSequence.length === 1 && { opacity: 0.3 }]}
                        onPress={() => handleRemove(idx)}
                        disabled={partSequence.length === 1}
                      >
                        <Trash2 color="#FF2A5F" size={18} />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Add Part Section */}
            <View style={[styles.addSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.addSectionTitle, { color: colors.textSecondary }]}>Append Part to Chain</Text>
              <View style={styles.addGrid}>
                {parts.map(p => (
                  <Pressable
                    key={p.id}
                    style={[styles.addBtn, { backgroundColor: `${colors.tint}20`, borderColor: colors.tint }]}
                    onPress={() => handleAddPart(p.id)}
                  >
                    <Plus color={colors.tint} size={16} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.tint, fontWeight: '700' }}>{p.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 8,
  },
  listContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indexText: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
  },
  partNameBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  partNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  editLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  replaceBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
  addSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  addSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  addGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  }
});
