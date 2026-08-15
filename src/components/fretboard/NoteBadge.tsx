import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  label: string;
  size?: number;
  isSmallText?: boolean;
}

export default function NoteBadge({
  bgColor, borderColor, borderWidth, textColor, label, size = 32, isSmallText = false
}: Props) {
  return (
    <View style={[
      styles.noteBadge,
      {
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: borderWidth,
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.0)', 'rgba(0,0,0,0.3)']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={[StyleSheet.absoluteFill, { borderRadius: (size - borderWidth * 2) / 2 }]}
      />
      <Text style={[
        styles.noteText,
        { color: textColor },
        isSmallText && styles.noteTextSmall
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noteBadge: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  noteText: {
    fontSize: 14,
    fontWeight: "bold",
    zIndex: 1,
  },
  noteTextSmall: {
    fontSize: 11,
    textAlign: "center",
  },
});
