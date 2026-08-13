import { create } from "zustand";

export type LayoutMode = "horizontal" | "fullscreen";

interface FretboardState {
  layoutMode: LayoutMode;
  activeTuningId: string;
  
  showScale: boolean;
  scaleRoot: string;
  targetScale: string; // e.g., 'minor_pentatonic'

  showChord: boolean;
  chordRoot: string;
  targetChord: string; // e.g., 'major'

  chordProgression: { root: string; suffix: string }[];
  activeProgressionIndex: number;
  isPlayingProgression: boolean;
  progressionSpeedMs: number;

  hideNonScaleChordTones: boolean;

  setLayoutMode: (mode: LayoutMode) => void;
  setActiveTuningId: (id: string) => void;
  
  setShowScale: (show: boolean) => void;
  setScaleRoot: (note: string) => void;
  setTargetScale: (formula: string) => void;

  setShowChord: (show: boolean) => void;
  setChordRoot: (note: string) => void;
  setTargetChord: (formula: string) => void;

  // Sequencer Actions
  addChordToProgression: (root: string, suffix: string) => void;
  removeChordFromProgression: (index: number) => void;
  clearProgression: () => void;
  setActiveProgressionIndex: (index: number) => void;
  setIsPlayingProgression: (isPlaying: boolean) => void;
  setProgressionSpeedMs: (speed: number) => void;

  setHideNonScaleChordTones: (hide: boolean) => void;
}

export const useFretboardStore = create<FretboardState>((set) => ({
  layoutMode: "horizontal",
  activeTuningId: "standard-6",
  
  showScale: true,
  scaleRoot: "E",
  targetScale: "minor_pentatonic",

  showChord: false,
  chordRoot: "E",
  targetChord: "major",

  chordProgression: [],
  activeProgressionIndex: 0,
  isPlayingProgression: false,
  progressionSpeedMs: 2000,

  hideNonScaleChordTones: false,

  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setActiveTuningId: (id) => set({ activeTuningId: id }),
  
  setShowScale: (show) => set({ showScale: show }),
  setScaleRoot: (note) => set({ scaleRoot: note }),
  setTargetScale: (formula) => set({ targetScale: formula }),

  setShowChord: (show) => set({ showChord: show }),
  setChordRoot: (note) => set({ chordRoot: note }),
  setTargetChord: (formula) => set({ targetChord: formula }),

  addChordToProgression: (root, suffix) => 
    set((state) => ({ 
      chordProgression: [...state.chordProgression, { root, suffix }] 
    })),
    
  removeChordFromProgression: (index) => 
    set((state) => {
      const newProg = [...state.chordProgression];
      newProg.splice(index, 1);
      // Adjust index if we removed the active one or one before it
      let newIdx = state.activeProgressionIndex;
      if (newIdx >= newProg.length) newIdx = Math.max(0, newProg.length - 1);
      return { 
        chordProgression: newProg,
        activeProgressionIndex: newIdx
      };
    }),

  clearProgression: () => set({ chordProgression: [], activeProgressionIndex: 0, isPlayingProgression: false }),
  setActiveProgressionIndex: (index) => set({ activeProgressionIndex: index }),
  setIsPlayingProgression: (isPlaying) => set({ isPlayingProgression: isPlaying }),
  setProgressionSpeedMs: (speed) => set({ progressionSpeedMs: speed }),

  setHideNonScaleChordTones: (hide) => set({ hideNonScaleChordTones: hide }),
}));
