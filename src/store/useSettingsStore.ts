import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NoteDisplayPreference, ColorPreference, Tuning, InstrumentPreference, ThemePreference } from "../types/settings";
import { DEFAULT_TUNINGS } from "../utils/tunings";

interface SettingsState {
  noteDisplayPreference: NoteDisplayPreference;
  colorPreference: ColorPreference;
  instrumentPreference: InstrumentPreference;
  themePreference: ThemePreference;
  customTunings: Tuning[];
  setNoteDisplayPreference: (pref: NoteDisplayPreference) => void;
  setColorPreference: (pref: ColorPreference) => void;
  setInstrumentPreference: (pref: InstrumentPreference) => void;
  setThemePreference: (pref: ThemePreference) => void;
  saveCustomTuning: (tuning: Tuning) => void;
  deleteCustomTuning: (id: string) => void;
  getAlTuningOptions: () => Tuning[];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      noteDisplayPreference: "both",
      colorPreference: "interval",
      instrumentPreference: "acoustic_guitar_nylon",
      themePreference: "system",
      customTunings: [],

      setNoteDisplayPreference: (pref) =>
        set({ noteDisplayPreference: pref }),

      setColorPreference: (pref) =>
        set({ colorPreference: pref }),

      setInstrumentPreference: (pref) =>
        set({ instrumentPreference: pref }),

      setThemePreference: (pref) =>
        set({ themePreference: pref }),

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
