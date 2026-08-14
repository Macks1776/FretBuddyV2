import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

interface Props extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 50, ...rest }: Props) {
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
      {...rest}
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
