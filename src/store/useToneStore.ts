import { create } from "zustand";

interface ToneState {
  // A command queue. By simply setting a new note and triggering a render, 
  // the WebView can intercept the state change and play it.
  lastPlayedNote: string | null;
  playCount: number;
  playNote: (note: string) => void;
}

export const useToneStore = create<ToneState>((set) => ({
  lastPlayedNote: null,
  playCount: 0,
  playNote: (note) => set((state) => ({ 
    lastPlayedNote: note, 
    playCount: state.playCount + 1 
  })),
}));
