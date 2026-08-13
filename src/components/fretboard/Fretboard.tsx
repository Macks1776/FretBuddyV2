import React from 'react';
import FretboardHorizontal from './FretboardHorizontal';
import FretboardVertical from './FretboardVertical';

export interface FretboardProps {
  orientation: 'horizontal' | 'vertical';
  fretRange: [number, number]; // [startFret, endFret]
  strings: string[]; // Open string notes array, standard order e.g. ["E2", "A2", "D3", "G3", "B3", "E4"]
  renderBadge: (strIdx: number, fretNum: number, fretPitch: string) => React.ReactNode;
  onFretPress: (strIdx: number, fretNum: number, fretPitch: string) => void;
  onFretLongPress?: (strIdx: number, fretNum: number, fretPitch: string) => void;
  renderNutControl?: (strIdx: number) => React.ReactNode;
}

export default function Fretboard(props: FretboardProps) {
  if (props.orientation === 'horizontal') {
    return <FretboardHorizontal {...props} />;
  }
  return <FretboardVertical {...props} />;
}
