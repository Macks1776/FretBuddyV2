import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NoteDisplayPreference, ColorPreference, Tuning, InstrumentPreference, ThemePreference, AccidentalPreference, HapticPreference, NoteDurationPreference } from "../types/settings";
import { DEFAULT_TUNINGS } from "../utils/tunings";

interface SettingsState {
  noteDisplayPreference: NoteDisplayPreference;
  colorPreference: ColorPreference;
  accidentalPreference: AccidentalPreference;
  instrumentPreference: InstrumentPreference;
  themePreference: ThemePreference;
  hapticPreference: HapticPreference;
  noteDurationPreference: NoteDurationPreference;
  customTunings: Tuning[];
  isLeftHanded: boolean;
  notePlaybackEnabled: boolean;
  metronomeGlobalPlayback: boolean;
  drumMachineGlobalPlayback: boolean;
  backgroundAudioEnabled: boolean;
  setNoteDisplayPreference: (pref: NoteDisplayPreference) => void;
  setColorPreference: (pref: ColorPreference) => void;
  setAccidentalPreference: (pref: AccidentalPreference) => void;
  setInstrumentPreference: (pref: InstrumentPreference) => void;
  setThemePreference: (pref: ThemePreference) => void;
  setHapticPreference: (pref: HapticPreference) => void;
  setNoteDurationPreference: (pref: NoteDurationPreference) => void;
  setIsLeftHanded: (isLeftHanded: boolean) => void;
  setNotePlaybackEnabled: (enabled: boolean) => void;
  setMetronomeGlobalPlayback: (enabled: boolean) => void;
  setDrumMachineGlobalPlayback: (enabled: boolean) => void;
  setBackgroundAudioEnabled: (enabled: boolean) => void;
  saveCustomTuning: (tuning: Tuning) => void;
  deleteCustomTuning: (id: string) => void;
  getAlTuningOptions: () => Tuning[];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      noteDisplayPreference: "both",
      colorPreference: "interval",
      accidentalPreference: "sharp",
      instrumentPreference: "acoustic_guitar_nylon",
      themePreference: "system",
      hapticPreference: "medium",
      noteDurationPreference: "normal",
      customTunings: [],
      isLeftHanded: false,
      notePlaybackEnabled: true,
      metronomeGlobalPlayback: false,
      drumMachineGlobalPlayback: false,
      backgroundAudioEnabled: false,

      setNoteDisplayPreference: (pref) =>
        set({ noteDisplayPreference: pref }),

      setColorPreference: (pref) =>
        set({ colorPreference: pref }),

      setAccidentalPreference: (pref) =>
        set({ accidentalPreference: pref }),

      setInstrumentPreference: (pref) =>
        set({ instrumentPreference: pref }),

      setThemePreference: (pref) =>
        set({ themePreference: pref }),

      setHapticPreference: (pref) =>
        set({ hapticPreference: pref }),

      setNoteDurationPreference: (pref) =>
        set({ noteDurationPreference: pref }),

      setIsLeftHanded: (isLeftHanded: boolean) =>
        set({ isLeftHanded }),

      setNotePlaybackEnabled: (enabled: boolean) =>
        set({ notePlaybackEnabled: enabled }),

      setMetronomeGlobalPlayback: (enabled: boolean) =>
        set({ metronomeGlobalPlayback: enabled }),

      setDrumMachineGlobalPlayback: (enabled: boolean) =>
        set({ drumMachineGlobalPlayback: enabled }),

      setBackgroundAudioEnabled: (enabled: boolean) =>
        set({ backgroundAudioEnabled: enabled }),

      saveCustomTuning: (tuning) =>
        set((state) => {
          const existingIndex = state.customTunings.findIndex((t) => t.id === tuning.id);
          if (existingIndex >= 0) {
            const updatedTunings = [...state.customTunings];
            updatedTunings[existingIndex] = tuning;
            return { customTunings: updatedTunings };
          }
          return { customTunings: [...state.customTunings, tuning] };
        }),

      deleteCustomTuning: (id) =>
        set((state) => ({
          customTunings: state.customTunings.filter((t) => t.id !== id),
        })),

      getAlTuningOptions: () => {
        return [...DEFAULT_TUNINGS, ...get().customTunings];
      },
    }),
    {
      name: "fretbuddy-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
