import React from "react";
import { View, StyleSheet } from "react-native";
import { usePatternExplorerStore } from "../store/usePatternExplorerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useToneStore } from "../store/useToneStore";
import { DEFAULT_TUNINGS } from "../utils/tunings";
import Fretboard from "./fretboard/Fretboard";
import NoteBadge from "./fretboard/NoteBadge";
import { tonalService } from "../services/tonalService";

const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function PatternExplorer() {
  const { layoutMode, activeTuningId, globalToggles, fretOverrides, toggleIndividualFret, disabledStrings } = usePatternExplorerStore();
  const { customTunings, accidentalPreference } = useSettingsStore();
  const { playNote } = useToneStore();

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const tuning = allTunings.find(t => t.id === activeTuningId) || allTunings[0];

  const getComputedState = (strIdx: number, fretNum: number, pitchClass: string) => {
    const key = `${strIdx}-${fretNum}-${pitchClass}`;
    if (fretOverrides[key] !== undefined) {
      return fretOverrides[key];
    }
    return !!globalToggles[pitchClass];
  };

  return (
    <View style={styles.container}>
      <Fretboard
        orientation={layoutMode === 'fullscreen' ? 'vertical' : 'horizontal'}
        fretRange={[0, 22]}
        strings={tuning.notes}
        onFretPress={(strIdx, fretNum, fretPitch) => {
          // Play the note
          playNote(fretPitch);
          
          // Toggle the state
          const chroma = tonalService.getChroma(fretPitch);
          if (chroma === undefined) return;
          
          // Use sharp or flat based on preference
          const pitchClass = accidentalPreference === "flat" ? NOTES_FLAT[chroma] : NOTES_SHARP[chroma];
          const currentState = getComputedState(strIdx, fretNum, pitchClass);
          
          if (!currentState) {
            toggleIndividualFret(strIdx, fretNum, pitchClass, currentState);
          }
        }}
        onFretLongPress={(strIdx, fretNum, fretPitch) => {
          const chroma = tonalService.getChroma(fretPitch);
          if (chroma === undefined) return;
          
          const pitchClass = accidentalPreference === "flat" ? NOTES_FLAT[chroma] : NOTES_SHARP[chroma];
          const currentState = getComputedState(strIdx, fretNum, pitchClass);
          
          if (currentState) {
            toggleIndividualFret(strIdx, fretNum, pitchClass, currentState);
          }
        }}
        renderBadge={(strIdx, fretNum, fretPitch) => {
          if (disabledStrings.includes(strIdx)) return null;
          
          const chroma = tonalService.getChroma(fretPitch);
          if (chroma === undefined) return null;
          
          const pitchClass = accidentalPreference === "flat" ? NOTES_FLAT[chroma] : NOTES_SHARP[chroma];
          const isActive = getComputedState(strIdx, fretNum, pitchClass);
          
          if (!isActive) return null;

          return (
            <NoteBadge 
              bgColor="#3498db"
              borderColor="#2980b9"
              borderWidth={1}
              textColor="#fff"
              label={pitchClass}
              isSmallText={pitchClass.length > 2}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
