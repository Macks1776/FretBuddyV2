import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import PatternExplorer from "../src/components/PatternExplorer";
import { usePatternExplorerStore } from "../src/store/usePatternExplorerStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { DEFAULT_TUNINGS } from "../src/utils/tunings";
import { useTheme } from "../src/hooks/useTheme";
import { ThemeColors } from "../src/theme/colors";
import { tonalService } from "../src/services/tonalService";

const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SimplePicker = ({ label, value, options, onSelect, colors }: { label: string, value: string, options: {label: string, value: string}[], onSelect: (v: string) => void, colors: ThemeColors }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || value;
  
  return (
    <View style={styles.pickerWrapper}>
      <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable style={[styles.pickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsOpen(true); }}>
        <Text style={[styles.pickerBtnText, { color: colors.text }]}>{selectedLabel} ▾</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select {label}</Text>
            <ScrollView style={styles.modalList}>
              {options.map(opt => (
                <Pressable 
                  key={opt.value} 
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => { 
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onSelect(opt.value); 
                    setIsOpen(false); 
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.text }, opt.value === value && [styles.modalItemTextActive, { color: colors.tint }]]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default function PatternExplorerScreen() {
  const {
    layoutMode,
    activeTuningId,
    globalToggles,
    disabledStrings,
    triadRoot,
    setLayoutMode,
    setActiveTuningId,
    setTriadRoot,
    applyTriad,
    toggleGlobalNote,
    toggleString,
    clearAll,
  } = usePatternExplorerStore();

  const { customTunings, accidentalPreference } = useSettingsStore();
  const { colors } = useTheme();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isStringsExpanded, setIsStringsExpanded] = useState(false);
  const [isTriadsExpanded, setIsTriadsExpanded] = useState(false);

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const tuning = allTunings.find(t => t.id === activeTuningId) || allTunings[0];
  const notes = accidentalPreference === "flat" ? NOTES_FLAT : NOTES_SHARP;

  const handleApplyTriad = (suffix: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const triadNotes = tonalService.getChordNotes(`${triadRoot}${suffix}`);
    const normalizedNotes = triadNotes.map(n => {
      const chroma = tonalService.getChroma(n);
      if (chroma === undefined) return n;
      return accidentalPreference === "flat" ? NOTES_FLAT[chroma] : NOTES_SHARP[chroma];
    });
    applyTriad(normalizedNotes);
  };

  const renderMenuControls = () => (
    <ScrollView style={styles.menuScroll}>
      <View style={styles.menuContent}>
        
        {/* Layout Toggle */}
        <View style={styles.controlRow}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Fretboard Mode</Text>
          <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
            <Pressable 
              style={[styles.segmentBtn, layoutMode === "horizontal" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setLayoutMode("horizontal");
              }}
            >
              <Text style={[styles.segmentText, { color: colors.textSecondary }, layoutMode === "horizontal" && [styles.segmentTextActive, { color: colors.tint }]]}>Horizontal</Text>
            </Pressable>
            <Pressable 
              style={[styles.segmentBtn, layoutMode === "fullscreen" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setLayoutMode("fullscreen");
              }}
            >
              <Text style={[styles.segmentText, { color: colors.textSecondary }, layoutMode === "fullscreen" && [styles.segmentTextActive, { color: colors.tint }]]}>Fullscreen</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.controlRow}>
          <SimplePicker 
            label="Tuning"
            value={activeTuningId}
            options={allTunings.map(t => ({ label: t.name, value: t.id }))}
            onSelect={setActiveTuningId}
            colors={colors}
          />
        </View>

        {/* Note Toggles Grid */}
        <View style={styles.controlRow}>
          <View style={styles.headerRow}>
             <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Toggle Notes</Text>
             <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); clearAll(); }}>
               <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear All</Text>
             </Pressable>
          </View>
          
          <View style={styles.noteGrid}>
            {notes.map(note => {
              const isActive = !!globalToggles[note];
              return (
                <Pressable
                  key={note}
                  style={[
                    styles.noteBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isActive && [styles.noteBtnActive, { backgroundColor: colors.tint, borderColor: colors.tint }]
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleGlobalNote(note);
                  }}
                >
                  <Text style={[
                    styles.noteBtnText,
                    { color: colors.text },
                    isActive && styles.noteBtnTextActive
                  ]}>
                    {note}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Triad Toggles */}
        <View style={styles.controlRow}>
          <Pressable 
            style={styles.headerRow}
            onPress={() => setIsTriadsExpanded(!isTriadsExpanded)}
          >
             <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Chord Triads</Text>
             <Text style={{ color: colors.textSecondary, fontWeight: "bold" }}>{isTriadsExpanded ? "▲" : "▼"}</Text>
          </Pressable>
          
          {isTriadsExpanded && (
            <View style={styles.triadContainer}>
              <View style={{ marginBottom: 12 }}>
                <SimplePicker 
                  label="Triad Root"
                  value={triadRoot}
                  options={notes.map(n => ({ label: n, value: n }))}
                  onSelect={setTriadRoot}
                  colors={colors}
                />
              </View>
              <View style={styles.stringGrid}>
                {[
                  { label: "Major", suffix: "M" },
                  { label: "Minor", suffix: "m" },
                  { label: "Major 7", suffix: "maj7" },
                  { label: "Minor 7", suffix: "m7" },
                  { label: "Diminished", suffix: "dim" },
                  { label: "Augmented", suffix: "aug" },
                ].map(triad => (
                  <Pressable
                    key={triad.suffix}
                    style={[styles.stringBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleApplyTriad(triad.suffix)}
                  >
                    <Text style={[styles.stringBtnText, { color: colors.text }]}>{triad.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* String Toggles */}
        <View style={styles.controlRow}>
          <Pressable 
            style={styles.headerRow}
            onPress={() => setIsStringsExpanded(!isStringsExpanded)}
          >
             <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Visible Strings</Text>
             <Text style={{ color: colors.textSecondary, fontWeight: "bold" }}>{isStringsExpanded ? "▲" : "▼"}</Text>
          </Pressable>
          
          {isStringsExpanded && (
            <View style={styles.stringGrid}>
              {tuning.notes.map((note, idx) => {
                const isVisible = !disabledStrings.includes(idx);
                return (
                  <Pressable
                    key={`str-${idx}`}
                    style={[
                      styles.stringBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isVisible && [styles.stringBtnActive, { backgroundColor: colors.tint, borderColor: colors.tint }]
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleString(idx);
                    }}
                  >
                    <Text style={[
                      styles.stringBtnText,
                      { color: colors.text },
                      isVisible && styles.stringBtnTextActive
                    ]}>
                      String {idx + 1} ({note})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        
      </View>
    </ScrollView>
  );

  if (layoutMode === "fullscreen") {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
        <View style={styles.fretboardContainer}>
          <PatternExplorer />
        </View>

        <Pressable 
          style={[styles.floatingMenuBtn, { backgroundColor: colors.card, shadowColor: colors.text }]}
          onPress={() => setIsOverlayOpen(true)}
        >
          <Text style={[styles.floatingMenuText, { color: colors.text }]}>Controls</Text>
        </Pressable>

        <Modal visible={isOverlayOpen} animationType="slide" transparent>
          <View style={styles.overlayContainer}>
            <Pressable style={styles.overlayDismiss} onPress={() => setIsOverlayOpen(false)} />
            <View style={[styles.overlayMenu, { backgroundColor: colors.background }]}>
              <View style={[styles.overlayHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.overlayTitle, { color: colors.text }]}>Pattern Controls</Text>
                <Pressable onPress={() => setIsOverlayOpen(false)}>
                  <Text style={[styles.overlayDoneBtn, { color: colors.tint }]}>Done</Text>
                </Pressable>
              </View>
              {renderMenuControls()}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
      <View style={styles.horizontalFretboardArea}>
        <PatternExplorer />
      </View>
      <View style={[styles.horizontalMenuArea, { backgroundColor: colors.background, shadowColor: colors.text }]}>
        {renderMenuControls()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fretboardContainer: {
    flex: 1,
    paddingVertical: 20,
    justifyContent: "center",
  },
  horizontalFretboardArea: {
    height: 300,
  },
  horizontalMenuArea: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },

  // Menu Elements
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    padding: 20,
  },
  controlRow: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Note Grid
  noteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  noteBtn: {
    width: "22%", // 4 columns
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  noteBtnActive: {
    borderWidth: 1,
  },
  noteBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  noteBtnTextActive: {
    color: "#fff",
  },
  
  // String Toggles
  stringGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stringBtn: {
    width: "48%", // 2 columns
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  stringBtnActive: {
    borderWidth: 1,
  },
  stringBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  stringBtnTextActive: {
    color: "#fff",
  },
  
  triadContainer: {
    marginTop: 8,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    marginTop: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentBtnActive: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  segmentTextActive: {
  },

  // Picker
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pickerBtn: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalList: {
    marginBottom: 20,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 18,
  },
  modalItemTextActive: {
    fontWeight: "bold",
  },

  // Full Screen Overlay Controls
  floatingMenuBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  floatingMenuText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayDismiss: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  overlayMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "60%",
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  overlayDoneBtn: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
