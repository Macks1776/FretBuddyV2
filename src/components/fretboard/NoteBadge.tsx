import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  bgColor, borderColor, borderWidth, textColor, label, size = 26, isSmallText = false
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
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  noteTextSmall: {
    fontSize: 9,
    textAlign: "center",
  },
});
