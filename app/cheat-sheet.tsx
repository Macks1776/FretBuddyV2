import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SCALES, CHORDS, TheoryScale, TheoryChord } from "../src/utils/theoryData";
import { useTheme } from "../src/hooks/useTheme";

export default function CheatSheetScreen() {
  const [activeTab, setActiveTab] = useState<"scales" | "chords" | "circleOfFifths">("scales");
  const { colors, isDark } = useTheme();

  const renderBadgeRow = (label: string, items: string[], isSteps: boolean = false) => (
    <View style={styles.badgeSection}>
      <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.badgeRow}>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={[
              styles.badge, 
              isSteps 
                ? [styles.badgeStep, { backgroundColor: isDark ? "#1a2c4e" : "#e8f0fe", borderColor: isDark ? "#2a4270" : "#d2e3fc" }] 
                : [styles.badgeFormula, { backgroundColor: isDark ? "#2a1c3d" : "#f3e8fd", borderColor: isDark ? "#432a60" : "#ebd4fc" }]
            ]}>
              <Text style={[styles.badgeText, isSteps ? [styles.badgeStepText, { color: isDark ? "#8ab4f8" : "#1967d2" }] : [styles.badgeFormulaText, { color: isDark ? "#c58af9" : "#7e3ff2" }]]}>
                {item}
              </Text>
            </View>
            {/* Render a small connecting line between steps if it's W/H notation */}
            {isSteps && idx < items.length - 1 && (
              <View style={[styles.badgeConnector, { backgroundColor: isDark ? "#2a4270" : "#d2e3fc" }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  const renderScaleCard = (scale: TheoryScale) => (
    <View key={scale.id} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{scale.name}</Text>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{scale.description}</Text>
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
      {renderBadgeRow("Interval Steps (Whole/Half)", scale.steps, true)}
      {renderBadgeRow("Scale Formula", scale.formula)}
    </View>
  );

  const renderChordCard = (chord: TheoryChord) => (
    <View key={chord.id} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{chord.name}</Text>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{chord.description}</Text>
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
      {renderBadgeRow("Chord Formula", chord.formula)}
    </View>
  );

  const renderCircleOfFifths = () => (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Circle of Fifths</Text>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
        A visual representation of the relationships among the 12 tones of the chromatic scale, their key signatures, and major/minor keys.
      </Text>
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
      
      <Text style={[styles.factTitle, { color: colors.text }]}>Clockwise (Fifths)</Text>
      <Text style={[styles.factDesc, { color: colors.textSecondary }]}>
        Moving clockwise, each key starts on the fifth note of the previous key. Each step adds one sharp (♯) to the key signature. (C ➔ G ➔ D ➔ A...)
      </Text>

      <Text style={[styles.factTitle, { color: colors.text }]}>Counter-Clockwise (Fourths)</Text>
      <Text style={[styles.factDesc, { color: colors.textSecondary }]}>
        Moving counter-clockwise, each key starts on the fourth note of the previous key. Each step adds one flat (♭) to the key signature. (C ➔ F ➔ B♭ ➔ E♭...)
      </Text>

      <Text style={[styles.factTitle, { color: colors.text }]}>Relative Minors</Text>
      <Text style={[styles.factDesc, { color: colors.textSecondary }]}>
        Every major key has a relative minor key that shares the exact same key signature. For example, C Major and A Minor have no sharps or flats.
      </Text>

      <Text style={[styles.factTitle, { color: colors.text }]}>Finding Chords in a Key</Text>
      <Text style={[styles.factDesc, { color: colors.textSecondary }]}>
        Pick any note as your tonic (I). The note counter-clockwise is the IV chord, and clockwise is the V chord. Their relative minors (inner circle) give you the ii, iii, and vi chords!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Navigation */}
      <View style={styles.tabScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "scales" && [styles.tabBtnActive, { backgroundColor: colors.tint }]]}
            onPress={() => setActiveTab("scales")}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "scales" && styles.tabTextActive]}>Scales</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "chords" && [styles.tabBtnActive, { backgroundColor: colors.tint }]]}
            onPress={() => setActiveTab("chords")}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "chords" && styles.tabTextActive]}>Chords</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "circleOfFifths" && [styles.tabBtnActive, { backgroundColor: colors.tint }]]}
            onPress={() => setActiveTab("circleOfFifths")}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "circleOfFifths" && styles.tabTextActive]}>Circle of 5ths</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "scales" && SCALES.map(renderScaleCard)}
        {activeTab === "chords" && CHORDS.map(renderChordCard)}
        {activeTab === "circleOfFifths" && renderCircleOfFifths()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Tabs
  tabScrollWrapper: {
    marginVertical: 16,
  },
  tabContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
  },
  tabBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabBtnActive: {
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#fff",
  },

  // Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardDivider: {
    height: 1,
    marginVertical: 16,
  },

  // Badges
  badgeSection: {
    marginBottom: 16,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4, // for wrapped rows if they get too long
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeStep: {
    borderWidth: 1,
  },
  badgeFormula: {
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  badgeStepText: {
  },
  badgeFormulaText: {
  },
  badgeConnector: {
    width: 12,
    height: 2,
    marginHorizontal: 2,
  },

  // Circle of Fifths Facts
  factTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  factDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
