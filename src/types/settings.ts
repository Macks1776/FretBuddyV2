export type NoteDisplayPreference = 'letter' | 'interval' | 'both';
export type ColorPreference = 'interval' | 'static';
export type InstrumentPreference = 'acoustic_guitar_nylon' | 'acoustic_guitar_steel' | 'electric_guitar_clean' | 'electric_bass_finger';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface Tuning {
  id: string;
  name: string;
  notes: string[]; // e.g. ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
  isCustom: boolean;
}
