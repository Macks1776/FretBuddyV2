import React from 'react';
import { Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HapticService from '../../services/HapticService';
import AnimatedPressable from './AnimatedPressable';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  colors?: readonly [string, string, ...string[]];
}

export default function GradientButton({ title, onPress, icon, style, textStyle, colors: customColors }: Props) {
  const { colors } = useTheme();
  const gradientColors = customColors || colors.gradientPrimary;

  const handlePress = () => {
    HapticService.light();
    onPress();
  };

  return (
    <AnimatedPressable onPress={handlePress} style={style}>
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
