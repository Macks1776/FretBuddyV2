import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, DeviceEventEmitter, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDrumMachineStore } from '../../store/useDrumMachineStore';
import { Play, Square, Minus, Plus, Save, PlusCircle, X, Copy, Trash2, Eraser, Smartphone, Settings2 } from 'lucide-react-native';
import HapticService from '../../services/HapticService';
import { LinearGradient } from 'expo-linear-gradient';
import SequencerSaveLoadModal from './SequencerSaveLoadModal';
import SoundDesignerModal from './SoundDesignerModal';
import SoundSelectorModal from './SoundSelectorModal';
import VelocityEditorModal from './VelocityEditorModal';
import * as ScreenOrientation from 'expo-screen-orientation';

const STEP_WIDTH = 40;
const STEP_HEIGHT = 40;

export default function SequencerView() {
  const { colors } = useTheme();
  const { 
    parts, partSequence, activePartId, bpm, isPlaying, timeSignature, tracks, customSounds, playbackMode,
    setBpm, togglePlay, toggleStep, loadStateFromStorage, clearGrid,
    addPart, renamePart, setActivePart, setPartSequence, duplicatePart, deletePart, setPlaybackMode,
    setPartSteps, setPartResolution, setTrackSound, addTrack, removeTrack, setStepVelocity
  } = useDrumMachineStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [currentSeqIndex, setCurrentSeqIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [designerVisible, setDesignerVisible] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<{trackIdx: number, stepIdx: number, velocity: number} | null>(null);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{title: string, message: string, confirmText: string, onConfirm: () => void} | null>(null);

  const activePart = parts.find(p => p.id === activePartId) || parts[0];
  const stepsPerPart = activePart.steps || 16;

  useEffect(() => {
    loadStateFromStorage();
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('onDrumBeat', (data: { step: number, seqIndex: number }) => {
      setCurrentStep(data.step);
      setCurrentSeqIndex(data.seqIndex);
    });
    return () => sub.remove();
  }, []);

  // Sync state to Web Audio
  useEffect(() => {
    if (isPlaying) {
      const activeSequence = playbackMode === 'part' ? [activePartId] : partSequence;
      DeviceEventEmitter.emit('playDrumSeqStart', { bpm, parts, sequence: activeSequence, sounds: tracks, customSounds });
    } else {
      DeviceEventEmitter.emit('playDrumSeqStop');
      setCurrentStep(0);
      setCurrentSeqIndex(0);
    }
  }, [isPlaying, playbackMode, activePartId]);

  useEffect(() => {
    if (isPlaying) {
      const activeSequence = playbackMode === 'part' ? [activePartId] : partSequence;
      DeviceEventEmitter.emit('playDrumSeqUpdate', { bpm, parts, sequence: activeSequence, sounds: tracks, customSounds });
    }
  }, [bpm, parts, partSequence, tracks, customSounds, playbackMode, activePartId]);

  const handleStepPress = (trackIdx: number, stepIdx: number) => {
    HapticService.light();
    toggleStep(trackIdx, stepIdx);
  };

  const handleStepLongPress = (trackIdx: number, stepIdx: number) => {
    HapticService.light();
    const velocity = activePart.grid[trackIdx]?.[stepIdx] || 0;
    // If it's 0 (empty step), default to 1.0 when opening editor
    setEditingStep({ trackIdx, stepIdx, velocity: velocity > 0 ? velocity : 1.0 });
  };

  const getTrackColor = (soundId: string) => {
    const base = customSounds[soundId]?.base || soundId;
    switch (base) {
      case 'kick': return '#F43F5E';
      case 'snare': return '#00E5FF';
      case 'closed_hat': return '#A855F7';
      case 'open_hat': return '#D946EF';
      case 'high_tom': return '#3B82F6';
      case 'low_tom': return '#10B981';
      default: return '#A855F7';
    }
  };

  const formatName = (id: string) => {
    return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleAddToSequence = (partId: string) => {
    HapticService.light();
    setPartSequence([...partSequence, partId]);
  };

  const handleRemoveFromSequence = (index: number) => {
    HapticService.light();
    const newSeq = [...partSequence];
    newSeq.splice(index, 1);
    // Don't allow empty sequence
    if (newSeq.length > 0) {
      setPartSequence(newSeq);
    }
  };

  const handleTapTempo = () => {
    HapticService.light();
    const now = Date.now();
    
    // Filter out taps older than 2 seconds to reset if the user paused
    const recentTaps = tapTimes.filter(t => now - t < 2000);
    const newTaps = [...recentTaps, now];
    
    setTapTimes(newTaps);
    
    if (newTaps.length >= 2) {
      let totalInterval = 0;
      for (let i = 1; i < newTaps.length; i++) {
        totalInterval += (newTaps[i] - newTaps[i-1]);
      }
      const avgInterval = totalInterval / (newTaps.length - 1);
      const calculatedBpm = Math.round(60000 / avgInterval);
      
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  const toggleOrientation = async () => {
    HapticService.light();
    if (isLandscape) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsLandscape(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsLandscape(true);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={true}>
      
      {/* Header Config */}
      <View style={styles.header}>
        <View style={styles.bpmContainer}>
          <Pressable onPress={() => { HapticService.light(); setBpm(Math.max(40, bpm - 1)); }} style={[styles.bpmBtn, { backgroundColor: colors.surface }]}>
            <Minus color={colors.textSecondary} size={16} />
          </Pressable>
          <View style={styles.bpmDisplay}>
            <Text style={[styles.bpmText, { color: colors.text }]}>{bpm}</Text>
            <Text style={[styles.bpmLabel, { color: colors.textSecondary }]}>BPM</Text>
          </View>
          <Pressable onPress={() => { HapticService.light(); setBpm(Math.min(240, bpm + 1)); }} style={[styles.bpmBtn, { backgroundColor: colors.surface }]}>
            <Plus color={colors.textSecondary} size={16} />
          </Pressable>
          <Pressable 
            onPress={handleTapTempo}
            style={[styles.bpmBtn, { backgroundColor: colors.primary, width: 48, marginLeft: 4 }]}
          >
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>TAP</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable onPress={() => { HapticService.light(); setDesignerVisible(true); }} style={styles.iconBtn}>
            <Settings2 color={colors.textSecondary} size={20} />
          </Pressable>
          <Pressable onPress={toggleOrientation} style={styles.iconBtn}>
            <Smartphone color={isLandscape ? colors.primary : colors.textSecondary} size={20} />
          </Pressable>
          <Pressable onPress={() => setModalVisible(true)} style={styles.iconBtn}>
            <Save color={colors.textSecondary} size={20} />
          </Pressable>
        </View>
      </View>

      {/* Song Sequencer (Order of Parts) */}
      <View style={styles.sequenceContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Song Sequence</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sequenceRow}>
          {partSequence.map((partId, idx) => {
            const isPlayingThisBlock = isPlaying && currentSeqIndex === idx;
            const partName = parts.find(p => p.id === partId)?.name || partId;
            return (
              <View key={idx} style={styles.sequenceBlockWrapper}>
                <Pressable 
                  style={[
                    styles.sequenceBlock,
                    { 
                      backgroundColor: isPlayingThisBlock ? colors.primary : colors.surface,
                      borderColor: isPlayingThisBlock ? colors.primary : colors.border,
                      borderWidth: 1,
                    }
                  ]}
                  onPress={() => setActivePart(partId)}
                >
                  <Text style={[styles.sequenceBlockText, { color: isPlayingThisBlock ? '#FFF' : colors.text }]}>
                    {partName}
                  </Text>
                </Pressable>
                {partSequence.length > 1 && (
                  <Pressable 
                    style={styles.sequenceBlockRemove}
                    onPress={() => handleRemoveFromSequence(idx)}
                  >
                    <X color="#FFF" size={12} />
                  </Pressable>
                )}
                {idx < partSequence.length - 1 && (
                  <Text style={{ color: colors.textMuted, marginHorizontal: 8 }}>→</Text>
                )}
              </View>
            );
          })}
          
          {/* Add to Sequence Button */}
          <View style={[styles.sequenceBlockWrapper, { marginLeft: 16 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {parts.map(p => (
                <Pressable
                  key={p.id}
                  style={[styles.sequenceBlock, { backgroundColor: `${colors.primary}20`, marginRight: 8, borderColor: colors.primary, borderWidth: 1, borderStyle: 'dashed' }]}
                  onPress={() => handleAddToSequence(p.id)}
                >
                  <Text style={[styles.sequenceBlockText, { color: colors.primary }]}>+ {p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Parts Manager (Tabs) */}
      <View style={styles.partsManager}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partsTabs}>
          {parts.map(p => {
            const isActive = p.id === activePartId;
            return (
              <Pressable
                key={p.id}
                style={[
                  styles.partTab,
                  { 
                    backgroundColor: isActive ? colors.surface : 'transparent',
                    borderColor: isActive ? colors.border : 'transparent',
                    borderWidth: 1,
                  }
                ]}
                onPress={() => {
                  HapticService.light();
                  setActivePart(p.id);
                }}
              >
                <Text style={[styles.partTabText, { color: isActive ? colors.text : colors.textMuted }]}>
                  {p.id}
                </Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.addPartBtn} onPress={() => { HapticService.light(); addPart(); }}>
            <PlusCircle color={colors.textSecondary} size={20} />
          </Pressable>
        </ScrollView>

        <View style={{ flexDirection: 'column', gap: 16, width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginRight: 8 }}>Name:</Text>
              <TextInput
                style={[styles.partNameInput, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={activePart.name}
                onChangeText={(text) => renamePart(activePart.id, text)}
                maxLength={15}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable 
                style={[styles.iconBtn, { marginLeft: 8, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 8 }]}
                onPress={() => {
                  HapticService.light();
                  setConfirmModal({
                    title: "Clear Part",
                    message: `Are you sure you want to clear all steps in ${activePart.name}?`,
                    confirmText: "Clear",
                    onConfirm: () => {
                      clearGrid();
                      setConfirmModal(null);
                    }
                  });
                }}
              >
                <Eraser color={colors.textSecondary} size={16} />
              </Pressable>
              <Pressable 
                style={[styles.iconBtn, { marginLeft: 8, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 8 }]}
                onPress={() => {
                  HapticService.light();
                  duplicatePart(activePart.id);
                }}
              >
                <Copy color={colors.textSecondary} size={16} />
              </Pressable>
              <Pressable 
                style={[styles.iconBtn, { marginLeft: 8, backgroundColor: '#F43F5E20', borderRadius: 8, borderWidth: 1, borderColor: '#F43F5E', padding: 8 }]}
                onPress={() => {
                  HapticService.light();
                  setConfirmModal({
                    title: "Delete Part",
                    message: `Are you sure you want to delete ${activePart.name}?`,
                    confirmText: "Delete",
                    onConfirm: () => {
                      deletePart(activePart.id);
                      setConfirmModal(null);
                    }
                  });
                }}
              >
                <Trash2 color="#F43F5E" size={16} />
              </Pressable>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, marginRight: 8 }}>STEPS:</Text>
              <Pressable onPress={() => { HapticService.light(); setPartSteps(activePart.id, Math.max(1, (activePart.steps || 16) - 1)); }} style={styles.iconBtn}>
                <Minus color={colors.textSecondary} size={14} />
              </Pressable>
              <Text style={{ color: colors.text, marginHorizontal: 4, fontSize: 12, fontWeight: '700' }}>{activePart.steps || 16}</Text>
              <Pressable onPress={() => { HapticService.light(); setPartSteps(activePart.id, Math.min(64, (activePart.steps || 16) + 1)); }} style={styles.iconBtn}>
                <Plus color={colors.textSecondary} size={14} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Text style={{ color: colors.textSecondary, fontSize: 10, marginRight: 8 }}>RES:</Text>
               <Pressable 
                 onPress={() => {
                   HapticService.light();
                   const current = activePart.resolution || 16;
                   const next = current === 8 ? 16 : current === 16 ? 32 : 8;
                   setPartResolution(activePart.id, next);
                 }}
                 style={[styles.iconBtn, { paddingHorizontal: 8, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border }]}
               >
                 <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>1/{activePart.resolution || 16}</Text>
               </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Grid */}
      <View style={[styles.gridContainer, { flex: undefined, marginBottom: 16 }]}>
        {/* Track Labels */}
        <View style={styles.trackLabels}>
          {tracks.map((soundId, idx) => (
            <Pressable 
              key={idx} 
              style={[styles.trackLabel, { height: STEP_HEIGHT, marginBottom: 8 }]}
              onPress={() => {
                HapticService.light();
                setSelectedTrackIndex(idx);
                setSelectorVisible(true);
              }}
            >
              <Text style={[styles.trackLabelText, { color: getTrackColor(soundId) }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatName(soundId).substring(0, 5)}
              </Text>
            </Pressable>
          ))}
          <Pressable 
            style={[styles.trackLabel, { height: STEP_HEIGHT, marginBottom: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => {
              HapticService.light();
              addTrack('kick'); 
            }}
          >
            <Plus color={colors.textSecondary} size={20} />
          </Pressable>
        </View>

        {/* Scrollable Steps */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollGrid}>
          {tracks.map((soundId, trackIdx) => (
            <View key={trackIdx} style={[styles.trackRow, { height: STEP_HEIGHT, marginBottom: 8 }]}>
              {Array.from({ length: stepsPerPart }).map((_, stepIdx) => {
                const velocity = activePart.grid[trackIdx]?.[stepIdx] || 0;
                const isActive = velocity > 0;
                
                // Highlight if playing AND the current playing part in the sequence is the one we are editing
                const playingPartId = partSequence[currentSeqIndex];
                const isCurrent = currentStep === stepIdx && isPlaying && playingPartId === activePart.id;
                
                const isBarStart = stepIdx % stepsPerPart === 0;
                const isBeatStart = stepIdx % 4 === 0;
                const trackColor = getTrackColor(soundId);
                
                let bgColor = colors.surface;
                let stepOpacity = 1;

                if (isActive) {
                  bgColor = trackColor;
                  stepOpacity = Math.max(0.3, Math.min(1.0, 0.2 + (velocity * 0.4)));
                } else if (isBeatStart) {
                  bgColor = `${colors.surface}80`;
                }

                return (
                  <Pressable
                    key={stepIdx}
                    style={[
                      styles.stepCell,
                      { 
                        width: STEP_WIDTH, 
                        height: STEP_HEIGHT,
                        backgroundColor: bgColor,
                        opacity: stepOpacity,
                        borderColor: isCurrent ? '#FFF' : colors.border,
                        borderWidth: isCurrent ? 2 : 1,
                        borderLeftWidth: isBarStart ? 2 : 1,
                        borderLeftColor: isBarStart ? colors.textMuted : colors.border,
                      },
                      isActive && {
                        shadowColor: trackColor,
                        shadowOpacity: 0.5 * stepOpacity,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    ]}
                    onPress={() => handleStepPress(trackIdx, stepIdx)}
                    onLongPress={() => handleStepLongPress(trackIdx, stepIdx)}
                    delayLongPress={300}
                  />
                );
              })}
            </View>
          ))}
          <View style={{ height: STEP_HEIGHT, marginBottom: 8 }} />
        </ScrollView>
      </View>

      {/* Transport Controls */}
      <View style={[styles.transportContainer, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24 }]}>
        
        {/* Playback Mode Toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, padding: 4 }}>
          <Pressable 
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: playbackMode === 'part' ? colors.primary : 'transparent' }}
            onPress={() => { HapticService.light(); setPlaybackMode('part'); }}
          >
            <Text style={{ fontWeight: '700', fontSize: 12, color: playbackMode === 'part' ? '#FFF' : colors.textMuted }}>PART</Text>
          </Pressable>
          <Pressable 
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: playbackMode === 'song' ? colors.primary : 'transparent' }}
            onPress={() => { HapticService.light(); setPlaybackMode('song'); }}
          >
            <Text style={{ fontWeight: '700', fontSize: 12, color: playbackMode === 'song' ? '#FFF' : colors.textMuted }}>SONG</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => { HapticService.medium(); togglePlay(); }}>
          <LinearGradient
            colors={isPlaying ? ['#FF2A5F', '#D946EF'] : ['#00E5FF', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playBtn}
          >
            {isPlaying ? (
              <Square fill="#FFF" color="#FFF" size={32} />
            ) : (
              <Play fill="#FFF" color="#FFF" size={32} style={{ marginLeft: 6 }} />
            )}
          </LinearGradient>
        </Pressable>
        
        {/* Placeholder to balance the row if needed, or just let gap handle it */}
        <View style={{ width: 100 }} />
      </View>

      <SequencerSaveLoadModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <SoundDesignerModal visible={designerVisible} onClose={() => setDesignerVisible(false)} />
      <SoundSelectorModal 
        visible={selectorVisible} 
        onClose={() => setSelectorVisible(false)}
        selectedSoundId={selectedTrackIndex !== null ? tracks[selectedTrackIndex] : undefined}
        onSelect={(soundId) => {
          if (selectedTrackIndex !== null) {
            setTrackSound(selectedTrackIndex, soundId);
          }
        }}
        onRemove={() => {
          if (selectedTrackIndex !== null) {
            removeTrack(selectedTrackIndex);
          }
        }}
      />
      {editingStep && (
        <VelocityEditorModal
          visible={!!editingStep}
          onClose={() => setEditingStep(null)}
          velocity={editingStep.velocity}
          trackName={formatName(tracks[editingStep.trackIdx])}
          stepIndex={editingStep.stepIdx}
          onVelocityChange={(vel) => {
            setStepVelocity(editingStep.trackIdx, editingStep.stepIdx, vel);
            setEditingStep({ ...editingStep, velocity: vel });
          }}
        />
      )}

      {confirmModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>{confirmModal.title}</Text>
              <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>{confirmModal.message}</Text>
              
              <View style={styles.confirmActions}>
                <Pressable 
                  style={[styles.confirmBtn, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => setConfirmModal(null)}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.confirmBtn, { backgroundColor: '#F43F5E' }]}
                  onPress={confirmModal.onConfirm}
                >
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>{confirmModal.confirmText}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bpmBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmDisplay: {
    alignItems: 'center',
    width: 60,
  },
  bpmText: {
    fontSize: 24,
    fontWeight: '800',
  },
  bpmLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconBtn: {
    padding: 8,
  },
  sequenceContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sequenceBlockWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sequenceBlock: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceBlockText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sequenceBlockRemove: {
    position: 'absolute',
    top: -6,
    right: 20,
    backgroundColor: '#FF2A5F',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  partsManager: {
    marginBottom: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  partsTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  partTabText: {
    fontWeight: '700',
    fontSize: 14,
  },
  addPartBtn: {
    padding: 8,
    marginLeft: 4,
  },
  partNameEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  partNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 120,
  },
  gridContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  trackLabels: {
    marginRight: 12,
    paddingTop: 0,
  },
  trackLabel: {
    justifyContent: 'center',
    width: 50,
  },
  trackLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollGrid: {
    flexDirection: 'column',
    gap: 2,
  },
  trackRow: {
    flexDirection: 'row',
  },
  stepCell: {
    borderRadius: 6,
    marginRight: 4,
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
  },
  transportContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  }
});
