import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useChordExplorerStore } from "../store/useChordExplorerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useToneStore } from "../store/useToneStore";
import { DEFAULT_TUNINGS } from "../utils/tunings";
import * as Haptics from "expo-haptics";
import Fretboard from "./fretboard/Fretboard";
import NoteBadge from "./fretboard/NoteBadge";
import { tonalService } from "../services/tonalService";

interface Props {
  overrideTuningId?: string;
}

export default function ChordExplorer({ overrideTuningId }: Props = {}) {
  const { fretStart, selectedFrets, activeTuningId, setFretSelection } = useChordExplorerStore();
  const { customTunings, noteDisplayPreference } = useSettingsStore();
  const { playNote } = useToneStore();

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const resolvedTuningId = overrideTuningId || activeTuningId;
  const tuning = allTunings.find(t => t.id === resolvedTuningId) || allTunings[0];

  return (
    <View style={styles.container}>
      <View style={styles.fretboardContainer}>
        <Fretboard
          orientation="vertical"
          fretRange={[fretStart, fretStart + 4]}
          strings={tuning.notes}
          renderNutControl={(strIdx) => {
            const selection = selectedFrets[strIdx];
            return (
              <Pressable 
                style={styles.nutBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (selection === "x") {
                    setFretSelection(strIdx, 0);
                    playNote(tuning.notes[strIdx]);
                  } else {
                    setFretSelection(strIdx, "x");
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
            );
          }}
          onFretPress={(strIdx, fretNum, fretPitch) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const isSelected = selectedFrets[strIdx] === fretNum;
            if (!isSelected) {
              setFretSelection(strIdx, fretNum);
            }
            playNote(fretPitch);
          }}
          onFretLongPress={(strIdx, fretNum, fretPitch) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
