import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { Scale, Chord, Note, Interval } from "@tonaljs/tonal";
import { useFretboardStore } from "../store/useFretboardStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useToneStore } from "../store/useToneStore";
import { DEFAULT_TUNINGS } from "../utils/tunings";

const TOTAL_FRETS = 22;
const FRET_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_MARKERS = [12, 24];

export default function Fretboard() {
  const { 
    layoutMode, activeTuningId,
    showScale, scaleRoot, targetScale,
    showChord, chordRoot, targetChord,
    chordProgression, activeProgressionIndex,
    hideNonScaleChordTones
  } = useFretboardStore();
  const { customTunings, noteDisplayPreference, colorPreference } = useSettingsStore();
  const { playNote } = useToneStore();

  const isVertical = layoutMode === "fullscreen";
  const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
  const tuning = allTunings.find(t => t.id === activeTuningId) || allTunings[0];
  const strings = isVertical ? tuning.notes : [...tuning.notes].reverse();

  // Data fetching with Chroma for enharmonic safety
  const scaleData = React.useMemo(() => {
    if (!showScale) return null;
    const r = Note.pitchClass(scaleRoot);
    const scaleName = targetScale.replace("_", " ");
    const scale = Scale.get(`${r} ${scaleName}`);
    return {
      root: r,
      rootChroma: Note.chroma(r),
      chromas: scale.notes.map(n => Note.chroma(n)),
      intervals: scale.intervals,
      notes: scale.notes.map(n => Note.pitchClass(n)),
    };
  }, [showScale, scaleRoot, targetScale]);

  const chordData = React.useMemo(() => {
    if (!showChord) return null;

    let rootToUse = chordRoot;
    let targetToUse = targetChord;

    if (chordProgression && chordProgression.length > 0) {
      const activeProg = chordProgression[activeProgressionIndex] || chordProgression[0];
      rootToUse = activeProg.root;
      targetToUse = activeProg.suffix;
    }

    const r = Note.pitchClass(rootToUse);
    const chordMap: Record<string, string> = {
      major: "M", minor: "m", diminished: "dim", augmented: "aug",
      major7: "maj7", minor7: "m7", dominant7: "7", sus2: "sus2", sus4: "sus4"
    };
    const suffix = chordMap[targetToUse] || targetToUse;
    const chord = Chord.get(`${r}${suffix}`);
    return {
      root: r,
      rootChroma: Note.chroma(r),
      chromas: chord.notes.map(n => Note.chroma(n)),
      intervals: chord.intervals,
      notes: chord.notes.map(n => Note.pitchClass(n)),
    };
  }, [showChord, chordRoot, targetChord, chordProgression, activeProgressionIndex]);

  const getNoteColor = (intervalStr: string, isRoot: boolean) => {
    if (colorPreference === "static") return isRoot ? "#e74c3c" : "#3498db";
    if (isRoot) return "#e74c3c";
    if (intervalStr.includes("3")) return "#f1c40f";
    if (intervalStr.includes("5")) return "#2ecc71";
    if (intervalStr.includes("7")) return "#9b59b6";
    return "#3498db";
  };

  const getNoteLabel = (displayNote: string, intervalStr: string) => {
    if (noteDisplayPreference === "letter") return displayNote;
    if (noteDisplayPreference === "interval") return intervalStr || displayNote;
    return intervalStr ? `${displayNote}\n${intervalStr}` : displayNote;
  };

  const getBadgeStyle = (fretChroma: number) => {
    const inScale = scaleData?.chromas.includes(fretChroma);
    const inChord = chordData?.chromas.includes(fretChroma);

    if (!inScale && !inChord) return null;
    
    // Hide chord tones that fall outside the active scale if requested
    if (hideNonScaleChordTones && inChord && !inScale) return null;

    let activeData = null;
    let targetIdx = -1;
    
    // Interval coloring: Relative to chord if chord is active. Else scale.
    if (showChord && inChord) {
      activeData = chordData;
      targetIdx = chordData!.chromas.indexOf(fretChroma);
    } else if (showScale && inScale) {
      activeData = scaleData;
      targetIdx = scaleData!.chromas.indexOf(fretChroma);
    }

    if (!activeData) return null;

    const intervalStr = activeData.intervals[targetIdx];
    const displayNote = activeData.notes[targetIdx];
    const isRoot = fretChroma === activeData.rootChroma;
    const baseColor = getNoteColor(intervalStr, isRoot);

    let bgColor = "transparent";
    let borderColor = "transparent";
    let borderWidth = 0;
    let textColor = "#fff";

    if (inScale && inChord) { // Collision
      bgColor = baseColor;
      borderColor = "#fff";
      borderWidth = 3;
      textColor = "#fff";
    } else if (inChord && !inScale) { // Chord Only
      bgColor = "#fff";
      borderColor = baseColor;
      borderWidth = 3;
      textColor = baseColor;
    } else if (inScale && !inChord) { // Scale Only
      bgColor = baseColor;
      borderColor = "transparent";
      borderWidth = 0;
      textColor = "#fff";
    }

    return {
      bgColor, borderColor, borderWidth, textColor,
      label: getNoteLabel(displayNote, intervalStr),
      inScale, inChord
    };
  };

  const fretsArray = Array.from({ length: TOTAL_FRETS + 1 }, (_, i) => i);

  // Render Horizontal
  if (!isVertical) {
    return (
      <View style={styles.horizontalWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.fretboardContainer}>
            {strings.map((openNote, strIdx) => {
              // String thickness (thickest for low E, thinnest for high E)
              // String index in standard reversed array: 0 is High E (thin), 5 is Low E (thick)
              const thickness = 1 + (strIdx * 0.8);
              
              return (
                <View key={`str-${strIdx}`} style={styles.stringRow}>
                  {/* The visible string line */}
                  <View style={[styles.stringLine, { height: thickness }]} />
                  
                  {fretsArray.map((fretNum) => {
                    const fretPitch = Note.transpose(openNote, Interval.fromSemitones(fretNum));
                    const fretChroma = Note.chroma(fretPitch);
                    const badge = getBadgeStyle(fretChroma);

                    return (
                      <View key={`fret-${strIdx}-${fretNum}`} style={[styles.fretCell, fretNum === 0 && styles.nutCell]}>
                        {/* Fret wire */}
                        {fretNum > 0 && <View style={styles.fretWire} />}

                        {/* Fret Markers */}
                        {strIdx === 2 && FRET_MARKERS.includes(fretNum) && (
                          <View style={styles.markerDot} />
                        )}
                        {(strIdx === 1 || strIdx === 4) && DOUBLE_MARKERS.includes(fretNum) && (
                          <View style={styles.markerDot} />
                        )}

                        {/* Playable Note Area */}
                        <Pressable 
                          style={styles.touchArea}
                          onPress={() => {
                            if (!showScale && !showChord || badge) {
                              playNote(fretPitch);
                            }
                          }}
                        >
                          {badge && (
                            <View style={[styles.noteBadge, { 
                              backgroundColor: badge.bgColor, 
                              borderColor: badge.borderColor, 
                              borderWidth: badge.borderWidth 
                            }]}>
                              <Text style={[styles.noteText, { color: badge.textColor }, noteDisplayPreference === "both" && styles.noteTextSmall]}>
                                {badge.label}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              );
            })}

            {/* Horizontal Fret Labels */}
            <View style={styles.horizontalLabelRow}>
              {fretsArray.map((fretNum) => (
                <View key={`label-${fretNum}`} style={styles.fretCell}>
                  {(FRET_MARKERS.includes(fretNum) || DOUBLE_MARKERS.includes(fretNum)) && (
                    <Text style={styles.fretLabelText}>{fretNum}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Render Vertical (Full Screen)
  return (
    <View style={styles.verticalWrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.fretboardVerticalContainer}>
          {fretsArray.map((fretNum) => {
            return (
              <View key={`v-fret-${fretNum}`} style={[styles.fretRow, fretNum === 0 && styles.vNutCell]}>
                {/* Fret wire */}
                {fretNum > 0 && <View style={styles.vFretWire} />}

                {/* Fret Markers */}
                {FRET_MARKERS.includes(fretNum) && (
                  <View style={styles.vMarkerDot} />
                )}
                {DOUBLE_MARKERS.includes(fretNum) && (
                  <>
                    <View style={[styles.vMarkerDot, { left: "30%" }]} />
                    <View style={[styles.vMarkerDot, { left: "70%" }]} />
                  </>
                )}

                {/* Vertical Fret Label */}
                {(FRET_MARKERS.includes(fretNum) || DOUBLE_MARKERS.includes(fretNum)) && (
                  <Text style={styles.vFretLabelText}>{fretNum}</Text>
                )}

                <View style={styles.vStringsRow}>
                  {strings.map((openNote, strIdx) => {
                    // String index in standard array: 0 is Low E (thick), 5 is High E (thin)
                    const thickness = 5 - (strIdx * 0.8);
                    const fretPitch = Note.transpose(openNote, Interval.fromSemitones(fretNum));
                    const fretChroma = Note.chroma(fretPitch);
                    const badge = getBadgeStyle(fretChroma);

                    return (
                      <View key={`v-str-${strIdx}-${fretNum}`} style={styles.vFretCell}>
                        {/* String Line */}
                        <View style={[styles.vStringLine, { width: thickness }]} />
                        
                        {/* Playable Note */}
                        <Pressable 
                          style={styles.vTouchArea}
                          onPress={() => {
                            if (!showScale && !showChord || badge) {
                              playNote(fretPitch);
                            }
                          }}
                        >
                          {badge && (
                            <View style={[styles.noteBadge, { 
                              backgroundColor: badge.bgColor, 
                              borderColor: badge.borderColor, 
                              borderWidth: badge.borderWidth 
                            }]}>
                              <Text style={[styles.noteText, { color: badge.textColor }, noteDisplayPreference === "both" && styles.noteTextSmall]}>
                                {badge.label}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Horizontal Styles
  horizontalWrapper: {
    height: 250,
    backgroundColor: "#f0f2f5",
  },
  fretboardContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    paddingRight: 20,
    backgroundColor: "#4a3525", // Rosewood color
  },
  stringRow: {
    flexDirection: "row",
    height: 36,
  },
  stringLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 18,
    backgroundColor: "#d1d8e0",
    zIndex: 1,
  },
  fretCell: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  nutCell: {
    width: 40,
    borderRightWidth: 4,
    borderRightColor: "#ecf0f1", // Bone nut
  },
  fretWire: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#a4b0be",
    zIndex: 2,
  },
  markerDot: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dfe4ea",
    marginLeft: -8,
    marginTop: -8,
    zIndex: 0,
    opacity: 0.8,
  },
  touchArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  
  // Note Badge
  noteBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  noteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  noteTextSmall: {
    fontSize: 9,
    textAlign: "center",
  },
  horizontalLabelRow: {
    flexDirection: "row",
    height: 24,
    marginTop: 4,
  },
  fretLabelText: {
    color: "#a4b0be",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Vertical Styles
  verticalWrapper: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 16,
  },
  fretboardVerticalContainer: {
    flexDirection: "column",
    backgroundColor: "#4a3525",
    paddingBottom: 40,
  },
  fretRow: {
    height: 70,
    position: "relative",
    justifyContent: "center",
  },
  vNutCell: {
    height: 50,
    borderBottomWidth: 4,
    borderBottomColor: "#ecf0f1",
  },
  vFretWire: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#a4b0be",
    zIndex: 2,
  },
  vMarkerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#dfe4ea",
    marginLeft: -10,
    marginTop: -10,
    zIndex: 0,
    opacity: 0.8,
  },
  vFretLabelText: {
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -8,
    color: "#a4b0be",
    fontSize: 12,
    fontWeight: "bold",
    zIndex: 1,
  },
  vStringsRow: {
    flexDirection: "row",
    height: "100%",
    paddingHorizontal: 20,
  },
  vFretCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  vStringLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    marginLeft: -1, // rough center
    backgroundColor: "#d1d8e0",
    zIndex: 1,
  },
  vTouchArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
});
