import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient colors={['#2c1e16', '#4a3525', '#2c1e16']} style={styles.fretboardContainer}>
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
                
                <LinearGradient
                  colors={['#78909c', '#cfd8dc', '#78909c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.stringLine, { height: thickness }]}
                />
                
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
                      {(fretNum > 0 || (!isFirstInViewport && fretNum > 0)) && (
                        <LinearGradient 
                          colors={['#546e7a', '#90a4ae', '#546e7a']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.fretWire, isLeftHanded && { right: undefined, left: 0 }]} 
                        />
                      )}

                      {/* Markers */}
                      {strIdx === 2 && FRET_MARKERS.includes(fretNum) && (
                        <LinearGradient colors={['#ffffff', '#e0e0e0', '#9e9e9e']} style={[styles.markerDot, { marginLeft: isLeftHanded ? -6.5 : -9.5, top: "100%" }]} />
                      )}
                      {(strIdx === 1 || strIdx === 4) && DOUBLE_MARKERS.includes(fretNum) && (
                        <LinearGradient colors={['#ffffff', '#e0e0e0', '#9e9e9e']} style={[styles.markerDot, { marginLeft: isLeftHanded ? -6.5 : -9.5 }]} />
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
        </LinearGradient>
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
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
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
    width: 3,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: -1, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 2,
  },
  markerDot: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: -8,
    zIndex: 0,
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
