export interface CirclePosition {
  position: number; // 0 to 11 (0 is 12 o'clock)
  majorKey: string;
  minorKey: string;
  signature: string; // e.g. "0", "1#", "2b"
}

export const CIRCLE_DATA: CirclePosition[] = [
  { position: 0, majorKey: "C", minorKey: "Am", signature: "0" },
  { position: 1, majorKey: "G", minorKey: "Em", signature: "1#" },
  { position: 2, majorKey: "D", minorKey: "Bm", signature: "2#" },
  { position: 3, majorKey: "A", minorKey: "F#m", signature: "3#" },
  { position: 4, majorKey: "E", minorKey: "C#m", signature: "4#" },
  { position: 5, majorKey: "B", minorKey: "G#m", signature: "5#" },
  { position: 6, majorKey: "Gb", minorKey: "Ebm", signature: "6b" }, // Often written as F# too, but Gb keeps the circle math cleaner usually, let's use Gb
  { position: 7, majorKey: "Db", minorKey: "Bbm", signature: "5b" },
  { position: 8, majorKey: "Ab", minorKey: "Fm", signature: "4b" },
  { position: 9, majorKey: "Eb", minorKey: "Cm", signature: "3b" },
  { position: 10, majorKey: "Bb", minorKey: "Gm", signature: "2b" },
  { position: 11, majorKey: "F", minorKey: "Dm", signature: "1b" },
];
