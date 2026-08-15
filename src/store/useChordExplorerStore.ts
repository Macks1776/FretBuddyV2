import { create } from "zustand";

export type FretSelection = number | "x";

export type ExplorerMode = "reverse" | "dictionary";

interface ChordExplorerState {
  explorerMode: ExplorerMode;
  dictRoot: string;
  dictSuffix: string;
  dictVoicingIndex: number;
  
  fretStart: number;
  capoFret: number;
  selectedFrets: Record<number, FretSelection>;
  activeTuningId: string;
  localPlaybackEnabled: boolean | null;

  setFretStart: (fret: number) => void;
  setCapoFret: (fret: number) => void;
  setFretSelection: (stringIndex: number, fret: FretSelection) => void;
  setAllSelections: (selections: Record<number, FretSelection>) => void;
  clearSelections: () => void;
  setActiveTuningId: (id: string) => void;

  setExplorerMode: (mode: ExplorerMode) => void;
  setDictRoot: (root: string) => void;
  setDictSuffix: (suffix: string) => void;
  setDictVoicingIndex: (index: number) => void;
  setLocalPlaybackEnabled: (enabled: boolean | null) => void;
}

export const useChordExplorerStore = create<ChordExplorerState>((set) => ({
  explorerMode: "reverse",
  dictRoot: "C",
  dictSuffix: "major",
  dictVoicingIndex: 0,

  fretStart: 1, // Standard open chord position
  capoFret: 0, // No capo by default
  selectedFrets: {
    0: "x",
    1: "x",
    2: "x",
    3: "x",
    4: "x",
    5: "x",
  },
  activeTuningId: "standard-6",
  localPlaybackEnabled: null,

  setFretStart: (fret) => set({ fretStart: Math.max(1, Math.min(18, fret)) }),
  setCapoFret: (fret) => set({ capoFret: Math.max(0, Math.min(12, fret)) }),
  
  setFretSelection: (stringIndex, fret) => 
    set((state) => ({
      explorerMode: "reverse",
      selectedFrets: {
        ...state.selectedFrets,
        [stringIndex]: fret
      }
    })),
    
  setAllSelections: (selections) => set({ selectedFrets: selections }),

  clearSelections: () => set({
    selectedFrets: {
      0: "x",
      1: "x",
      2: "x",
      3: "x",
      4: "x",
      5: "x",
    }
  }),

  setActiveTuningId: (id) => set({ activeTuningId: id }),

  setExplorerMode: (mode) => set({ explorerMode: mode }),
  setDictRoot: (root) => set({ dictRoot: root, dictVoicingIndex: 0 }),
  setDictSuffix: (suffix) => set({ dictSuffix: suffix, dictVoicingIndex: 0 }),
  setDictVoicingIndex: (index) => set({ dictVoicingIndex: index }),
  setLocalPlaybackEnabled: (enabled) => set({ localPlaybackEnabled: enabled }),
}));
