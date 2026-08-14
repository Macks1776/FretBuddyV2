import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chord, Key, Interval } from '@tonaljs/tonal';
import { useTheme } from '../src/hooks/useTheme';
import HapticService from '../src/services/HapticService';
import { ArrowRight } from 'lucide-react-native';
import AnimatedPressable from '../src/components/ui/AnimatedPressable';

const ROOTS = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B"];
const SUFFIXES = ["", "m", "7", "m7", "maj7", "mM7", "6", "m6", "dim", "dim7", "aug", "sus2", "sus4", "7sus4", "add9", "madd9", "9", "m9", "maj9"];

export default function TransposerScreen() {
  const { colors } = useTheme();
  
  const [inputMode, setInputMode] = useState<"progression" | "key">("progression");
  
  // Progression Mode State
  const [progression, setProgression] = useState<string[]>(["C", "G", "Am", "F"]);
  const [isAddChordVisible, setIsAddChordVisible] = useState(false);
  const [newChordRoot, setNewChordRoot] = useState("C");
  const [newChordSuffix, setNewChordSuffix] = useState("");

  // Key Mode State
  const [selectedKeyRoot, setSelectedKeyRoot] = useState("C");
  const [selectedKeyType, setSelectedKeyType] = useState<"major" | "minor">("major");

  // Transposition State
  const [transpositionMode, setTranspositionMode] = useState<"semitones" | "capo">("semitones");
  const [shiftAmountState, setShiftAmountState] = useState(0);
  const [originalCapo, setOriginalCapo] = useState(0);
  const [targetCapo, setTargetCapo] = useState(0);

  // Compute actual shift amount based on mode
  const shiftAmount = transpositionMode === "semitones" 
    ? shiftAmountState 
    : originalCapo - targetCapo;

  // Compute original chords based on mode
  const originalChords = useMemo(() => {
    if (inputMode === "progression") {
      return progression;
    } else {
      if (selectedKeyType === "major") {
        return Key.majorKey(selectedKeyRoot).triads;
      } else {
        return Key.minorKey(selectedKeyRoot).natural.triads;
      }
    }
  }, [inputMode, progression, selectedKeyRoot, selectedKeyType]);

  // Compute transposed chords
  const transposedChords = useMemo(() => {
    const interval = Interval.fromSemitones(shiftAmount);
    return originalChords.map(chord => {
      try {
        const transposed = Chord.transpose(chord, interval);
        return transposed || chord;
      } catch {
        return chord;
      }
    });
  }, [originalChords, shiftAmount]);

  const handleAddChord = () => {
    setProgression([...progression, `${newChordRoot}${newChordSuffix}`]);
    setIsAddChordVisible(false);
    HapticService.success();
  };

  const handleRemoveChord = (index: number) => {
    const updated = [...progression];
    updated.splice(index, 1);
    setProgression(updated);
    HapticService.light();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Mode Toggle */}
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg, marginBottom: 24 }]}>
          <Pressable 
            style={[styles.segmentBtn, inputMode === "progression" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
            onPress={() => {
              HapticService.medium();
              setInputMode("progression");
            }}
          >
            <Text style={[styles.segmentText, { color: colors.textSecondary }, inputMode === "progression" && [styles.segmentTextActive, { color: colors.tint }]]}>By Progression</Text>
          </Pressable>
          <Pressable 
            style={[styles.segmentBtn, inputMode === "key" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
            onPress={() => {
              HapticService.medium();
              setInputMode("key");
            }}
          >
            <Text style={[styles.segmentText, { color: colors.textSecondary }, inputMode === "key" && [styles.segmentTextActive, { color: colors.tint }]]}>By Key</Text>
          </Pressable>
        </View>

        {/* Input Section */}
        {inputMode === "progression" ? (
          <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Progression Builder</Text>
            
            <View style={styles.progressionList}>
              {progression.map((chord, idx) => (
                <AnimatedPressable key={`${idx}-${chord}`} onPress={() => handleRemoveChord(idx)} style={styles.chordBlockWrapper}>
                  <View style={[styles.chordBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.chordBlockText, { color: colors.text }]}>{chord}</Text>
                  </View>
                </AnimatedPressable>
              ))}
              <Pressable 
                style={[styles.addChordBtn, { borderColor: colors.tint, borderStyle: 'dashed' }]}
                onPress={() => {
                  HapticService.medium();
                  setIsAddChordVisible(true);
                }}
              >
                <Text style={[styles.addChordText, { color: colors.tint }]}>+ Add Chord</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Target Key</Text>
            <View style={styles.keyPickers}>
              <View style={styles.pickerCol}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Root</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ROOTS.map(r => (
                    <Pressable 
                      key={r}
                      style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, selectedKeyRoot === r && [styles.pillActive, { backgroundColor: colors.tint, borderColor: colors.tint }]]}
                      onPress={() => {
                        HapticService.light();
                        setSelectedKeyRoot(r);
                      }}
                    >
                      <Text style={[styles.pillText, { color: colors.text }, selectedKeyRoot === r && styles.pillTextActive]}>{r}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={[styles.pickerCol, { marginTop: 16 }]}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(["major", "minor"] as const).map(t => (
                    <Pressable 
                      key={t}
                      style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, selectedKeyType === t && [styles.pillActive, { backgroundColor: colors.tint, borderColor: colors.tint }]]}
                      onPress={() => {
                        HapticService.light();
                        setSelectedKeyType(t);
                      }}
                    >
                      <Text style={[styles.pillText, { color: colors.text, textTransform: 'capitalize' }, selectedKeyType === t && styles.pillTextActive]}>{t}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        )}

        {/* Transposition Controls */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelHeaderRow}>
            <Text style={[styles.panelTitle, { color: colors.text, marginBottom: 0 }]}>Transposition</Text>
          </View>
          
          <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg, marginTop: 12, marginBottom: 16 }]}>
            <Pressable 
              style={[styles.segmentBtn, transpositionMode === "semitones" && [styles.segmentBtnActive, { backgroundColor: colors.surface }]]}
              onPress={() => setTranspositionMode("semitones")}
            >
              <Text style={[styles.segmentText, { color: colors.textSecondary }, transpositionMode === "semitones" && { color: colors.tint }]}>By Semitones</Text>
            </Pressable>
            <Pressable 
              style={[styles.segmentBtn, transpositionMode === "capo" && [styles.segmentBtnActive, { backgroundColor: colors.surface }]]}
              onPress={() => setTranspositionMode("capo")}
            >
              <Text style={[styles.segmentText, { color: colors.textSecondary }, transpositionMode === "capo" && { color: colors.tint }]}>Capo Conversion</Text>
            </Pressable>
          </View>

          {transpositionMode === "semitones" ? (
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface }]}>
              <Pressable style={styles.stepperBtn} onPress={() => {
                HapticService.medium();
                setShiftAmountState(shiftAmountState - 1);
              }}>
                <Text style={[styles.stepperIcon, { color: colors.text }]}>-</Text>
              </Pressable>
              <View style={styles.stepperValueCol}>
                <Text style={[styles.stepperText, { color: colors.text }]}>
                  {shiftAmountState > 0 ? `+${shiftAmountState}` : shiftAmountState} Semitones
                </Text>
              </View>
              <Pressable style={styles.stepperBtn} onPress={() => {
                HapticService.medium();
                setShiftAmountState(shiftAmountState + 1);
              }}>
                <Text style={[styles.stepperIcon, { color: colors.text }]}>+</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <View style={styles.capoConversionRow}>
                <View style={styles.capoControl}>
                  <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Original Capo</Text>
                  <View style={[styles.stepperContainer, { backgroundColor: colors.surface }]}>
                    <Pressable style={styles.stepperBtnSmall} onPress={() => {
                      HapticService.medium();
                      setOriginalCapo(Math.max(0, originalCapo - 1));
                    }}>
                      <Text style={[styles.stepperIcon, { color: colors.text }]}>-</Text>
                    </Pressable>
                    <Text style={[styles.stepperText, { color: colors.text }]}>
                      {originalCapo === 0 ? "None" : originalCapo}
                    </Text>
                    <Pressable style={styles.stepperBtnSmall} onPress={() => {
                      HapticService.medium();
                      setOriginalCapo(Math.min(12, originalCapo + 1));
                    }}>
                      <Text style={[styles.stepperIcon, { color: colors.text }]}>+</Text>
                    </Pressable>
                  </View>
                </View>

                <ArrowRight color={colors.textSecondary} size={24} style={{ marginHorizontal: 8, marginTop: 16 }} />

                <View style={styles.capoControl}>
                  <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Target Capo</Text>
                  <View style={[styles.stepperContainer, { backgroundColor: colors.surface }]}>
                    <Pressable style={styles.stepperBtnSmall} onPress={() => {
                      HapticService.medium();
                      setTargetCapo(Math.max(0, targetCapo - 1));
                    }}>
                      <Text style={[styles.stepperIcon, { color: colors.text }]}>-</Text>
                    </Pressable>
                    <Text style={[styles.stepperText, { color: colors.text }]}>
                      {targetCapo === 0 ? "None" : targetCapo}
                    </Text>
                    <Pressable style={styles.stepperBtnSmall} onPress={() => {
                      HapticService.medium();
                      setTargetCapo(Math.min(12, targetCapo + 1));
                    }}>
                      <Text style={[styles.stepperIcon, { color: colors.text }]}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              
              <Text style={[styles.stepperSubText, { color: colors.textSecondary, textAlign: 'center', marginTop: 16 }]}>
                (Shifting chords by {shiftAmount > 0 ? `+${shiftAmount}` : shiftAmount} semitones)
              </Text>
            </View>
          )}
        </View>

        {/* Output Section */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 40 }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>Results</Text>
          {originalChords.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Add chords to see transposition.</Text>
          ) : (
            <View style={styles.resultsScroll}>
              {originalChords.map((orig, idx) => (
                <View key={`res-${idx}`} style={[styles.resultRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.resultCol}>
                    <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Original</Text>
                    <Text style={[styles.resultChord, { color: colors.text }]}>{orig}</Text>
                  </View>
                  <ArrowRight color={colors.textSecondary} size={20} />
                  <View style={[styles.resultCol, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.resultLabel, { color: colors.tint }]}>Transposed</Text>
                    <Text style={[styles.resultChord, { color: colors.tint, fontWeight: '900' }]}>{transposedChords[idx]}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Add Chord Modal */}
      <Modal visible={isAddChordVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Chord</Text>
              <Pressable onPress={() => setIsAddChordVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Root</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {ROOTS.map(r => (
                  <Pressable 
                    key={r}
                    style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, newChordRoot === r && [styles.pillActive, { backgroundColor: colors.tint, borderColor: colors.tint }]]}
                    onPress={() => setNewChordRoot(r)}
                  >
                    <Text style={[styles.pillText, { color: colors.text }, newChordRoot === r && styles.pillTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Type (Suffix)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {SUFFIXES.map(s => (
                  <Pressable 
                    key={s}
                    style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, newChordSuffix === s && [styles.pillActive, { backgroundColor: colors.tint, borderColor: colors.tint }]]}
                    onPress={() => setNewChordSuffix(s)}
                  >
                    <Text style={[styles.pillText, { color: colors.text }, newChordSuffix === s && styles.pillTextActive]}>{s === "" ? "Major" : s}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              
              <View style={[styles.previewBox, { backgroundColor: colors.surface }]}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Preview</Text>
                <Text style={[styles.previewChord, { color: colors.text }]}>{newChordRoot}{newChordSuffix}</Text>
              </View>
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable style={[styles.saveBtn, { backgroundColor: colors.tint }]} onPress={handleAddChord}>
                <Text style={styles.saveBtnText}>Add Chord</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentBtnActive: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  segmentTextActive: {},
  panel: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chordBlockWrapper: {
    overflow: "hidden",
    borderRadius: 8,
  },
  chordBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  chordBlockText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addChordBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  addChordText: {
    fontWeight: "bold",
  },
  keyPickers: {},
  pickerCol: {},
  pickerLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillActive: {},
  pillText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#fff",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  stepperBtn: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
  },
  stepperBtnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
  },
  capoConversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capoControl: {
    flex: 1,
    alignItems: 'center',
  },
  stepperValueCol: {
    alignItems: "center",
  },
  stepperIcon: {
    fontSize: 24,
    fontWeight: "900",
  },
  stepperText: {
    fontSize: 18,
    fontWeight: "800",
  },
  stepperSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  resultsScroll: {
    marginTop: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultCol: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "800",
    marginBottom: 4,
  },
  resultChord: {
    fontSize: 22,
    fontWeight: "700",
  },
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  modalClose: {
    fontSize: 24,
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  previewBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 8,
  },
  previewChord: {
    fontSize: 32,
    fontWeight: "900",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
