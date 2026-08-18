import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, Switch } from "react-native";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useToneStore } from "../src/store/useToneStore";
import { Tuning, NoteDisplayPreference, ColorPreference, InstrumentPreference, ThemePreference, AccidentalPreference, HapticPreference, NoteDurationPreference } from "../src/types/settings";
import { useTheme } from "../src/hooks/useTheme";
import HapticService from "../src/services/HapticService";
import { Ionicons } from "@expo/vector-icons";
import LabelWithTooltip from "../src/components/ui/LabelWithTooltip";

type Accidental = "flat" | "natural" | "sharp";

interface ParsedNote {
  note: string;
  accidental: Accidental;
  octave: string;
}

const NOTE_OPTIONS = ["A", "B", "C", "D", "E", "F", "G"];
const STANDARD_TUNING = ["E2", "A2", "D3", "G3", "B3", "E4"];

// Parse string like "E2" or "F#3" or "Bb2" into ParsedNote
function parseNoteString(noteStr: string): ParsedNote {
  const match = noteStr.match(/^([A-G])([b#]?)(-?\d+)$/);
  if (!match) return { note: "E", accidental: "natural", octave: "2" };
  const [, note, acc, octave] = match;
  return {
    note,
    accidental: acc === "b" ? "flat" : acc === "#" ? "sharp" : "natural",
    octave,
  };
}

// Convert ParsedNote back to string like "F#3"
function formatNoteString(parsed: ParsedNote): string {
  const accMap = { flat: "b", natural: "", sharp: "#" };
  return `${parsed.note}${accMap[parsed.accidental]}${parsed.octave}`;
}

interface DropdownOption {
  label: string;
  value: string;
}

const CustomDropdown = ({ 
  valueLabel, 
  title, 
  options, 
  mode = "list", 
  onSelect 
}: { 
  valueLabel: string;
  title: string;
  options: DropdownOption[];
  mode?: "list" | "grid";
  onSelect: (val: string) => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();
  return (
    <>
      <Pressable style={[styles.dropdownBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setIsOpen(true)}>
        <Text style={[styles.dropdownBtnText, { color: colors.text }]}>{valueLabel}</Text>
        <Text style={[styles.dropdownBtnIcon, { color: colors.textSecondary }]}>▼</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={mode === "grid" ? styles.gridOptions : undefined}>
                {options.map((opt) => (
                  <Pressable 
                    key={opt.value} 
                    style={[
                      styles.modalOption, 
                      mode === "grid" && styles.gridOption,
                      { borderBottomColor: colors.border }
                    ]}
                    onPress={() => {
                      onSelect(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default function SettingsScreen() {
  const {
    noteDisplayPreference,
    colorPreference,
    accidentalPreference,
    instrumentPreference,
    themePreference,
    hapticPreference,
    noteDurationPreference,
    isLeftHanded,
    customTunings,
    setNoteDisplayPreference,
    setColorPreference,
    setAccidentalPreference,
    setInstrumentPreference,
    setThemePreference,
    setHapticPreference,
    setNoteDurationPreference,
    setIsLeftHanded,
    setNotePlaybackEnabled,
    metronomeGlobalPlayback,
    setMetronomeGlobalPlayback,
    drumMachineGlobalPlayback,
    setDrumMachineGlobalPlayback,
    backgroundAudioEnabled,
    setBackgroundAudioEnabled,
    saveCustomTuning,
    deleteCustomTuning,
    notePlaybackEnabled,
  } = useSettingsStore();

  const { playNote } = useToneStore();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTuningName, setNewTuningName] = useState("");
  const [newTuningNotes, setNewTuningNotes] = useState<ParsedNote[]>(
    STANDARD_TUNING.map(parseNoteString)
  );

  const updateStringNote = (index: number, field: keyof ParsedNote, val: string) => {
    const updated = [...newTuningNotes];
    updated[index] = { ...updated[index], [field]: val };
    setNewTuningNotes(updated);
  };

  const handleSaveTuning = () => {
    if (!newTuningName.trim()) {
      Alert.alert("Error", "Tuning name cannot be empty");
      return;
    }
    const newTuning: Tuning = {
      id: `custom-${Date.now()}`,
      name: newTuningName,
      notes: newTuningNotes.map(formatNoteString),
      isCustom: true,
    };
    saveCustomTuning(newTuning);
    setModalVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* General Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="settings-outline" size={24} color={colors.text} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          </View>
        </View>
        
        <LabelWithTooltip
          label="App Theme"
        />
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          {(["system", "light", "dark"] as ThemePreference[]).map((pref) => (
            <Pressable
              key={pref}
              style={[
                styles.segmentBtn, 
                themePreference === pref && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
              ]}
              onPress={() => setThemePreference(pref)}
            >
              <Text style={[
                styles.segmentText, 
                { color: colors.textSecondary },
                themePreference === pref && [styles.segmentTextActive, { color: colors.tint }]
              ]}>
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <LabelWithTooltip
            label="Haptic Feedback"
            tooltip="Adjust the strength of vibrations when interacting with UI elements and fretboard."
            tooltipTitle="Haptic Feedback"
          />
        </View>
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          {(["off", "light", "medium", "heavy"] as HapticPreference[]).map((pref) => (
            <Pressable
              key={pref}
              style={[
                styles.segmentBtn, 
                hapticPreference === pref && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
              ]}
              onPress={() => {
                setHapticPreference(pref);
                if (pref === 'light') HapticService.light();
                if (pref === 'medium') HapticService.medium();
                if (pref === 'heavy') HapticService.heavy();
              }}
            >
              <Text style={[
                styles.segmentText, 
                { color: colors.textSecondary },
                hapticPreference === pref && [styles.segmentTextActive, { color: colors.tint }]
              ]}>
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <LabelWithTooltip
            label="Orientation"
          />
        </View>
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          <Pressable
            style={[
              styles.segmentBtn, 
              !isLeftHanded && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
            ]}
            onPress={() => setIsLeftHanded(false)}
          >
            <Text style={[
              styles.segmentText, 
              { color: colors.textSecondary },
              !isLeftHanded && [styles.segmentTextActive, { color: colors.tint }]
            ]}>
              Right-Handed
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentBtn, 
              isLeftHanded && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
            ]}
            onPress={() => setIsLeftHanded(true)}
          >
            <Text style={[
              styles.segmentText, 
              { color: colors.textSecondary },
              isLeftHanded && [styles.segmentTextActive, { color: colors.tint }]
            ]}>
              Left-Handed
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Display & Fretboard */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="eye-outline" size={24} color={colors.text} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Display</Text>
          </View>
        </View>

        <LabelWithTooltip
          label="Note Notation"
        />
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          {(["letter", "interval", "both"] as NoteDisplayPreference[]).map((pref) => (
            <Pressable
              key={pref}
              style={[
                styles.segmentBtn, 
                noteDisplayPreference === pref && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
              ]}
              onPress={() => setNoteDisplayPreference(pref)}
            >
              <Text style={[
                styles.segmentText, 
                { color: colors.textSecondary },
                noteDisplayPreference === pref && [styles.segmentTextActive, { color: colors.tint }]
              ]}>
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <LabelWithTooltip
            label="Accidentals"
            tooltip="Choose whether to display sharp (♯) or flat (♭) symbols for non-natural notes."
            tooltipTitle="Accidentals"
          />
        </View>
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          {(["sharp", "flat"] as AccidentalPreference[]).map((pref) => (
            <Pressable
              key={pref}
              style={[
                styles.segmentBtn, 
                accidentalPreference === pref && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
              ]}
              onPress={() => setAccidentalPreference(pref)}
            >
              <Text style={[
                styles.segmentText, 
                { color: colors.textSecondary },
                accidentalPreference === pref && [styles.segmentTextActive, { color: colors.tint }]
              ]}>
                {pref === "sharp" ? "Sharps (♯)" : "Flats (♭)"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <LabelWithTooltip
            label="Color Coding"
            tooltip="Choose how notes are colored. Interval colors change based on the selected scale/chord root. Static colors are always the same for each note."
            tooltipTitle="Color Coding"
          />
        </View>
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          {(["interval", "static"] as ColorPreference[]).map((pref) => (
            <Pressable
              key={pref}
              style={[
                styles.segmentBtn, 
                colorPreference === pref && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
              ]}
              onPress={() => setColorPreference(pref)}
            >
              <Text style={[
                styles.segmentText, 
                { color: colors.textSecondary },
                colorPreference === pref && [styles.segmentTextActive, { color: colors.tint }]
              ]}>
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
        
      {/* Audio & Playback */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="musical-notes-outline" size={24} color={colors.text} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Audio</Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <LabelWithTooltip
            label="Fretboard Note Playback"
          />
          <Switch 
            value={notePlaybackEnabled}
            onValueChange={setNotePlaybackEnabled}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>

        <View style={styles.toggleRow}>
          <LabelWithTooltip
            label="Metronome Global Playback"
            tooltip="Allow the metronome to continue playing when you navigate away from the metronome view."
            tooltipTitle="Metronome Global Playback"
          />
          <Switch 
            value={metronomeGlobalPlayback}
            onValueChange={setMetronomeGlobalPlayback}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>

        <View style={styles.toggleRow}>
          <LabelWithTooltip
            label="Drum Machine Global Playback"
            tooltip="Allow the drum machine to continue playing when you navigate away from the drum machine view."
            tooltipTitle="Drum Machine Global Playback"
          />
          <Switch 
            value={drumMachineGlobalPlayback}
            onValueChange={setDrumMachineGlobalPlayback}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>

        <View style={styles.toggleRow}>
          <LabelWithTooltip
            label="Background Audio"
            tooltip="Allow audio to continue playing when the app is minimized or the screen is locked."
            tooltipTitle="Background Audio"
          />
          <Switch 
            value={backgroundAudioEnabled}
            onValueChange={setBackgroundAudioEnabled}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <LabelWithTooltip
            label="Playback Instrument"
          />
        </View>
        <CustomDropdown 
          title="Select Instrument"
          valueLabel={
            {
              "acoustic_guitar_nylon": "Nylon Acoustic",
              "acoustic_guitar_steel": "Steel Acoustic",
              "electric_guitar_clean": "Clean Electric",
              "electric_bass_finger": "Finger Bass"
            }[instrumentPreference] || "Nylon Acoustic"
          }
          options={[
            { label: "Nylon Acoustic", value: "acoustic_guitar_nylon" },
            { label: "Steel Acoustic", value: "acoustic_guitar_steel" },
            { label: "Clean Electric", value: "electric_guitar_clean" },
            { label: "Finger Bass", value: "electric_bass_finger" }
          ]}
          onSelect={(val) => setInstrumentPreference(val as InstrumentPreference)}
        />

        <View style={{ marginTop: 16 }}>
          <LabelWithTooltip
            label="Note Ring Duration"
            tooltip="Adjust how long a note continues to sound after being tapped."
            tooltipTitle="Note Ring Duration"
          />
        </View>
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg }]}>
          {(["extra_short", "short", "normal", "long", "extra_long"] as NoteDurationPreference[]).map((pref) => {
            const labelMap: Record<string, string> = {
              "extra_short": "XS",
              "short": "Short",
              "normal": "Normal",
              "long": "Long",
              "extra_long": "XL"
            };
            return (
              <Pressable
                key={pref}
                style={[
                  styles.segmentBtn, 
                  noteDurationPreference === pref && [styles.segmentBtnActive, { backgroundColor: colors.surface }]
                ]}
                onPress={() => setNoteDurationPreference(pref)}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: colors.textSecondary },
                  noteDurationPreference === pref && [styles.segmentTextActive, { color: colors.tint }]
                ]}>
                  {labelMap[pref]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Custom Tunings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="options-outline" size={24} color={colors.text} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tunings</Text>
          </View>
          <Pressable 
            style={[styles.addBtn, { backgroundColor: colors.tint }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>

        {customTunings.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No custom tunings added yet.</Text>
        ) : (
          <View style={styles.tuningList}>
            {customTunings.map((tuning) => (
              <View key={tuning.id} style={[styles.tuningItem, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.tuningName, { color: colors.text }]}>{tuning.name}</Text>
                  <Text style={[styles.tuningNotes, { color: colors.textMuted }]}>{tuning.notes.join(" - ")}</Text>
                </View>
                <Pressable 
                  style={[styles.deleteBtn, { backgroundColor: colors.danger + "20" }]}
                  onPress={() => deleteCustomTuning(tuning.id)}
                >
                  <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add Custom Tuning Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Custom Tuning</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <LabelWithTooltip
                label="Tuning Name"
                tooltip="Give your custom tuning a memorable name."
                tooltipTitle="Tuning Name"
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={newTuningName}
                onChangeText={setNewTuningName}
                placeholder="e.g. Drop D"
                placeholderTextColor={colors.textMuted}
              />

              <View style={{ marginTop: 16 }}>
                <LabelWithTooltip
                  label="Strings (Highest to Lowest Pitch)"
                  tooltip="Define the tuning for each string. String 1 is the thinnest string (highest pitch)."
                  tooltipTitle="Strings Configuration"
                />
              </View>
              
              <View style={styles.stringsContainer}>
                {[...newTuningNotes].reverse().map((noteObj, revIdx) => {
                  const idx = newTuningNotes.length - 1 - revIdx;
                  return (
                    <View key={idx} style={[styles.stringRow, { borderBottomColor: colors.border }]}>
                      <View style={styles.stringHeader}>
                        <Text style={[styles.stringLabel, { color: colors.text }]}>String {revIdx + 1}</Text>
                        <Pressable style={styles.playBtn} onPress={() => playNote(formatNoteString(noteObj))}>
                          <Text style={styles.playBtnText}>▶</Text>
                        </Pressable>
                      </View>
                    
                    <View style={styles.stringPickers}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <CustomDropdown
                          title="Note"
                          valueLabel={noteObj.note}
                          options={NOTE_OPTIONS.map(n => ({ label: n, value: n }))}
                          onSelect={(val) => updateStringNote(idx, "note", val)}
                        />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <CustomDropdown
                          title="Accidental"
                          valueLabel={noteObj.accidental === "natural" ? "♮" : noteObj.accidental === "flat" ? "♭" : "♯"}
                          options={[
                            { label: "Natural (♮)", value: "natural" },
                            { label: "Flat (♭)", value: "flat" },
                            { label: "Sharp (♯)", value: "sharp" }
                          ]}
                          onSelect={(val) => updateStringNote(idx, "accidental", val)}
                        />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <CustomDropdown
                          title="Octave"
                          valueLabel={noteObj.octave}
                          options={[1, 2, 3, 4, 5].map(o => ({ label: o.toString(), value: o.toString() }))}
                          onSelect={(val) => updateStringNote(idx, "octave", val)}
                        />
                      </View>
                      <Pressable 
                        style={styles.removeStringBtn}
                        onPress={() => {
                          const newNotes = [...newTuningNotes];
                          newNotes.splice(idx, 1);
                          setNewTuningNotes(newNotes);
                        }}
                      >
                        <Text style={[styles.removeStringIcon, { color: colors.danger }]}>✕</Text>
                      </Pressable>
                    </View>
                  </View>
                )})}
              </View>

              <Pressable 
                style={[styles.addStringBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setNewTuningNotes([{ note: "E", accidental: "natural", octave: "2" }, ...newTuningNotes])}
              >
                <Text style={[styles.addStringText, { color: colors.tint }]}>+ Add String</Text>
              </Pressable>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, { backgroundColor: colors.tint }]} onPress={handleSaveTuning}>
                <Text style={styles.saveBtnText}>Save Tuning</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  
  // Segmented Control
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 2,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentBtnActive: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  segmentTextActive: {
  },

  // Dropdown UI
  dropdownBtn: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownBtnText: {
    fontSize: 16,
  },
  dropdownBtnIcon: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalClose: {
    fontSize: 20,
    padding: 4,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
  gridOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  gridOption: {
    width: "33%",
    alignItems: "center",
    borderBottomWidth: 0,
    padding: 12,
  },

  // Custom Tunings
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },
  tuningList: {
    marginTop: 8,
  },
  tuningItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tuningName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  tuningNotes: {
    fontSize: 14,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Add Tuning Form
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    marginBottom: 16,
  },
  stringsContainer: {
    marginBottom: 16,
  },
  stringRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  stringHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stringLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  playBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  stringPickers: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeStringBtn: {
    padding: 8,
  },
  removeStringIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addStringBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  addStringText: {
    fontWeight: "bold",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: 12,
    marginRight: 16,
  },
  cancelBtnText: {
    fontSize: 16,
  },
  saveBtn: {
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
