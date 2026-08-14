import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Key } from "@tonaljs/tonal";
import { CIRCLE_DATA, CirclePosition } from "../src/utils/circleOfFifthsData";
import CircleOfFifthsVisual from "../src/components/theory/CircleOfFifthsVisual";
import { useTheme } from "../src/hooks/useTheme";

export default function CircleOfFifthsScreen() {
  const [activeKey, setActiveKey] = useState("C");
  const { colors } = useTheme();

  // Determine if it's major or minor and find the circle data
  let isMinor = activeKey.endsWith("m");
  let tonic = isMinor ? activeKey.slice(0, -1) : activeKey;
  
  const circleData = CIRCLE_DATA.find(
    c => (isMinor && c.minorKey === activeKey) || (!isMinor && c.majorKey === activeKey)
  );

  // Get Tonal data
  const keyData = isMinor ? Key.minorKey(tonic) : Key.majorKey(tonic);
  
  // Tonal minorKey has 'natural' scale/chords. We'll use natural minor for standard diatonic.
  const scaleNotes = isMinor ? (keyData as any).natural?.scale : (keyData as any).scale;
  const triads = isMinor ? (keyData as any).natural?.triads : (keyData as any).triads;

  // Let's normalize it to be safe since Tonal's types can be complex
  const scaleArray = scaleNotes || [];
  const chordsArray = triads || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Circle of Fifths</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Tap a key to view details</Text>
        </View>

        <CircleOfFifthsVisual 
          activeKey={activeKey} 
          onSelectKey={setActiveKey} 
        />

        <View style={[styles.detailsCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.keyTitle, { color: colors.text }]}>{activeKey} {isMinor ? "Minor" : "Major"}</Text>
            {circleData && (
              <View style={[styles.signatureBadge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.signatureText, { color: colors.tint }]}>Signature: {circleData.signature}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Scale Notes</Text>
          <View style={styles.rowWrapper}>
            {scaleArray.map((note: string, index: number) => (
              <View key={`note-${index}`} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.chipText, { color: colors.text }]}>{note}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Diatonic Chords (Triads)</Text>
          <View style={styles.rowWrapper}>
            {chordsArray.map((chord: string, index: number) => {
              // Extract the roman numeral logic if we want, or just display the chord
              // For major: I, ii, iii, IV, V, vi, vii°
              const cleanChord = chord;
              
              return (
                <View key={`chord-${index}`} style={[styles.chip, styles.chordChip, { backgroundColor: colors.card, borderColor: colors.tint }]}>
                  <Text style={[styles.chordChipText, { color: colors.tint }]}>{cleanChord}</Text>
                </View>
              )
            })}
          </View>
          
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  
  // Details Card
  detailsCard: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  keyTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  signatureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  signatureText: {
    fontWeight: "600",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 16,
  },
  rowWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 40,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chordChip: {
    borderWidth: 1,
  },
  chordChipText: {
    fontSize: 14,
    fontWeight: "bold",
  }
});
