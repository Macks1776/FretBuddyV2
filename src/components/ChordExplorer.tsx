import React, { useRef } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useChordExplorerStore } from "../store/useChordExplorerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useToneStore } from "../store/useToneStore";
import { DEFAULT_TUNINGS } from "../utils/tunings";
import HapticService from '../services/HapticService';
import Fretboard from "./fretboard/Fretboard";
import NoteBadge from "./fretboard/NoteBadge";
import { tonalService } from "../services/tonalService";

interface Props {
  overrideTuningId?: string;
  isPlaybackActive?: boolean;
}

export default function ChordExplorer({ overrideTuningId, isPlaybackActive = true }: Props = {}) {
  const { fretStart, selectedFrets, activeTuningId, setFretSelection, capoFret } = useChordExplorerStore();
  const { customTunings, noteDisplayPreference } = useSettingsStore();
  const { playNote } = useToneStore();

  const lastPressRef = useRef({ time: 0, strIdx: -1, fretNum: -1 });
  const lastNutPressRef = useRef({ time: 0, strIdx: -1 });

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const resolvedTuningId = overrideTuningId || activeTuningId;
  const tuning = allTunings.find(t => t.id === resolvedTuningId) || allTunings[0];
  const strings = tuning.notes.map(note => tonalService.transpose(note, tonalService.getIntervalFromSemitones(capoFret)));

  return (
    <View style={styles.container}>
      <View style={styles.fretboardContainer}>
        <Fretboard
          orientation="vertical"
          fretRange={[fretStart, fretStart + 3]}
          strings={strings}
          isCapoActive={capoFret > 0}
          renderNutControl={(strIdx) => {
            const selection = selectedFrets[strIdx];
            return (
              <Pressable 
                style={styles.nutBtn}
                onPress={() => {
                  const now = Date.now();
                  const isDoubleTap = now - lastNutPressRef.current.time < 350 && lastNutPressRef.current.strIdx === strIdx;
                  lastNutPressRef.current = { time: now, strIdx };

                  if (isDoubleTap) {
                    HapticService.heavy();
                    setFretSelection(strIdx, "x");
                    lastNutPressRef.current = { time: 0, strIdx: -1 };
                  } else {
                    HapticService.medium();
                    if (selection === "x") {
                      setFretSelection(strIdx, 0);
                    }
                    if (isPlaybackActive) {
                      playNote(strings[strIdx]);
                    }
                  }
                }}
                onLongPress={() => {
                  HapticService.heavy();
                  setFretSelection(strIdx, "x");
                  lastNutPressRef.current = { time: 0, strIdx: -1 };
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
            );
          }}
          onFretPress={(strIdx, fretNum, fretPitch) => {
            const now = Date.now();
            const isDoubleTap = now - lastPressRef.current.time < 350 && 
                                lastPressRef.current.strIdx === strIdx && 
                                lastPressRef.current.fretNum === fretNum;
            lastPressRef.current = { time: now, strIdx, fretNum };

            if (isDoubleTap) {
              HapticService.heavy();
              setFretSelection(strIdx, 0);
              lastPressRef.current = { time: 0, strIdx: -1, fretNum: -1 };
            } else {
              HapticService.medium();
              const isSelected = selectedFrets[strIdx] === fretNum;
              if (!isSelected) {
                setFretSelection(strIdx, fretNum);
              }
              if (isPlaybackActive) {
                playNote(fretPitch);
              }
            }
          }}
          onFretLongPress={(strIdx, fretNum, fretPitch) => {
            HapticService.heavy();
            const isSelected = selectedFrets[strIdx] === fretNum;
            if (isSelected) {
              setFretSelection(strIdx, 0); // Unselect to open string
            }
          }}
          renderBadge={(strIdx, fretNum, fretPitch) => {
            const isSelected = selectedFrets[strIdx] === fretNum;
            if (!isSelected) return null;

            const fretPC = tonalService.getPitchClass(fretPitch);
            
            return (
              <NoteBadge
                bgColor="#3498db"
                borderColor="#3498db"
                borderWidth={0}
                textColor="#fff"
                label={fretPC}
                size={28}
              />
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
  },
  fretboardContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
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
});
