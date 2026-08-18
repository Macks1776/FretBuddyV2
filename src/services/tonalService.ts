import { Note, Scale, Chord, Interval } from "@tonaljs/tonal";

export const tonalService = {
  getScaleNotes: (tonic: string, scaleName: string): string[] => {
    return Scale.get(`${tonic} ${scaleName}`).notes;
  },
  
  getScaleIntervals: (tonic: string, scaleName: string): string[] => {
    return Scale.get(`${tonic} ${scaleName}`).intervals;
  },

  getChordNotes: (chordName: string): string[] => {
    return Chord.get(chordName).notes;
  },

  getChordIntervals: (chordName: string): string[] => {
    return Chord.get(chordName).intervals;
  },

  getPitchClass: (note: string): string => {
    return Note.pitchClass(note);
  },

  getChroma: (note: string): number | undefined => {
    return Note.chroma(note) ?? undefined;
  },

  transpose: (note: string, interval: string): string => {
    return Note.transpose(note, interval);
  },

  getIntervalFromSemitones: (semitones: number): string => {
    return Interval.fromSemitones(semitones);
  },

  getIntervalDistance: (note1: string, note2: string): string => {
    return Interval.distance(note1, note2);
  }
};
