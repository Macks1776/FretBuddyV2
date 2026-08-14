import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { tonalService } from '../../services/tonalService';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { FretboardProps } from './Fretboard';

const FRET_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_MARKERS = [12, 24];

export default function FretboardHorizontal({
  fretRange,
  strings: tuningNotes,
  renderBadge,
  onFretPress,
  onFretLongPress,
  renderNutControl,
  isCapoActive
}: FretboardProps) {
  const { isLeftHanded } = useSettingsStore();
  const [startFret, endFret] = fretRange;
  const fretsArray = Array.from({ length: endFret - startFret + 1 }, (_, i) => startFret + i);
  const strings = [...tuningNotes].reverse(); // High E on top

  return (
    <View style={styles.horizontalWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.fretboardContainer}>
          {strings.map((openNote, strIdx) => {
            // strIdx 0 is High E (thin), 5 is Low E (thick)
            const thickness = 1 + (strIdx * 0.8);
            // Reverse the strIdx for callbacks so it maps back to tuningNotes index
            const originalStrIdx = tuningNotes.length - 1 - strIdx;
            
            return (
              <View key={`str-${strIdx}`} style={[styles.stringRow, isLeftHanded && { flexDirection: 'row-reverse' }]}>
                {renderNutControl && (
                  <View style={styles.nutControlCell}>
                    {renderNutControl(originalStrIdx)}
                  </View>
                )}
                
                <View style={[styles.stringLine, { height: thickness }]} />
                
                {fretsArray.map((fretNum, index) => {
                  const isFirstInViewport = index === 0;
                  const fretPitch = tonalService.transpose(openNote, tonalService.getIntervalFromSemitones(fretNum));

                  return (
                    <View 
                      key={`fret-${strIdx}-${fretNum}`} 
                      style={[
                        styles.fretCell, 
                        fretNum === 0 && styles.nutCell,
                        fretNum === 0 && isCapoActive && styles.capoNutCell,
                        fretNum === 0 && isLeftHanded && { borderRightWidth: 0, borderLeftWidth: 4, borderLeftColor: isCapoActive ? "#a4b0be" : "#ecf0f1" }
                      ]}
                    >
                      {(fretNum > 0 || (!isFirstInViewport && fretNum > 0)) && <View style={[styles.fretWire, isLeftHanded && { right: undefined, left: 0 }]} />}

                      {/* Markers */}
                      {strIdx === 2 && FRET_MARKERS.includes(fretNum) && (
                        <View style={styles.markerDot} />
                      )}
                      {(strIdx === 1 || strIdx === 4) && DOUBLE_MARKERS.includes(fretNum) && (
                        <View style={styles.markerDot} />
                      )}

                      <Pressable 
                        style={styles.touchArea}
                        onPress={() => onFretPress(originalStrIdx, fretNum, fretPitch)}
                        onLongPress={onFretLongPress ? () => onFretLongPress(originalStrIdx, fretNum, fretPitch) : undefined}
                        delayLongPress={400}
                      >
                        {renderBadge(originalStrIdx, fretNum, fretPitch)}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View style={[styles.horizontalLabelRow, isLeftHanded && { flexDirection: 'row-reverse' }]}>
            {renderNutControl && <View style={styles.nutControlCell} />}
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

const styles = StyleSheet.create({
  horizontalWrapper: {
    height: 250,
    backgroundColor: "transparent",
  },
  fretboardContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    paddingRight: 20,
    backgroundColor: "#4a3525", // Rosewood
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
  nutControlCell: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", // match wrapper to appear outside fretboard
    zIndex: 4, // above strings
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
  capoNutCell: {
    borderRightColor: "#a4b0be", // Silver capo
    borderRightWidth: 8,
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
});
