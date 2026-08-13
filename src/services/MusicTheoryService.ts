import { tonalService } from "./tonalService";

export interface TheoryData {
  root: string;
  rootChroma: number;
  chromas: number[];
  intervals: string[];
  notes: string[];
}

export class MusicTheoryService {
  static getScaleData(scaleRoot: string, targetScale: string): TheoryData {
    const r = tonalService.getPitchClass(scaleRoot);
    const scaleName = targetScale.replace("_", " ");
    const notes = tonalService.getScaleNotes(r, scaleName);
    const intervals = tonalService.getScaleIntervals(r, scaleName);
    
    return {
      root: r,
      rootChroma: tonalService.getChroma(r) ?? 0,
      chromas: notes.map(n => tonalService.getChroma(n) ?? -1).filter(c => c !== -1),
      intervals: intervals,
      notes: notes.map(n => tonalService.getPitchClass(n)),
    };
  }

  static getChordData(chordRoot: string, targetChord: string): TheoryData {
    const r = tonalService.getPitchClass(chordRoot);
    const chordMap: Record<string, string> = {
      major: "M", minor: "m", diminished: "dim", augmented: "aug",
      major7: "maj7", minor7: "m7", dominant7: "7", sus2: "sus2", sus4: "sus4"
    };
    const suffix = chordMap[targetChord] || targetChord;
    const chordName = `${r}${suffix}`;
    const notes = tonalService.getChordNotes(chordName);
    const intervals = tonalService.getChordIntervals(chordName);

    return {
      root: r,
      rootChroma: tonalService.getChroma(r) ?? 0,
      chromas: notes.map(n => tonalService.getChroma(n) ?? -1).filter(c => c !== -1),
      intervals: intervals,
      notes: notes.map(n => tonalService.getPitchClass(n)),
    };
  }

  static getNoteColor(intervalStr: string, isRoot: boolean, colorPreference: "static" | "interval" | string = "interval"): string {
    if (colorPreference === "static") return isRoot ? "#e74c3c" : "#3498db";
    if (isRoot) return "#e74c3c";
    if (intervalStr.includes("3")) return "#f1c40f";
    if (intervalStr.includes("5")) return "#2ecc71";
    if (intervalStr.includes("7")) return "#9b59b6";
    return "#3498db";
  }

  static getNoteLabel(displayNote: string, intervalStr: string, noteDisplayPreference: "letter" | "interval" | "both" | string = "letter"): string {
    if (noteDisplayPreference === "letter") return displayNote;
    if (noteDisplayPreference === "interval") return intervalStr || displayNote;
    return intervalStr ? `${displayNote}\n${intervalStr}` : displayNote;
  }
}
