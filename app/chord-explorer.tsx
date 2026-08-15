import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chord, Note, Interval } from "@tonaljs/tonal";
import { useChordExplorerStore, FretSelection } from "../src/store/useChordExplorerStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useToneStore } from "../src/store/useToneStore";
import { DEFAULT_TUNINGS } from "../src/utils/tunings";
import ChordExplorer from "../src/components/ChordExplorer";
import { useTheme } from "../src/hooks/useTheme";
import * as Haptics from "expo-haptics";

// @ts-ignore - no types available for this json
import guitarDb from "@tombatossals/chords-db/lib/guitar.json";

const COMMON_CHORD_SUFFIXES = [
  "major", "minor", "7", "maj7", "m7", "m7b5", "dim", "aug", "sus2", "sus4", "6", "m6", "9", "m9", "maj9"
];

export default function ChordExplorerScreen() {
  const { 
    explorerMode, setExplorerMode,
    dictRoot, setDictRoot,
    dictSuffix, setDictSuffix,
    dictVoicingIndex, setDictVoicingIndex,
    fretStart, setFretStart, 
    capoFret, setCapoFret,
    selectedFrets, setAllSelections,
    activeTuningId, setActiveTuningId, clearSelections,
    localPlaybackEnabled, setLocalPlaybackEnabled 
  } = useChordExplorerStore();
  
  const { customTunings, notePlaybackEnabled } = useSettingsStore();
  const { playNote } = useToneStore();
  const { colors } = useTheme();

  // Dictionary logic: force standard tuning in Dictionary mode
  const resolvedTuningId = explorerMode === "dictionary" ? "standard-6" : activeTuningId;
  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  
  const isPlaybackActive = localPlaybackEnabled !== null ? localPlaybackEnabled : notePlaybackEnabled;
  const tuning = allTunings.find(t => t.id === resolvedTuningId) || allTunings[0];
  const strings = tuning.notes.map(note => Note.transpose(note, Interval.fromSemitones(capoFret)));

  // Active pitches for the current fretboard selection
  const activePitches = strings.map((openNote, strIdx) => {
    const selection = selectedFrets[strIdx];
    if (selection === "x") return null;
    return Note.transpose(openNote, Interval.fromSemitones(selection));
  }).filter(Boolean) as string[];

  // Format chord names to be more readable
  const formatChordName = (name: string) => {
    return name
      .replace(/ ?M$/g, "") // Plain Major triad (e.g. "EM" -> "E")
      .replace(/ ?M(\d+)/g, " Major $1") // Major extensions (e.g. "EM7" -> "E Major 7")
      .trim();
  };

  // Tonal chord detection
  const detectedChords = Chord.detect(activePitches).map(formatChordName);
  const mainChord = detectedChords.length > 0 ? detectedChords[0] : null;
  const altChords = detectedChords.slice(1).join(", ");

  const handleStrum = () => {
    activePitches.forEach((pitch, index) => {
      setTimeout(() => playNote(pitch), index * 40);
    });
  };

  const prevPitchesRef = useRef(activePitches.join(","));
  useEffect(() => {
    const currentStr = activePitches.join(",");
    if (currentStr !== prevPitchesRef.current) {
      if (explorerMode === "dictionary" && isPlaybackActive) {
        activePitches.forEach((pitch, index) => {
          setTimeout(() => playNote(pitch), index * 40);
        });
      }
      prevPitchesRef.current = currentStr;
    }
  }, [activePitches, explorerMode, isPlaybackActive, playNote]);

  const handleShiftFret = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newFretStart = fretStart + direction;
    if (newFretStart < 1) return; // Prevent going below fret 1
    
    // Shift selected notes respectively
    const newSelections: Record<number, FretSelection> = {};
    Object.keys(selectedFrets).forEach((key) => {
      const stringIdx = parseInt(key, 10);
      const val = selectedFrets[stringIdx];
      if (typeof val === "number" && val > 0) {
        // Shift fretted notes by direction
        const newVal = val + direction;
        newSelections[stringIdx] = newVal > 0 ? newVal : "x"; 
      } else {
        // Keep open strings (0) and muted strings ("x") as they are
        newSelections[stringIdx] = val;
      }
    });

    setAllSelections(newSelections);
    setFretStart(newFretStart);
  };

  // --------------------------------
  // Dictionary Mode Logic
  // --------------------------------
  const chordOptions = useMemo(() => {
    const rootData = (guitarDb.chords as any)[dictRoot] || [];
    return rootData.find((c: any) => c.suffix === dictSuffix);
  }, [dictRoot, dictSuffix]);

  const maxVoicings = chordOptions ? chordOptions.positions.length : 0;
  
  // Whenever dictionary selection changes, update the fretboard
  useEffect(() => {
    if (explorerMode === "dictionary" && chordOptions && chordOptions.positions[dictVoicingIndex]) {
      const position = chordOptions.positions[dictVoicingIndex];
      
      const newSelections: Record<number, FretSelection> = {};
      position.frets.forEach((fret: any, index: number) => {
        if (fret === "x" || fret === -1) {
          newSelections[index] = "x";
        } else if (fret === 0) {
          newSelections[index] = 0;
        } else {
          // chords-db stores frets relative to the baseFret (like a chord diagram).
          // 1 means the first fret shown on the diagram (which is baseFret).
          newSelections[index] = fret + position.baseFret - 1;
        }
      });
      
      setAllSelections(newSelections);
      setFretStart(position.baseFret);
    }
  }, [explorerMode, dictRoot, dictSuffix, dictVoicingIndex, chordOptions]);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
      
      <View style={styles.modeToggleContainer}>
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          <Pressable 
            style={[styles.segmentBtn, explorerMode === "reverse" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setExplorerMode("reverse");
            }}
          >
            <Text style={[styles.segmentText, { color: colors.textSecondary }, explorerMode === "reverse" && [styles.segmentTextActive, { color: colors.tint }]]}>Builder</Text>
          </Pressable>
          <Pressable 
            style={[styles.segmentBtn, explorerMode === "dictionary" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setExplorerMode("dictionary");
            }}
          >
            <Text style={[styles.segmentText, { color: colors.textSecondary }, explorerMode === "dictionary" && [styles.segmentTextActive, { color: colors.tint }]]}>Dictionary</Text>
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>Note Playback</Text>
          <Switch 
            value={isPlaybackActive} 
            onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLocalPlaybackEnabled(v); }}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>
      </View>

      {explorerMode === "dictionary" ? (
        <View style={[styles.controlsArea, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.dictionaryPickers}>
            <View style={styles.pickerCol}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Root Note</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B"].map(r => (
                  <Pressable 
                    key={r}
                    style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, dictRoot === r && [styles.pillActive, { backgroundColor: colors.tint, borderColor: colors.tint }]]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setDictRoot(r);
                    }}
                  >
                    <Text style={[styles.pillText, { color: colors.text }, dictRoot === r && styles.pillTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerCol}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Chord Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {COMMON_CHORD_SUFFIXES.map((s: string) => (
                  <Pressable 
                    key={s}
                    style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, dictSuffix === s && [styles.pillActive, { backgroundColor: colors.tint, borderColor: colors.tint }]]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setDictSuffix(s);
                    }}
                  >
                    <Text style={[styles.pillText, { color: colors.text }, dictSuffix === s && styles.pillTextActive]}>{formatChordName(s)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View style={[styles.stepperContainer, { backgroundColor: colors.surface }]}>
            <Pressable style={styles.stepperBtn} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setDictVoicingIndex(Math.max(0, dictVoicingIndex - 1));
            }}>
              <Text style={[styles.stepperIcon, { color: colors.text }]}>◀</Text>
            </Pressable>
            <Text style={[styles.stepperText, { color: colors.text }]}>
              Voicing {maxVoicings > 0 ? dictVoicingIndex + 1 : 0} of {maxVoicings}
            </Text>
            <Pressable style={styles.stepperBtn} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setDictVoicingIndex(Math.min(maxVoicings > 0 ? maxVoicings - 1 : 0, dictVoicingIndex + 1));
            }}>
              <Text style={[styles.stepperIcon, { color: colors.text }]}>▶</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[styles.controlsArea, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Tap on the fretboard below to build a chord shape.
          </Text>
          <View style={styles.resultsPanel}>
            <Text style={[styles.resultsLabel, { color: colors.textSecondary }]}>Detected Chord(s):</Text>
            {detectedChords.length > 0 ? (
              <Text style={[styles.detectedChordsText, { color: colors.text }]}>
                {detectedChords.join("  /  ")}
              </Text>
            ) : (
              <Text style={[styles.detectedChordsText, { color: colors.textMuted }]}>
                {activePitches.length > 0 ? "Unknown Chord" : "No notes selected"}
              </Text>
            )}
            <View style={styles.actionButtons}>
              <Pressable style={[styles.playBtn, { backgroundColor: colors.tint }]} onPress={handleStrum}>
                <Text style={styles.playBtnText}>▶ Play Chord</Text>
              </Pressable>
              <Pressable style={[styles.clearBtn, { backgroundColor: colors.danger + "20" }]} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                clearSelections();
              }}>
                <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {/* Capo Stepper */}
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, flex: 1, marginTop: 0 }]}>
              <Pressable style={styles.stepperBtn} onPress={() => setCapoFret(capoFret - 1)}>
                <Text style={[styles.stepperIcon, { color: colors.text }]}>◀</Text>
              </Pressable>
              <Text style={[styles.stepperText, { color: colors.text }]}>
                Capo {capoFret}
              </Text>
              <Pressable style={styles.stepperBtn} onPress={() => setCapoFret(capoFret + 1)}>
                <Text style={[styles.stepperIcon, { color: colors.text }]}>▶</Text>
              </Pressable>
            </View>

            {/* Fret Stepper */}
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, flex: 1, marginTop: 0 }]}>
              <Pressable style={styles.stepperBtn} onPress={() => handleShiftFret(-1)}>
                <Text style={[styles.stepperIcon, { color: colors.text }]}>◀</Text>
              </Pressable>
              <Text style={[styles.stepperText, { color: colors.text }]}>
                Fret {fretStart}
              </Text>
              <Pressable style={styles.stepperBtn} onPress={() => handleShiftFret(1)}>
                <Text style={[styles.stepperIcon, { color: colors.text }]}>▶</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <View style={styles.fretboardWrapper}>
        <ChordExplorer overrideTuningId={resolvedTuningId} isPlaybackActive={isPlaybackActive} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeToggleContainer: {
    padding: 16,
    paddingBottom: 8,
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
  controlsArea: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
    zIndex: 10,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  segmentTextActive: {},
  controlLabel: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  dictionaryPickers: {
  },
  pickerCol: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pillScroll: {
    flexDirection: "row",
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  stepperBtn: {
    padding: 8,
  },
  stepperIcon: {
    fontSize: 18,
    fontWeight: "900",
  },
  stepperText: {
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  resultsPanel: {
    alignItems: "center",
  },
  resultsLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  detectedChordsText: {
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 8,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  playBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearBtnText: {
    fontWeight: "700",
  },
  fretboardWrapper: {
    flex: 1,
  },
});
