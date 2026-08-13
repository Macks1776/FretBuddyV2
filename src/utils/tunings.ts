import { Tuning } from "../types/settings";

export const DEFAULT_TUNINGS: Tuning[] = [
  {
    id: "standard-6",
    name: "Standard",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
    isCustom: false,
  },
  {
    id: "drop-d-6",
    name: "Drop D",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
    isCustom: false,
  },
  {
    id: "open-g-6",
    name: "Open G",
    notes: ["D2", "G2", "D3", "G3", "B3", "D4"],
    isCustom: false,
  },
  {
    id: "open-d-6",
    name: "Open D",
    notes: ["D2", "A2", "D3", "F#3", "A3", "D4"],
    isCustom: false,
  },
  {
    id: "dadgad-6",
    name: "DADGAD",
    notes: ["D2", "A2", "D3", "G3", "A3", "D4"],
    isCustom: false,
  },
];
