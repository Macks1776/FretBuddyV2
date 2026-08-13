import React from "react";
import { View, StyleSheet } from "react-native";
import { useFretboardStore } from "../store/useFretboardStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useToneStore } from "../store/useToneStore";
import { DEFAULT_TUNINGS } from "../utils/tunings";
import { useFretboardTheoryData } from "../hooks/useFretboardTheoryData";
import Fretboard from "./fretboard/Fretboard";
import NoteBadge from "./fretboard/NoteBadge";
import { tonalService } from "../services/tonalService";

export default function ScaleExplorer() {
  const { layoutMode, activeTuningId, showScale, showChord } = useFretboardStore();
  const { customTunings } = useSettingsStore();
  const { playNote } = useToneStore();
  const { getBadgeInfo } = useFretboardTheoryData();

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const tuning = allTunings.find(t => t.id === activeTuningId) || allTunings[0];

  return (
    <View style={styles.container}>
      <Fretboard
        orientation={layoutMode === 'fullscreen' ? 'vertical' : 'horizontal'}
        fretRange={[0, 22]}
        strings={tuning.notes}
        onFretPress={(strIdx, fretNum, fretPitch) => {
          const fretChroma = tonalService.getChroma(fretPitch) ?? -1;
          const badge = fretChroma !== -1 ? getBadgeInfo(fretChroma) : null;
          if (!showScale && !showChord || badge) {
            playNote(fretPitch);
          }
        }}
        renderBadge={(strIdx, fretNum, fretPitch) => {
          const fretChroma = tonalService.getChroma(fretPitch);
          if (fretChroma === undefined) return null;
          const badge = getBadgeInfo(fretChroma);
          if (!badge) return null;

          return (
            <NoteBadge 
              bgColor={badge.bgColor}
              borderColor={badge.borderColor}
              borderWidth={badge.borderWidth}
              textColor={badge.textColor}
              label={badge.label}
              isSmallText={badge.label.includes('\n')}
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
