import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Note, Interval } from "@tonaljs/tonal";
import { useChordExplorerStore } from "../store/useChordExplorerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useToneStore } from "../store/useToneStore";
import { DEFAULT_TUNINGS } from "../utils/tunings";
import * as Haptics from "expo-haptics";

const FRET_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_MARKERS = [12, 24];

interface Props {
  overrideTuningId?: string;
}

export default function ChordBuilderFretboard({ overrideTuningId }: Props = {}) {
  const { fretStart, selectedFrets, activeTuningId, setFretSelection } = useChordExplorerStore();
  const { customTunings, noteDisplayPreference } = useSettingsStore();
  const { playNote } = useToneStore();

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const resolvedTuningId = overrideTuningId || activeTuningId;
  const tuning = allTunings.find(t => t.id === resolvedTuningId) || allTunings[0];
  
  const strings = tuning.notes;

  const viewportFrets = Array.from({ length: 5 }, (_, i) => fretStart + i);

  return (
    <View style={styles.container}>
      {/* Nut Controls (Open/Mute) */}
      <View style={styles.nutControlsRow}>
        {strings.map((openNote, strIdx) => {
          const selection = selectedFrets[strIdx];
          
          return (
            <View key={`nut-${strIdx}`} style={styles.nutControlCell}>
              <Pressable 
                style={styles.nutBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (selection === "x") {
                    setFretSelection(strIdx, 0); // Muted -> Open
                    playNote(openNote);
                  } else {
                    setFretSelection(strIdx, "x"); // Fretted/Open -> Muted
                  }
                }}
              >
                <Text style={[
                  styles.nutBtnText, 
                  selection === "x" && styles.nutBtnTextMuted, 
                  selection === 0 && styles.nutBtnTextOpen
                ]}>
                  {selection === "x" ? "X" : selection === 0 ? "O" : "-"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Fretboard Viewport */}
      <View style={styles.fretboardContainer}>
        {viewportFrets.map((fretNum, index) => {
          const isFirstInViewport = index === 0;

          return (
            <View key={`fret-${fretNum}`} style={[styles.fretRow, fretNum === 1 && styles.vNutCell]}>
              {/* Fret wires */}
              {(fretNum > 1 || !isFirstInViewport) && <View style={styles.vFretWire} />}

              {/* Fret Markers */}
              {FRET_MARKERS.includes(fretNum) && <View style={styles.vMarkerDot} />}
              {DOUBLE_MARKERS.includes(fretNum) && (
                <>
                  <View style={[styles.vMarkerDot, { left: "30%" }]} />
                  <View style={[styles.vMarkerDot, { left: "70%" }]} />
                </>
              )}

              {/* Fret Label (left edge) */}
              {(isFirstInViewport && fretNum > 1) ? (
                <Text style={styles.vFretLabelText}>{fretNum}fr</Text>
              ) : (FRET_MARKERS.includes(fretNum) || DOUBLE_MARKERS.includes(fretNum)) ? (
                <Text style={styles.vFretLabelText}>{fretNum}</Text>
              ) : null}

              <View style={styles.vStringsRow}>
                {strings.map((openNote, strIdx) => {
                  const thickness = 5 - (strIdx * 0.8);
                  const fretPitch = Note.transpose(openNote, Interval.fromSemitones(fretNum));
                  const fretPC = Note.pitchClass(fretPitch);
                  
                  const isSelected = selectedFrets[strIdx] === fretNum;

                  return (
                    <View key={`str-${strIdx}-${fretNum}`} style={styles.vFretCell}>
                      <View style={[styles.vStringLine, { width: thickness }]} />
                      
                      <Pressable 
                        style={styles.vTouchArea}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          if (isSelected) {
                            setFretSelection(strIdx, 0); // Unselect to open string
                          } else {
                            setFretSelection(strIdx, fretNum);
                            playNote(fretPitch);
                          }
                        }}
                      >
                        {isSelected && (
                          <View style={styles.noteBadge}>
                            <Text style={styles.noteText}>
                              {noteDisplayPreference === "interval" ? fretPC : fretPC}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  
  // Nut Controls
  nutControlsRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  nutControlCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nutBtn: {
    padding: 8,
  },
  nutBtnText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
  },
  nutBtnTextMuted: {
    color: "#e74c3c", // Red X
  },
  nutBtnTextOpen: {
    color: "#3498db", // Blue O
  },

  // Fretboard
  fretboardContainer: {
    width: "100%",
    backgroundColor: "#4a3525", // Rosewood
    borderRadius: 8,
    overflow: "hidden",
  },
  fretRow: {
    height: 70,
    position: "relative",
    justifyContent: "center",
  },
  vNutCell: {
    borderTopWidth: 8,
    borderTopColor: "#ecf0f1", // Bone nut at top if fret 1
  },
  vFretWire: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#a4b0be",
    zIndex: 2,
  },
  vMarkerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#dfe4ea",
    marginLeft: -10,
    marginTop: -10,
    zIndex: 0,
    opacity: 0.8,
  },
  vFretLabelText: {
    position: "absolute",
    left: 6, // Render inside the wood on the left edge
    top: "50%",
    marginTop: -8,
    color: "rgba(255, 255, 255, 0.5)", // Subtle white on rosewood
    fontSize: 14,
    fontWeight: "bold",
    zIndex: 1,
  },
  vStringsRow: {
    flexDirection: "row",
    height: "100%",
    paddingHorizontal: 16,
  },
  vFretCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  vStringLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    marginLeft: -1,
    backgroundColor: "#d1d8e0",
    zIndex: 1,
  },
  vTouchArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  
  // Note Badge
  noteBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  noteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
