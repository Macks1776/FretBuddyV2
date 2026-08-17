import { useWindowDimensions } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

/**
 * Returns the current device orientation derived from window dimensions.
 * Automatically re-renders consumers when the device rotates.
 */
export function useOrientation(): Orientation {
  const { width, height } = useWindowDimensions();
  return width > height ? 'landscape' : 'portrait';
}
