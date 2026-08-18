import { DrumPart } from './useDrumMachineStore';

// Helper to easily define grid arrays: each string is 16 steps, '.' is rest, 'x' is hit, 'X' is accent
const makeGridRow = (pattern: string) => {
  const row: number[] = Array(pattern.length).fill(0);
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === 'x') row[i] = 0.8;
    else if (pattern[i] === 'X') row[i] = 1.0;
    else if (pattern[i] === 'o') row[i] = 0.5; // ghost note
  }
  return row;
};

const makeGrid = (patterns: string[]) => {
  const grid: number[][] = [];
  patterns.forEach((pattern) => {
    grid.push(makeGridRow(pattern));
  });
  return grid;
};

export const PRESET_SEQUENCES: Record<string, any> = {
  "Basic Rock Beat": {
    bpm: 120,
    timeSignature: "4/4",
    tracks: ['kick', 'snare', 'closed_hat', 'open_hat'],
    partSequence: ['A'],
    parts: [
      {
        id: 'A',
        name: 'Rock Main',
        steps: 16,
        resolution: 16,
        swing: 0,
        grid: makeGrid([
          "x.......x.......", // Kick
          "....x.......x...", // Snare
          "x.x.x.x.x.x.x.x.", // Closed Hat
          "................", // Open Hat
        ])
      }
    ]
  },
  "Four on the Floor": {
    bpm: 128,
    timeSignature: "4/4",
    tracks: ['kick', 'snare', 'closed_hat', 'open_hat'],
    partSequence: ['A'],
    parts: [
      {
        id: 'A',
        name: 'House Main',
        steps: 16,
        resolution: 16,
        swing: 0,
        grid: makeGrid([
          "x...x...x...x...", // Kick
          "....x.......x...", // Snare
          "..x...x...x...x.", // Closed Hat (offbeats)
          "................", // Open Hat
        ])
      }
    ]
  },
  "Funky Break": {
    bpm: 105,
    timeSignature: "4/4",
    tracks: ['kick', 'snare', 'closed_hat', 'open_hat'],
    partSequence: ['A'],
    parts: [
      {
        id: 'A',
        name: 'Funk Main',
        steps: 16,
        resolution: 16,
        swing: 10,
        grid: makeGrid([
          "x..x....x...x...", // Kick
          "....x..o....x...", // Snare
          "xxxxxxxxxxxxxxxx", // Closed Hat
          "................", // Open Hat
        ])
      }
    ]
  }
};
