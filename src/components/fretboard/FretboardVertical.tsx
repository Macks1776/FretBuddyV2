import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { tonalService } from '../../services/tonalService';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { FretboardProps } from './Fretboard';

const FRET_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_MARKERS = [12, 24];

export default function FretboardVertical({
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
  // Vertical view: Left is Low E (thick), Right is High E (thin)
  const strings = tuningNotes; 

  return (
    <View style={styles.verticalWrapper}>
      {renderNutControl && (
        <View style={[styles.nutControlsRow, isLeftHanded && { flexDirection: 'row-reverse' }]}>
          {strings.map((_, strIdx) => (
            <View key={`nut-${strIdx}`} style={styles.nutControlCell}>
              {renderNutControl(strIdx)}
            </View>
          ))}
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.fretboardVerticalContainer}>
          {fretsArray.map((fretNum, index) => {
            const isFirstInViewport = index === 0;
            // Original vertical fretboard used borderBottom for the nut if fretNum === 0
            // The ChordBuilder used borderTop for fretNum === 1. 
            // We'll adapt to whichever is appropriate based on startFret.
            const isNut = fretNum === 0;

            return (
              <View 
                key={`v-fret-${fretNum}`} 
                style={[
                  styles.fretRow, 
                  isNut && styles.vNutCell,
                  isNut && isCapoActive && styles.vCapoNutCell
                ]}
              >
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
                {(isFirstInViewport && fretNum > 1) ? (
                  <Text style={[styles.vFretLabelText, { color: "rgba(255, 255, 255, 0.5)", left: isLeftHanded ? undefined : 6, right: isLeftHanded ? 6 : undefined }]}>{fretNum}fr</Text>
                ) : (FRET_MARKERS.includes(fretNum) || DOUBLE_MARKERS.includes(fretNum)) ? (
                  <Text style={[styles.vFretLabelText, { left: isLeftHanded ? undefined : 8, right: isLeftHanded ? 8 : undefined }]}>{fretNum}</Text>
                ) : null}

                <View style={[styles.vStringsRow, isLeftHanded && { flexDirection: 'row-reverse' }]}>
                  {strings.map((openNote, strIdx) => {
                    // String index: 0 is Low E (thick), 5 is High E (thin)
                    const thickness = 5 - (strIdx * 0.8);
                    const fretPitch = tonalService.transpose(openNote, tonalService.getIntervalFromSemitones(fretNum));

                    return (
                      <View key={`v-str-${strIdx}-${fretNum}`} style={styles.vFretCell}>
                        {/* String Line */}
                        <View style={[styles.vStringLine, { width: thickness }]} />
                        
                        {/* Playable Note */}
                        <Pressable 
                          style={styles.vTouchArea}
                          onPress={() => onFretPress(strIdx, fretNum, fretPitch)}
                          onLongPress={onFretLongPress ? () => onFretLongPress(strIdx, fretNum, fretPitch) : undefined}
                          delayLongPress={400}
                        >
                          {renderBadge(strIdx, fretNum, fretPitch)}
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
  verticalWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
  },
  nutControlsRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 8,
    paddingHorizontal: 16, // Match the padding of strings within container
  },
  nutControlCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fretboardVerticalContainer: {
    flexDirection: "column",
    backgroundColor: "#4a3525",
    paddingBottom: 40,
    borderRadius: 8,
    overflow: "hidden",
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
  vCapoNutCell: {
    borderBottomColor: "#a4b0be", // Silver capo
    borderBottomWidth: 8,
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
    paddingHorizontal: 16,
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
    marginLeft: -1,
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
