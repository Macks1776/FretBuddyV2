import { Note, Scale, Chord } from "@tonaljs/tonal";

// Example typed wrapper for getting scale notes
export const getScaleNotes = (tonic: string, scaleName: string): string[] => {
  return Scale.get(`${tonic} ${scaleName}`).notes;
};

// Example typed wrapper for getting chord notes
export const getChordNotes = (chordName: string): string[] => {
  return Chord.get(chordName).notes;
};
