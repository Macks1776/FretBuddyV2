import { useMemo } from 'react';
import { useFretboardStore } from '../store/useFretboardStore';
import { MusicTheoryService, TheoryData } from '../services/MusicTheoryService';
import { useSettingsStore } from '../store/useSettingsStore';

export interface FretboardTheoryData {
  scaleData: TheoryData | null;
  chordData: TheoryData | null;
  getBadgeInfo: (fretChroma: number) => {
    bgColor: string;
    borderColor: string;
    borderWidth: number;
    textColor: string;
    label: string;
    inScale: boolean;
    inChord: boolean;
  } | null;
}

export function useFretboardTheoryData(): FretboardTheoryData {
  const {
    showScale, scaleRoot, targetScale,
    showChord, chordRoot, targetChord,
    chordProgression, activeProgressionIndex,
    hideNonScaleChordTones
  } = useFretboardStore();
  
  const { noteDisplayPreference, colorPreference } = useSettingsStore();

  const scaleData = useMemo(() => {
    if (!showScale) return null;
    return MusicTheoryService.getScaleData(scaleRoot, targetScale);
  }, [showScale, scaleRoot, targetScale]);

  const chordData = useMemo(() => {
    if (!showChord) return null;

    let rootToUse = chordRoot;
    let targetToUse = targetChord;

    if (chordProgression && chordProgression.length > 0) {
      const activeProg = chordProgression[activeProgressionIndex] || chordProgression[0];
      rootToUse = activeProg.root;
      targetToUse = activeProg.suffix;
    }

    return MusicTheoryService.getChordData(rootToUse, targetToUse);
  }, [showChord, chordRoot, targetChord, chordProgression, activeProgressionIndex]);

  const getBadgeInfo = (fretChroma: number) => {
    const inScale = scaleData?.chromas.includes(fretChroma) ?? false;
    const inChord = chordData?.chromas.includes(fretChroma) ?? false;

    if (!inScale && !inChord) return null;
    
    // Hide chord tones that fall outside the active scale if requested
    if (hideNonScaleChordTones && inChord && !inScale) return null;

    let activeData: TheoryData | null = null;
    let targetIdx = -1;
    
    // Interval coloring: Relative to chord if chord is active. Else scale.
    if (showChord && inChord) {
      activeData = chordData;
      targetIdx = chordData!.chromas.indexOf(fretChroma);
    } else if (showScale && inScale) {
      activeData = scaleData;
      targetIdx = scaleData!.chromas.indexOf(fretChroma);
    }

    if (!activeData) return null;

    const intervalStr = activeData.intervals[targetIdx];
    const displayNote = activeData.notes[targetIdx];
    const isRoot = fretChroma === activeData.rootChroma;
    const baseColor = MusicTheoryService.getNoteColor(intervalStr, isRoot, colorPreference);

    let bgColor = "transparent";
    let borderColor = "transparent";
    let borderWidth = 0;
    let textColor = "#fff";

    if (inScale && inChord) { // Collision
      bgColor = baseColor;
      borderColor = "#fff";
      borderWidth = 3;
      textColor = "#fff";
    } else if (inChord && !inScale) { // Chord Only
      bgColor = "#fff";
      borderColor = baseColor;
      borderWidth = 3;
      textColor = baseColor;
    } else if (inScale && !inChord) { // Scale Only
      bgColor = baseColor;
      borderColor = "transparent";
      borderWidth = 0;
      textColor = "#fff";
    }

    return {
      bgColor, borderColor, borderWidth, textColor,
      label: MusicTheoryService.getNoteLabel(displayNote, intervalStr, noteDisplayPreference),
      inScale, inChord
    };
  };

  return { scaleData, chordData, getBadgeInfo };
}
