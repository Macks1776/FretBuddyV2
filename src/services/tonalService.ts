import { Note, Scale, Chord, Interval } from "@tonaljs/tonal";

export const tonalService = {
  getScaleNotes: (tonic: string, scaleName: string): string[] => {
    return Scale.get(`${tonic} ${scaleName}`).notes;
  },
  
  getScaleIntervals: (tonic: string, scaleName: string): string[] => {
    return Scale.get(`${tonic} ${scaleName}`).intervals;
  },

  getChordNotes: (chordName: string): string[] => {
    return Chord.get(chordName.split('/')[0]).notes;
  },

  getChordIntervals: (chordName: string): string[] => {
    return Chord.get(chordName.split('/')[0]).intervals;
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
  },

  detectChords: (notes: string[]): string[] => {
    return Chord.detect(notes);
  },

  getCloseScales: (notes: string[], root: string): { scale: string; matchCount: number; totalNotes: number; scaleLength: number; percentage: number; notes?: string[]; intervals?: string[]; isCommon?: boolean }[] => {
    const allScales = Scale.names();
    const results: { scale: string; matchCount: number; totalNotes: number; scaleLength: number; percentage: number; notes?: string[]; intervals?: string[]; isCommon?: boolean }[] = [];
    
    // Normalize user notes to pitch classes
    const targetNotes = notes.map(n => Note.pitchClass(n));
    if (targetNotes.length === 0) return results;

    const COMMON_SCALES = [
      'major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian',
      'major pentatonic', 'minor pentatonic', 'harmonic minor', 'melodic minor',
      'major blues', 'minor blues', 'blues'
    ];

    allScales.forEach(scaleName => {
      const scaleObj = Scale.get(`${root} ${scaleName}`);
      const scaleNotes = scaleObj.notes.map(n => Note.pitchClass(n));
      if (scaleNotes.length === 0) return;
      
      const matchCount = targetNotes.filter(n => scaleNotes.includes(n)).length;
      const percentage = (matchCount / Math.max(targetNotes.length, scaleNotes.length)) * 100;
      
      if (percentage >= 60) {
        results.push({
          scale: `${root} ${scaleName}`,
          matchCount,
          totalNotes: targetNotes.length,
          scaleLength: scaleNotes.length,
          percentage,
          notes: scaleObj.notes,
          intervals: scaleObj.intervals,
          isCommon: COMMON_SCALES.includes(scaleName)
        } as any);
      }
    });
    
    // Sort by match percentage desc, then by scale length (prefer standard 7 note scales)
    return results.sort((a, b) => b.percentage - a.percentage || a.scaleLength - b.scaleLength).slice(0, 15);
  }
};
