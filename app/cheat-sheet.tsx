import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, LayoutAnimation, UIManager, Platform } from "react-native";
import { SCALES, CHORDS, PROGRESSIONS, TheoryScale, TheoryChord, TheoryProgression } from "../src/utils/theoryData";
import { useTheme } from "../src/hooks/useTheme";
import { Search, ChevronRight, ChevronDown, Lightbulb, Music, List, Circle, ChevronRight as ArrowRight } from "lucide-react-native";



const CHORD_CATEGORIES = [
  { title: "Triads", ids: ["major", "minor", "diminished", "augmented"] },
  { title: "7th Chords", ids: ["major7", "minor7", "dominant7"] },
  { title: "Suspended", ids: ["sus2", "sus4"] },
  { title: "Advanced Concepts", ids: ["add_chords", "slash_chords", "inversions"] },
];

const SCALE_CATEGORIES = [
  { title: "Essential Scales", ids: ["major", "aeolian", "harmonic_minor"] },
  { title: "Pentatonic & Blues", ids: ["major_pentatonic", "minor_pentatonic", "blues"] },
  { title: "Modes", ids: ["dorian", "phrygian", "lydian", "mixolydian", "locrian"] },
];

export default function CheatSheetScreen() {
  const [activeTab, setActiveTab] = useState<"scales" | "chords" | "progressions" | "circleOfFifths">("scales");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Triads": true,
    "Essential Scales": true,
  });
  const { colors, isDark } = useTheme();

  useEffect(() => {
    // Reset search when changing tabs
    setSearchQuery("");
  }, [activeTab]);

  const toggleCategory = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderBadgeRow = (label: string, items: string[], isSteps: boolean = false, alignment: "flex-start" | "center" | "space-between" = "flex-start") => {
    const primaryColor = isSteps ? colors.tint : (isDark ? "#A855F7" : "#8B5CF6");
    const bgColor = isDark ? `${primaryColor}20` : `${primaryColor}15`;
    
    return (
      <View style={styles.badgeSection}>
        <Text style={[styles.badgeLabel, { color: colors.textSecondary, textAlign: alignment === "center" ? "center" : "left" }]}>{label}</Text>
        <View style={[styles.badgeContainer, { justifyContent: alignment, gap: isSteps ? 2 : 6 }]}>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <View style={[styles.badge, isSteps ? styles.stepBadge : styles.formulaBadge, { backgroundColor: bgColor, borderColor: primaryColor }]}>
                <Text style={[styles.badgeText, { color: primaryColor, fontSize: isSteps ? 15 : 15 }]}>
                  {item}
                </Text>
              </View>
              {isSteps && idx < items.length - 1 && (
                <View style={styles.badgeArrowContainer}>
                  <ArrowRight size={14} color={primaryColor} opacity={0.5} />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  const renderScaleCard = (scale: TheoryScale) => (
    <View key={scale.id} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{scale.name}</Text>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{scale.description}</Text>
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
      {renderBadgeRow("Interval Steps (Whole/Half)", scale.steps, true, "flex-start")}
      {renderBadgeRow("Scale Formula", scale.formula, false, "flex-start")}
    </View>
  );

  const renderChordCard = (chord: TheoryChord) => (
    <View key={chord.id} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{chord.name}</Text>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{chord.description}</Text>
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
      {renderBadgeRow("Chord Formula", chord.formula, false, "flex-start")}
    </View>
  );

  const renderProgressionCard = (prog: TheoryProgression) => {
    if (searchQuery && !prog.name.toLowerCase().includes(searchQuery.toLowerCase()) && !prog.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }
    return (
      <View key={prog.id} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{prog.name}</Text>
        <Text style={[styles.cardVibe, { color: colors.tint }]}>{prog.vibe}</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{prog.description}</Text>
        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
        {renderBadgeRow("Progression", prog.chords, true, "flex-start")}
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Popular Examples</Text>
          {prog.examples.map((ex, idx) => (
            <Text key={idx} style={[styles.exampleText, { color: colors.text }]}>• {ex}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderExplainerCard = (title: string, paragraphs: string[], icon: React.ReactNode) => (
    <View style={[styles.explainerCard, { backgroundColor: isDark ? `${colors.tint}15` : `${colors.tint}10`, borderColor: `${colors.tint}40` }]}>
      <View style={styles.explainerHeader}>
        {icon}
        <Text style={[styles.explainerTitle, { color: colors.tint }]}>{title}</Text>
      </View>
      {paragraphs.map((p, idx) => (
        <Text key={idx} style={[styles.explainerDesc, { color: colors.text }, idx < paragraphs.length - 1 && { marginBottom: 12 }]}>
          {p}
        </Text>
      ))}
    </View>
  );

  const renderCircleOfFifths = () => (
    <View>
      {renderExplainerCard(
        "Circle of Fifths",
        ["A visual representation of the relationships among the 12 tones of the chromatic scale, their key signatures, and major/minor keys."],
        <Circle size={24} color={colors.tint} />
      )}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text, marginTop: 16 }]}>
        <Text style={[styles.factTitle, { color: colors.text, marginTop: 0 }]}>Clockwise (Fifths)</Text>
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
    </View>
  );

  const renderCategory = (title: string, items: any[], renderer: (item: any) => React.ReactNode) => {
    const isExpanded = expandedCategories[title] || searchQuery.length > 0;
    
    // Filter items based on search query
    const filteredItems = items.filter(item => 
      !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredItems.length === 0) return null;

    return (
      <View key={title} style={styles.categoryContainer}>
        <Pressable 
          style={[styles.categoryHeader, { borderBottomColor: colors.border, borderBottomWidth: isExpanded ? 1 : 0 }]} 
          onPress={() => toggleCategory(title)}
        >
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{title}</Text>
          {isExpanded ? <ChevronDown size={20} color={colors.textSecondary} /> : <ChevronRight size={20} color={colors.textSecondary} />}
        </Pressable>
        {isExpanded && (
          <View style={styles.categoryContent}>
            {title === "Modes" && !searchQuery && renderExplainerCard(
              "What are Modes? (Scale Inversions)",
              [
                "You can think of modes as \"scale inversions\". Just like you can invert a chord by playing its notes in a different order, you can invert a scale by starting on a different note.",
                "There are 7 modes of the Major scale. In fact, the standard Major scale is itself the 1st mode (Ionian), and the standard Natural Minor scale is the 6th mode (Aeolian)!",
                "If you take the C Major Scale (C D E F G A B) and play the exact same notes but start and end on D, you get the D Dorian Mode (D E F G A B C). Start on E, you get E Phrygian. They share the exact same notes, but sound completely different because the tonal center (the \"home\" note) has shifted."
              ],
              <Lightbulb size={24} color={colors.tint} />
            )}
            {filteredItems.map(renderer)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      {activeTab !== "circleOfFifths" && (
        <View style={styles.searchWrapper}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={[styles.tabScrollWrapper, activeTab === "circleOfFifths" && { marginTop: 16 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "scales" && [styles.tabBtnActive, { backgroundColor: colors.tint, shadowColor: colors.tint }]]}
            onPress={() => setActiveTab("scales")}
          >
            <Music size={16} color={activeTab === "scales" ? "#fff" : colors.textSecondary} />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "scales" && styles.tabTextActive]}>Scales</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "chords" && [styles.tabBtnActive, { backgroundColor: colors.tint, shadowColor: colors.tint }]]}
            onPress={() => setActiveTab("chords")}
          >
            <Lightbulb size={16} color={activeTab === "chords" ? "#fff" : colors.textSecondary} />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "chords" && styles.tabTextActive]}>Chords</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "progressions" && [styles.tabBtnActive, { backgroundColor: colors.tint, shadowColor: colors.tint }]]}
            onPress={() => setActiveTab("progressions")}
          >
            <List size={16} color={activeTab === "progressions" ? "#fff" : colors.textSecondary} />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "progressions" && styles.tabTextActive]}>Progressions</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, { backgroundColor: colors.surface }, activeTab === "circleOfFifths" && [styles.tabBtnActive, { backgroundColor: colors.tint, shadowColor: colors.tint }]]}
            onPress={() => setActiveTab("circleOfFifths")}
          >
            <Circle size={16} color={activeTab === "circleOfFifths" ? "#fff" : colors.textSecondary} />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "circleOfFifths" && styles.tabTextActive]}>Circle of 5ths</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "scales" && (
          <>
            {SCALE_CATEGORIES.map(cat => {
              const items = SCALES.filter(s => cat.ids.includes(s.id));
              return renderCategory(cat.title, items, renderScaleCard);
            })}
          </>
        )}
        
        {activeTab === "chords" && (
          <>
             {CHORD_CATEGORIES.map(cat => {
              const items = CHORDS.filter(c => cat.ids.includes(c.id));
              return renderCategory(cat.title, items, renderChordCard);
            })}
          </>
        )}

        {activeTab === "progressions" && PROGRESSIONS.map(renderProgressionCard)}
        {activeTab === "circleOfFifths" && renderCircleOfFifths()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Search Bar
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  // Tabs
  tabScrollWrapper: {
    marginBottom: 16,
  },
  tabContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
  },
  tabBtn: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
    gap: 8,
  },
  tabBtnActive: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#fff",
  },

  // Accordion Categories
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  categoryContent: {
    paddingTop: 4,
  },

  // Explainer Cards
  explainerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  explainerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
  },
  explainerDesc: {
    fontSize: 15,
    lineHeight: 24,
  },

  // Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Standard Cards
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
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardVibe: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
  cardDivider: {
    height: 1,
    marginVertical: 16,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
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
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  formulaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  badgeArrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Circle of Fifths Facts
  factTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
  },
  factDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
});
