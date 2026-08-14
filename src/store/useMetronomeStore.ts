import { create } from 'zustand';

interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  beatsPerBar: number;
  backgroundFlashEnabled: boolean;
  ringPulseEnabled: boolean;
  soundType: 'beep' | 'click' | 'woodblock';
  
  setBpm: (bpm: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setBeatsPerBar: (beats: number) => void;
  setBackgroundFlashEnabled: (enabled: boolean) => void;
  setRingPulseEnabled: (enabled: boolean) => void;
  setSoundType: (sound: 'beep' | 'click' | 'woodblock') => void;
}

export const useMetronomeStore = create<MetronomeState>((set) => ({
  bpm: 120,
  isPlaying: false,
  beatsPerBar: 4,
  backgroundFlashEnabled: true,
  ringPulseEnabled: true,
  soundType: 'beep',
  
  setBpm: (bpm) => set({ bpm }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setBeatsPerBar: (beatsPerBar) => set({ beatsPerBar }),
  setBackgroundFlashEnabled: (backgroundFlashEnabled) => set({ backgroundFlashEnabled }),
  setRingPulseEnabled: (ringPulseEnabled) => set({ ringPulseEnabled }),
  setSoundType: (soundType) => set({ soundType }),
}));
