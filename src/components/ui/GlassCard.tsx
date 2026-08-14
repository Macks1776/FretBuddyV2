import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 50 }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <BlurView 
      intensity={intensity}
      tint={isDark ? "dark" : "light"}
      style={[
        styles.container,
        {
          backgroundColor: colors.glassBg,
          borderColor: colors.glassBorder,
        },
        style
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  }
});
