import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HapticService from '../src/services/HapticService';
import PatternExplorer from "../src/components/PatternExplorer";
import { usePatternExplorerStore } from "../src/store/usePatternExplorerStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { DEFAULT_TUNINGS } from "../src/utils/tunings";
import { useTheme } from "../src/hooks/useTheme";
import { ThemeColors } from "../src/theme/colors";
import { tonalService } from "../src/services/tonalService";
import LabelWithTooltip from "../src/components/ui/LabelWithTooltip";
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOrientation } from "../src/hooks/useOrientation";

const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SimplePicker = ({ label, value, options, onSelect, colors, tooltip, tooltipTitle }: { label: string, value: string, options: {label: string, value: string}[], onSelect: (v: string) => void, colors: ThemeColors, tooltip?: string, tooltipTitle?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || value;
  
  return (
    <View style={styles.pickerWrapper}>
      <LabelWithTooltip label={label} tooltip={tooltip} tooltipTitle={tooltipTitle} />
      <Pressable style={[styles.pickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { HapticService.medium(); setIsOpen(true); }}>
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
                    HapticService.medium();
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

const ChordResultItem = ({ chord, colors }: { chord: string, colors: ThemeColors }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} onPress={() => setExpanded(!expanded)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.tint, fontSize: 16, fontWeight: 'bold' }}>{chord}</Text>
        <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
      </View>
      {expanded && (
        <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 14 }}>Notes: <Text style={{ color: colors.textSecondary }}>{tonalService.getChordNotes(chord).join(', ')}</Text></Text>
          <Text style={{ color: colors.text, fontSize: 14, marginTop: 4 }}>Intervals: <Text style={{ color: colors.textSecondary }}>{tonalService.getChordIntervals(chord).join(', ')}</Text></Text>
        </View>
      )}
    </Pressable>
  );
};

const ScaleResultItem = ({ scaleMatch, colors }: { scaleMatch: any, colors: ThemeColors }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} onPress={() => setExpanded(!expanded)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.tint, fontSize: 16, fontWeight: 'bold' }}>{scaleMatch.scale}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{Math.round(scaleMatch.percentage)}% Match</Text>
          <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </View>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
        Contains {scaleMatch.matchCount} of {scaleMatch.totalNotes} selected notes ({scaleMatch.scaleLength} notes total)
      </Text>
      {expanded && scaleMatch.notes && scaleMatch.intervals && (
        <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 14 }}>Notes: <Text style={{ color: colors.textSecondary }}>{scaleMatch.notes.join(', ')}</Text></Text>
          <Text style={{ color: colors.text, fontSize: 14, marginTop: 4 }}>Intervals: <Text style={{ color: colors.textSecondary }}>{scaleMatch.intervals.join(', ')}</Text></Text>
        </View>
      )}
    </Pressable>
  );
};

export default function PatternExplorerScreen() {
  const {
    layoutMode,
    activeTuningId,
    globalToggles,
    fretOverrides,
    disabledStrings,
    triadRoot,
    setLayoutMode,
    setActiveTuningId,
    setTriadRoot,
    applyTriad,
    toggleGlobalNote,
    toggleString,
    clearAll,
    localPlaybackEnabled,
    setLocalPlaybackEnabled,
  } = usePatternExplorerStore();

  const { customTunings, accidentalPreference, notePlaybackEnabled } = useSettingsStore();
  const { colors } = useTheme();
  const orientation = useOrientation();
  const isLandscape = orientation === "landscape";
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isStringsExpanded, setIsStringsExpanded] = useState(false);
  const [isTriadsExpanded, setIsTriadsExpanded] = useState(false);
  const [isIdentifyModalOpen, setIsIdentifyModalOpen] = useState(false);
  const [identifiedNotes, setIdentifiedNotes] = useState<string[]>([]);
  const [selectedRoot, setSelectedRoot] = useState<string>("");
  const [isChordsExpanded, setIsChordsExpanded] = useState(false);
  const [isScalesExpanded, setIsScalesExpanded] = useState(true);

  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const tuning = allTunings.find(t => t.id === activeTuningId) || allTunings[0];
  const notes = accidentalPreference === "flat" ? NOTES_FLAT : NOTES_SHARP;

  const isPlaybackActive = localPlaybackEnabled !== null ? localPlaybackEnabled : notePlaybackEnabled;

  const handleApplyTriad = (suffix: string) => {
    HapticService.medium();
    const triadNotes = tonalService.getChordNotes(`${triadRoot}${suffix}`);
    const normalizedNotes = triadNotes.map(n => {
      const chroma = tonalService.getChroma(n);
      if (chroma === undefined) return n;
      return accidentalPreference === "flat" ? NOTES_FLAT[chroma] : NOTES_SHARP[chroma];
    });
    applyTriad(normalizedNotes);
  };

  const handleIdentify = () => {
    HapticService.medium();
    
    const noteCounts: Record<string, number> = {};

    for (let strIdx = 0; strIdx < tuning.notes.length; strIdx++) {
      if (disabledStrings.includes(strIdx)) continue;
      
      const stringPitch = tuning.notes[strIdx];
      
      for (let fretNum = 0; fretNum <= 22; fretNum++) {
        const fretPitch = tonalService.transpose(stringPitch, tonalService.getIntervalFromSemitones(fretNum));
        const chroma = tonalService.getChroma(fretPitch);
        if (chroma === undefined) continue;
        
        const pitchClass = accidentalPreference === "flat" ? NOTES_FLAT[chroma] : NOTES_SHARP[chroma];
        
        const key = `${strIdx}-${fretNum}-${pitchClass}`;
        const isActive = fretOverrides[key] !== undefined ? fretOverrides[key] : !!globalToggles[pitchClass];
        
        if (isActive) {
          noteCounts[pitchClass] = (noteCounts[pitchClass] || 0) + 1;
        }
      }
    }
    
    const uniqueNotes = Object.keys(noteCounts);
    if (uniqueNotes.length < 2) {
      Alert.alert(
        "Select Notes",
        "Please select at least 2 distinct notes on the fretboard to identify patterns."
      );
      return;
    }
    
    let maxCount = 0;
    let defaultRoot = uniqueNotes[0];
    uniqueNotes.forEach(note => {
      if (noteCounts[note] > maxCount) {
        maxCount = noteCounts[note];
        defaultRoot = note;
      }
    });

    const reorderedNotes = [defaultRoot, ...uniqueNotes.filter(n => n !== defaultRoot)];
    const initialChords = tonalService.detectChords(reorderedNotes);
    const hasExactChord = initialChords.length > 0;
    const noteCount = uniqueNotes.length;

    if ((noteCount >= 2 && noteCount <= 3) || hasExactChord) {
      setIsChordsExpanded(true);
      setIsScalesExpanded(false);
    } else {
      setIsChordsExpanded(false);
      setIsScalesExpanded(true);
    }

    setIdentifiedNotes(uniqueNotes);
    setSelectedRoot(defaultRoot);
    setIsIdentifyModalOpen(true);
  };

  const renderMenuControls = () => (
    <ScrollView style={styles.menuScroll}>
      <View style={styles.menuContent}>
        
        {/* Layout Toggle */}
        <View style={styles.controlRow}>
          <LabelWithTooltip 
            label="Fretboard Mode" 
          />
          <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
            <Pressable 
              style={[styles.segmentBtn, layoutMode === "horizontal" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
              onPress={() => {
                HapticService.medium();
                setLayoutMode("horizontal");
              }}
            >
              <Text style={[styles.segmentText, { color: colors.textSecondary }, layoutMode === "horizontal" && [styles.segmentTextActive, { color: colors.tint }]]}>Horizontal</Text>
            </Pressable>
            <Pressable 
              style={[styles.segmentBtn, layoutMode === "fullscreen" && [styles.segmentBtnActive, { backgroundColor: colors.card }]]}
              onPress={() => {
                HapticService.medium();
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
            tooltip="Select the tuning for the instrument to update the fretboard notes."
            value={activeTuningId}
            options={allTunings.map(t => ({ label: t.name, value: t.id }))}
            onSelect={setActiveTuningId}
            colors={colors}
          />
        </View>

        {/* Note Toggles Grid */}
        <View style={styles.controlRow}>
          <View style={styles.headerRow}>
             <LabelWithTooltip label="Toggle Notes" />
             <View style={{ flexDirection: 'row', gap: 12 }}>
               <Pressable onPress={handleIdentify}>
                 <Text style={[styles.clearBtnText, { color: colors.tint }]}>Identify</Text>
               </Pressable>
               <Pressable onPress={() => { HapticService.medium(); clearAll(); }}>
                 <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear All</Text>
               </Pressable>
             </View>
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
                    HapticService.light();
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
          <View style={styles.headerRow}>
             <LabelWithTooltip label="Chord Triads" tooltip="Quickly highlight all notes belonging to a specific chord triad." />
             <Pressable onPress={() => setIsTriadsExpanded(!isTriadsExpanded)} hitSlop={10}>
               <Text style={{ color: colors.textSecondary, fontWeight: "bold", paddingHorizontal: 8 }}>{isTriadsExpanded ? "▲" : "▼"}</Text>
             </Pressable>
          </View>
          
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
          <View style={styles.headerRow}>
             <LabelWithTooltip label="Visible Strings" />
             <Pressable onPress={() => setIsStringsExpanded(!isStringsExpanded)} hitSlop={10}>
               <Text style={{ color: colors.textSecondary, fontWeight: "bold", paddingHorizontal: 8 }}>{isStringsExpanded ? "▲" : "▼"}</Text>
             </Pressable>
          </View>
          
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
                      HapticService.light();
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

  const renderIdentifyModal = () => {
    if (!isIdentifyModalOpen) return null;
    const reorderedNotes = selectedRoot ? [selectedRoot, ...identifiedNotes.filter(n => n !== selectedRoot)] : identifiedNotes;
    const detectedChords = tonalService.detectChords(reorderedNotes);
    const detectedScales = tonalService.getCloseScales(identifiedNotes, selectedRoot);
    
    const commonScales = detectedScales.filter((s: any) => s.isCommon);
    const otherScales = detectedScales.filter((s: any) => !s.isCommon);

    return (
      <Modal visible={isIdentifyModalOpen} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsIdentifyModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1, height: '80%' }]} onPress={e => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Identify Notes</Text>
              <Pressable onPress={() => setIsIdentifyModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Selected Notes:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {identifiedNotes.map(n => (
                    <View key={n} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>{n}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 16, zIndex: 10 }}>
                <SimplePicker 
                  label="Assumed Root"
                  value={selectedRoot}
                  options={identifiedNotes.map(n => ({ label: n, value: n }))}
                  onSelect={setSelectedRoot}
                  colors={colors}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Pressable onPress={() => setIsChordsExpanded(!isChordsExpanded)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isChordsExpanded ? 12 : 0 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Detected Chords</Text>
                  <MaterialCommunityIcons name={isChordsExpanded ? "chevron-up" : "chevron-down"} size={24} color={colors.textSecondary} />
                </Pressable>
                
                {isChordsExpanded && (
                  detectedChords.length > 0 ? (
                    detectedChords.map((chord, idx) => (
                      <ChordResultItem key={`c-${idx}`} chord={chord} colors={colors} />
                    ))
                  ) : (
                    <Text style={{ color: colors.textSecondary }}>No exact chords detected.</Text>
                  )
                )}
              </View>

              <View style={{ paddingBottom: 32 }}>
                <Pressable onPress={() => setIsScalesExpanded(!isScalesExpanded)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isScalesExpanded ? 12 : 0 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Detected Scales (Root: {selectedRoot})</Text>
                  <MaterialCommunityIcons name={isScalesExpanded ? "chevron-up" : "chevron-down"} size={24} color={colors.textSecondary} />
                </Pressable>
                
                {isScalesExpanded && (
                  detectedScales.length > 0 ? (
                    <>
                      {commonScales.length > 0 && (
                        <View style={{ marginBottom: 16 }}>
                          <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Common Scales</Text>
                          {commonScales.map((scaleMatch, idx) => (
                            <ScaleResultItem key={`cs-${idx}`} scaleMatch={scaleMatch} colors={colors} />
                          ))}
                        </View>
                      )}
                      {otherScales.length > 0 && (
                        <View>
                          <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Other Scales</Text>
                          {otherScales.map((scaleMatch, idx) => (
                            <ScaleResultItem key={`os-${idx}`} scaleMatch={scaleMatch} colors={colors} />
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={{ color: colors.textSecondary }}>No close scales detected.</Text>
                  )
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  if (layoutMode === "fullscreen" || isLandscape) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
        <Stack.Screen 
          options={{
            headerRight: () => (
              <Pressable 
                style={{ padding: 8, marginRight: 4 }}
                onPress={() => {
                  HapticService.medium();
                  setLocalPlaybackEnabled(!isPlaybackActive);
                }}
              >
                <MaterialCommunityIcons 
                  name={isPlaybackActive ? "ear-hearing" : "ear-hearing-off"} 
                  size={26} 
                  color={isPlaybackActive ? colors.tint : colors.textSecondary} 
                />
              </Pressable>
            )
          }} 
        />
        <View style={styles.fretboardContainer}>
          <PatternExplorer isPlaybackActive={isPlaybackActive} />
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
        {renderIdentifyModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <Pressable 
              style={{ padding: 8, marginRight: 4 }}
              onPress={() => {
                HapticService.medium();
                setLocalPlaybackEnabled(!isPlaybackActive);
              }}
            >
              <MaterialCommunityIcons 
                name={isPlaybackActive ? "ear-hearing" : "ear-hearing-off"} 
                size={26} 
                color={isPlaybackActive ? colors.tint : colors.textSecondary} 
              />
            </Pressable>
          )
        }} 
      />
      <View style={styles.horizontalFretboardArea}>
        <PatternExplorer isPlaybackActive={isPlaybackActive} />
      </View>
      <View style={[styles.horizontalMenuArea, { backgroundColor: colors.background, shadowColor: colors.text }]}>
        {renderMenuControls()}
      </View>
      {renderIdentifyModal()}
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowOpacity: 0.05,
    shadowRadius: 15,
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  // Note Grid
  noteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  noteBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24, // perfect circle
    borderWidth: 1,
  },
  noteBtnActive: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "65%",
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
