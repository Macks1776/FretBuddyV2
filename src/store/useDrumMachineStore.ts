import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CustomSound = {
  base?: string; // The base sound this custom sound was created from
  // Tone Layer
  oscWaveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  pitchStart: number;
  pitchEnd: number;
  pitchDecay: number;
  toneVolume: number;
  
  // Noise Layer
  noiseFilterType: 'bandpass' | 'highpass' | 'lowpass';
  noiseFilterFreq: number;
  noiseDecay: number;
  noiseVolume: number;
  
  // Master
  masterDecay: number;
};

export const BUILT_IN_SOUNDS: Record<string, CustomSound> = {
  'kick': {
    oscWaveform: 'sine',
    pitchStart: 150,
    pitchEnd: 40,
    pitchDecay: 0.2,
    toneVolume: 1.0,
    noiseFilterType: 'lowpass',
    noiseFilterFreq: 1000,
    noiseDecay: 0.05,
    noiseVolume: 0.1,
    masterDecay: 0.4,
  },
  'snare': {
    oscWaveform: 'triangle',
    pitchStart: 250,
    pitchEnd: 150,
    pitchDecay: 0.1,
    toneVolume: 0.6,
    noiseFilterType: 'bandpass',
    noiseFilterFreq: 3000,
    noiseDecay: 0.25,
    noiseVolume: 0.8,
    masterDecay: 0.3,
  },
  'closed_hat': {
    oscWaveform: 'square',
    pitchStart: 400,
    pitchEnd: 400,
    pitchDecay: 0.05,
    toneVolume: 0.0,
    noiseFilterType: 'highpass',
    noiseFilterFreq: 8000,
    noiseDecay: 0.05,
    noiseVolume: 0.8,
    masterDecay: 0.05,
  },
  'open_hat': {
    oscWaveform: 'square',
    pitchStart: 400,
    pitchEnd: 400,
    pitchDecay: 0.1,
    toneVolume: 0.0,
    noiseFilterType: 'highpass',
    noiseFilterFreq: 8000,
    noiseDecay: 0.3,
    noiseVolume: 0.8,
    masterDecay: 0.3,
  },
  'high_tom': {
    oscWaveform: 'sine',
    pitchStart: 300,
    pitchEnd: 100,
    pitchDecay: 0.3,
    toneVolume: 0.9,
    noiseFilterType: 'lowpass',
    noiseFilterFreq: 1000,
    noiseDecay: 0.05,
    noiseVolume: 0.0,
    masterDecay: 0.4,
  },
  'low_tom': {
    oscWaveform: 'sine',
    pitchStart: 150,
    pitchEnd: 50,
    pitchDecay: 0.4,
    toneVolume: 0.9,
    noiseFilterType: 'lowpass',
    noiseFilterFreq: 800,
    noiseDecay: 0.05,
    noiseVolume: 0.0,
    masterDecay: 0.5,
  },
  'crash': {
    oscWaveform: 'square',
    pitchStart: 400,
    pitchEnd: 400,
    pitchDecay: 0.1,
    toneVolume: 0.0,
    noiseFilterType: 'highpass',
    noiseFilterFreq: 5000,
    noiseDecay: 1.5,
    noiseVolume: 1.0,
    masterDecay: 1.5,
  }
};

export type DrumPart = {
  id: string; // e.g. 'A', 'B', 'C'
  name: string;
  steps: number;
  resolution: number; // 8 for 1/8th, 16 for 1/16th, 32 for 1/32nd
  grid: number[][]; // [trackIndex][stepIndex] -> velocity
};

export type DrumMachineState = {
  // Sequencer State
  parts: DrumPart[];
  partSequence: string[]; // array of part ids dictating sequence order
  activePartId: string; // which part is being edited
  playbackMode: 'part' | 'song'; // whether to loop active part or play the full sequence
  currentSequenceName: string | null; // The name of the currently loaded sequence
  
  bpm: number;
  isPlaying: boolean;
  timeSignature: string; // '4/4', '3/4'
  tracks: string[]; // Sound IDs mapped to each row

  // Custom Sounds
  customSounds: Record<string, CustomSound>;

  // Pad Configuration
  padLayout: { rows: number; cols: number };
  padAssignments: string[]; // Length must match rows * cols
  velocityZonesEnabled: boolean;
  
  // Actions
  toggleStep: (trackIndex: number, stepIndex: number, velocity?: number) => void;
  setStepVelocity: (trackIndex: number, stepIndex: number, velocity: number) => void;
  clearGrid: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (timeSignature: string) => void;
  setTrackSound: (trackIndex: number, soundId: string) => void;
  addTrack: (soundId: string) => void;
  removeTrack: (trackIndex: number) => void;
  
  addPart: () => void;
  duplicatePart: (sourceId: string) => void;
  deletePart: (id: string) => void;
  renamePart: (id: string, name: string) => void;
  setActivePart: (id: string) => void;
  setPartSequence: (sequence: string[]) => void;
  setPlaybackMode: (mode: 'part' | 'song') => void;
  setPartSteps: (id: string, steps: number) => void;
  setPartResolution: (id: string, resolution: number) => void;
  
  saveCustomSound: (id: string, sound: CustomSound) => void;
  deleteCustomSound: (id: string) => void;
  
  updatePadLayout: (rows: number, cols: number) => void;
  updatePadAssignment: (index: number, soundId: string) => void;
  setPadCount: (count: number) => void;
  setVelocityZonesEnabled: (enabled: boolean) => void;
  
  saveSequence: (name: string) => Promise<void>;
  loadSequence: (name: string) => Promise<void>;
  loadStateFromStorage: () => Promise<void>;
};

const DEFAULT_TRACKS = ['kick', 'snare', 'closed_hat', 'open_hat'];
const DEFAULT_PAD_ASSIGNMENTS = ['kick', 'snare', 'closed_hat', 'open_hat'];
const DEFAULT_TOTAL_STEPS = 16;

const generateEmptyGrid = (numTracks: number, numSteps: number) => 
  Array(numTracks).fill(0).map(() => Array(numSteps).fill(0));

const DEFAULT_PART: DrumPart = {
  id: 'A',
  name: 'Part A',
  steps: DEFAULT_TOTAL_STEPS,
  resolution: 16,
  grid: generateEmptyGrid(DEFAULT_TRACKS.length, DEFAULT_TOTAL_STEPS),
};

export const useDrumMachineStore = create<DrumMachineState>((set, get) => ({
  parts: [DEFAULT_PART],
  partSequence: ['A'],
  activePartId: 'A',
  playbackMode: 'song',
  currentSequenceName: null,

  bpm: 120,
  isPlaying: false,
  timeSignature: '4/4',
  tracks: [...DEFAULT_TRACKS],
  
  customSounds: {},
  
  padLayout: { rows: 2, cols: 2 },
  padAssignments: [...DEFAULT_PAD_ASSIGNMENTS],
  velocityZonesEnabled: false,
  
  toggleStep: (trackIndex, stepIndex, velocity = 1.0) => set((state) => {
    const newParts = state.parts.map(p => {
      if (p.id !== state.activePartId) return p;
      const newGrid = p.grid.map(row => [...row]);
      newGrid[trackIndex][stepIndex] = newGrid[trackIndex][stepIndex] > 0 ? 0 : velocity;
      return { ...p, grid: newGrid };
    });
    return { parts: newParts };
  }),
  
  setStepVelocity: (trackIndex, stepIndex, velocity) => set((state) => {
    const newParts = state.parts.map(p => {
      if (p.id !== state.activePartId) return p;
      const newGrid = p.grid.map(row => [...row]);
      newGrid[trackIndex][stepIndex] = velocity;
      return { ...p, grid: newGrid };
    });
    return { parts: newParts };
  }),
  
  clearGrid: () => set((state) => {
    const steps = state.timeSignature === '3/4' ? 12 : 16;
    const newParts = state.parts.map(p => {
      if (p.id !== state.activePartId) return p;
      return { ...p, grid: generateEmptyGrid(state.tracks.length, steps) };
    });
    return { parts: newParts };
  }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setBpm: (bpm) => set({ bpm }),
  
  setTimeSignature: (timeSignature) => set((state) => {
    const stepsPerBar = timeSignature === '3/4' ? 12 : 16;
    
    // Resize grids for all parts
    const newParts = state.parts.map(p => {
      const newGrid = state.tracks.map((_, trackIdx) => {
        const oldRow = p.grid[trackIdx] || [];
        const newRow = Array(stepsPerBar).fill(0);
        for (let i = 0; i < Math.min(oldRow.length, stepsPerBar); i++) {
          newRow[i] = oldRow[i];
        }
        return newRow;
      });
      return { ...p, steps: stepsPerBar, grid: newGrid };
    });
    
    return { timeSignature, parts: newParts };
  }),
  
  setTrackSound: (trackIndex, soundId) => set((state) => {
    const newTracks = [...state.tracks];
    newTracks[trackIndex] = soundId;
    return { tracks: newTracks };
  }),

  addTrack: (soundId) => set((state) => {
    const newTracks = [...state.tracks, soundId];
    // Push a new empty row to every part's grid
    const newParts = state.parts.map(p => {
      const newGrid = [...p.grid, Array(p.steps || 16).fill(0)];
      return { ...p, grid: newGrid };
    });
    return { tracks: newTracks, parts: newParts };
  }),

  removeTrack: (trackIndex) => set((state) => {
    if (state.tracks.length <= 1) return state; // Don't delete the last track
    
    const newTracks = state.tracks.filter((_, idx) => idx !== trackIndex);
    // Remove the row from every part's grid
    const newParts = state.parts.map(p => {
      const newGrid = p.grid.filter((_, idx) => idx !== trackIndex);
      return { ...p, grid: newGrid };
    });
    return { tracks: newTracks, parts: newParts };
  }),

  addPart: () => set((state) => {
    const currentCount = state.parts.length;
    const newId = String.fromCharCode(65 + currentCount); // A, B, C...
    const steps = state.timeSignature === '3/4' ? 12 : 16;
    const newPart: DrumPart = {
      id: newId,
      name: `Part ${newId}`,
      steps,
      resolution: 16,
      grid: generateEmptyGrid(state.tracks.length, steps),
    };
    return { parts: [...state.parts, newPart] };
  }),

  duplicatePart: (sourceId) => set((state) => {
    const sourcePart = state.parts.find(p => p.id === sourceId);
    if (!sourcePart) return state;
    
    const currentCount = state.parts.length;
    const newId = String.fromCharCode(65 + currentCount); // A, B, C...
    
    // Deep copy the grid
    const copiedGrid = sourcePart.grid.map(row => [...row]);
    
    const newPart: DrumPart = {
      id: newId,
      name: `Part ${newId}`,
      steps: sourcePart.steps || 16,
      resolution: sourcePart.resolution || 16,
      grid: copiedGrid,
    };
    return { 
      parts: [...state.parts, newPart],
      activePartId: newId 
    };
  }),

  deletePart: (id) => set((state) => {
    let newParts = state.parts.filter(p => p.id !== id);
    
    // Ensure we always have at least one part
    if (newParts.length === 0) {
      const steps = state.timeSignature === '3/4' ? 12 : 16;
      newParts = [{
        id: 'A',
        name: 'Part A',
        steps,
        resolution: 16,
        grid: generateEmptyGrid(state.tracks.length, steps),
      }];
    }

    const newSequence = state.partSequence.filter(pId => pId !== id);
    // If sequence is empty, populate with first available part
    if (newSequence.length === 0) {
      newSequence.push(newParts[0].id);
    }

    const newActivePartId = state.activePartId === id ? newParts[0].id : state.activePartId;

    return {
      parts: newParts,
      partSequence: newSequence,
      activePartId: newActivePartId,
    };
  }),

  renamePart: (id, name) => set((state) => {
    const newParts = state.parts.map(p => 
      p.id === id ? { ...p, name: name.substring(0, 15) } : p
    );
    return { parts: newParts };
  }),

  setActivePart: (id) => set({ activePartId: id }),

  setPartSequence: (sequence) => set({ partSequence: sequence }),
  
  setPlaybackMode: (mode) => set({ playbackMode: mode }),
  
  setPartSteps: (id, newSteps) => set((state) => {
    const newParts = state.parts.map(p => {
      if (p.id !== id) return p;
      const newGrid = state.tracks.map((_, trackIdx) => {
        const oldRow = p.grid[trackIdx] || [];
        const newRow = Array(newSteps).fill(0);
        for (let i = 0; i < Math.min(oldRow.length, newSteps); i++) {
          newRow[i] = oldRow[i];
        }
        return newRow;
      });
      return { ...p, steps: newSteps, grid: newGrid };
    });
    return { parts: newParts };
  }),

  setPartResolution: (id, resolution) => set((state) => {
    const newParts = state.parts.map(p => p.id === id ? { ...p, resolution } : p);
    return { parts: newParts };
  }),

  saveCustomSound: (id, sound) => set((state) => {
    const updated = { ...state.customSounds, [id]: sound };
    AsyncStorage.setItem('@drum_custom_sounds', JSON.stringify(updated)).catch(console.error);
    return { customSounds: updated };
  }),
  
  deleteCustomSound: (id) => set((state) => {
    const updated = { ...state.customSounds };
    delete updated[id];
    AsyncStorage.setItem('@drum_custom_sounds', JSON.stringify(updated)).catch(console.error);
    return { customSounds: updated };
  }),
  
  updatePadLayout: (rows, cols) => set((state) => {
    const neededLength = rows * cols;
    const newAssignments = [...state.padAssignments];
    
    while (newAssignments.length < neededLength) {
      newAssignments.push('kick');
    }
    if (newAssignments.length > neededLength) {
      newAssignments.length = neededLength;
    }
    
    const layout = { rows, cols };
    AsyncStorage.setItem('@drum_pad_layout', JSON.stringify({ layout, assignments: newAssignments })).catch(console.error);
    return { padLayout: layout, padAssignments: newAssignments };
  }),
  
  updatePadAssignment: (index, soundId) => set((state) => {
    const newAssignments = [...state.padAssignments];
    newAssignments[index] = soundId;
    return { padAssignments: newAssignments };
  }),
  
  setVelocityZonesEnabled: (enabled) => set({ velocityZonesEnabled: enabled }),
  
  setPadCount: (count) => set((state) => {
    let newAssignments = [...state.padAssignments];
    if (count > newAssignments.length) {
      // Pad with 'kick' or the last sound
      const lastSound = newAssignments.length > 0 ? newAssignments[newAssignments.length - 1] : 'kick';
      while (newAssignments.length < count) {
        newAssignments.push(lastSound);
      }
    } else {
      // Truncate
      newAssignments = newAssignments.slice(0, count);
    }
    
    // Auto-calculate rows and cols
    let rows = 1;
    let cols = count;
    if (count === 2) { rows = 1; cols = 2; }
    else if (count === 3 || count === 4) { rows = 2; cols = 2; }
    else if (count === 5 || count === 6) { rows = 3; cols = 2; }
    else if (count === 7 || count === 8) { rows = 4; cols = 2; }
    else if (count === 9) { rows = 3; cols = 3; }
    else if (count === 10 || count === 11 || count === 12) { rows = 4; cols = 3; }
    else if (count > 12) { rows = 4; cols = 4; }
    
    return { padAssignments: newAssignments, padLayout: { rows, cols } };
  }),
  
  saveSequence: async (name) => {
    const state = get();
    const sequence = {
      parts: state.parts,
      partSequence: state.partSequence,
      bpm: state.bpm,
      timeSignature: state.timeSignature,
      tracks: state.tracks,
    };
    try {
      const stored = await AsyncStorage.getItem('@drum_sequences_v2');
      const sequences = stored ? JSON.parse(stored) : {};
      sequences[name] = sequence;
      await AsyncStorage.setItem('@drum_sequences_v2', JSON.stringify(sequences));
      set({ currentSequenceName: name });
    } catch (e) {
      console.error(e);
    }
  },
  
  loadSequence: async (name) => {
    try {
      const stored = await AsyncStorage.getItem('@drum_sequences_v2');
      if (stored) {
        const sequences = JSON.parse(stored);
        if (sequences[name]) {
          const seq = sequences[name];
          set({
            parts: seq.parts,
            partSequence: seq.partSequence,
            activePartId: seq.parts[0]?.id || 'A',
            bpm: seq.bpm,
            timeSignature: seq.timeSignature,
            tracks: seq.tracks,
            currentSequenceName: name,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  },
  
  loadStateFromStorage: async () => {
    try {
      const customSoundsStr = await AsyncStorage.getItem('@drum_custom_sounds');
      if (customSoundsStr) {
        set({ customSounds: JSON.parse(customSoundsStr) });
      }
      
      const padLayoutStr = await AsyncStorage.getItem('@drum_pad_layout');
      if (padLayoutStr) {
        const parsed = JSON.parse(padLayoutStr);
        set({ padLayout: parsed.layout, padAssignments: parsed.assignments });
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
