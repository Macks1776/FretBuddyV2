import { create } from "zustand";

export type LayoutMode = "horizontal" | "fullscreen";

interface PatternExplorerState {
  layoutMode: LayoutMode;
  activeTuningId: string;
  globalToggles: Record<string, boolean>; // e.g., { "C": true, "C#": false }
  fretOverrides: Record<string, boolean>; // e.g., { "0-3-C": false } (strIdx-fretNum-pitchClass)
  disabledStrings: number[]; // Array of string indices that are disabled
  triadRoot: string;
  
  setLayoutMode: (mode: LayoutMode) => void;
  setActiveTuningId: (id: string) => void;
  setTriadRoot: (root: string) => void;
  applyTriad: (notes: string[]) => void;
  toggleGlobalNote: (pitchClass: string) => void;
  toggleIndividualFret: (strIdx: number, fretNum: number, pitchClass: string, currentComputedState: boolean) => void;
  toggleString: (strIdx: number) => void;
  clearAll: () => void;
}

export const usePatternExplorerStore = create<PatternExplorerState>((set) => ({
  layoutMode: "horizontal",
  activeTuningId: "standard-6",
  globalToggles: {},
  fretOverrides: {},
  disabledStrings: [],
  triadRoot: "C",

  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setActiveTuningId: (id) => set({ activeTuningId: id }),
  setTriadRoot: (root) => set({ triadRoot: root }),
  
  applyTriad: (notes) => 
    set((state) => {
      const newToggles: Record<string, boolean> = {};
      notes.forEach(n => newToggles[n] = true);
      
      // We clear fretOverrides so the triad is fully visible, but we leave disabledStrings alone
      return {
        globalToggles: newToggles,
        fretOverrides: {},
      };
    }),
  
  toggleGlobalNote: (pitchClass) =>
    set((state) => {
      const isCurrentlyOn = !!state.globalToggles[pitchClass];
      const newGlobalState = !isCurrentlyOn;
      
      const newOverrides = { ...state.fretOverrides };
      for (const key of Object.keys(newOverrides)) {
        if (key.endsWith(`-${pitchClass}`)) {
          delete newOverrides[key];
        }
      }

      return {
        globalToggles: {
          ...state.globalToggles,
          [pitchClass]: newGlobalState,
        },
        fretOverrides: newOverrides,
      };
    }),

  toggleIndividualFret: (strIdx, fretNum, pitchClass, currentComputedState) =>
    set((state) => {
      const key = `${strIdx}-${fretNum}-${pitchClass}`;
      return {
        fretOverrides: {
          ...state.fretOverrides,
          [key]: !currentComputedState,
        }
      };
    }),
    
  toggleString: (strIdx) =>
    set((state) => {
      if (state.disabledStrings.includes(strIdx)) {
        return { disabledStrings: state.disabledStrings.filter((s) => s !== strIdx) };
      } else {
        return { disabledStrings: [...state.disabledStrings, strIdx] };
      }
    }),
    
  clearAll: () => set({ globalToggles: {}, fretOverrides: {}, disabledStrings: [] }),
}));
