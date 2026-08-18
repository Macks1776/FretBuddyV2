import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Modal,
	Switch,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrientation } from "../src/hooks/useOrientation";
import HapticService from "../src/services/HapticService";
import ScaleExplorer from "../src/components/ScaleExplorer";
import { useFretboardStore, LayoutMode } from "../src/store/useFretboardStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { DEFAULT_TUNINGS } from "../src/utils/tunings";
import { SCALES, CHORDS } from "../src/utils/theoryData";
import { useTheme } from "../src/hooks/useTheme";
import { ThemeColors } from "../src/theme/colors";
import LabelWithTooltip from "../src/components/ui/LabelWithTooltip";

const NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

// Reusable simple picker for the menu
const SimplePicker = ({
	label,
	value,
	options,
	onSelect,
	colors,
	tooltip,
	tooltipTitle,
}: {
	label: string;
	value: string;
	options: { label: string; value: string }[];
	onSelect: (v: string) => void;
	colors: ThemeColors;
	tooltip?: string;
	tooltipTitle?: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedLabel = options.find((o) => o.value === value)?.label || value;

	return (
		<View style={styles.pickerWrapper}>
			<LabelWithTooltip label={label} tooltip={tooltip} tooltipTitle={tooltipTitle} />
			<Pressable
				style={[
					styles.pickerBtn,
					{ backgroundColor: colors.surface, borderColor: colors.border },
				]}
				onPress={() => {
					HapticService.medium();
					setIsOpen(true);
				}}
			>
				<Text style={[styles.pickerBtnText, { color: colors.text }]}>
					{selectedLabel} ▾
				</Text>
			</Pressable>

			<Modal visible={isOpen} transparent animationType="fade">
				<Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
					<View
						style={[
							styles.modalContent,
							{
								backgroundColor: colors.card,
								borderTopColor: colors.border,
								borderTopWidth: 1,
							},
						]}
					>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							Select {label}
						</Text>
						<ScrollView style={styles.modalList}>
							{options.map((opt) => (
								<Pressable
									key={opt.value}
									style={[
										styles.modalItem,
										{ borderBottomColor: colors.border },
									]}
									onPress={() => {
										HapticService.medium();
										onSelect(opt.value);
										setIsOpen(false);
									}}
								>
									<Text
										style={[
											styles.modalItemText,
											{ color: colors.text },
											opt.value === value && [
												styles.modalItemTextActive,
												{ color: colors.tint },
											],
										]}
									>
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

export default function FretboardScreen() {
	const {
		layoutMode,
		activeTuningId,
		showScale,
		scaleRoot,
		targetScale,
		showChord,
		chordRoot,
		targetChord,
		chordProgression,
		activeProgressionIndex,
		isPlayingProgression,
		progressionSpeedMs,
		hideNonScaleChordTones,
		setLayoutMode,
		setActiveTuningId,
		setShowScale,
		setScaleRoot,
		setTargetScale,
		setShowChord,
		setChordRoot,
		setTargetChord,
		addChordToProgression,
		removeChordFromProgression,
		clearProgression,
		setActiveProgressionIndex,
		setIsPlayingProgression,
		setProgressionSpeedMs,
		setHideNonScaleChordTones,
		localPlaybackEnabled,
		setLocalPlaybackEnabled,
	} = useFretboardStore();

	const { customTunings, notePlaybackEnabled } = useSettingsStore();
	const { colors } = useTheme();
	const orientation = useOrientation();
	const isLandscape = orientation === "landscape";
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);

	const allTunings = [...DEFAULT_TUNINGS, ...customTunings];
    
	const isPlaybackActive = localPlaybackEnabled !== null ? localPlaybackEnabled : notePlaybackEnabled;

	// Sequencer Engine
	useEffect(() => {
		let intervalId: NodeJS.Timeout;
		if (isPlayingProgression && chordProgression.length > 0) {
			intervalId = setInterval(() => {
				setActiveProgressionIndex(
					(activeProgressionIndex + 1) % chordProgression.length,
				);
			}, progressionSpeedMs);
		}
		return () => clearInterval(intervalId);
	}, [
		isPlayingProgression,
		chordProgression,
		activeProgressionIndex,
		progressionSpeedMs,
	]);

	// Stop playback when leaving screen
	useFocusEffect(
		useCallback(() => {
			return () => {
				setIsPlayingProgression(false);
			};
		}, []),
	);

	const renderMenuControls = () => (
		<ScrollView style={styles.menuScroll}>
			<View style={styles.menuContent}>
				{/* Layout Toggle */}
				<View style={styles.controlRow}>
					<LabelWithTooltip
						label="Fretboard Mode"
					/>
					<View
						style={[
							styles.segmentedControl,
							{ backgroundColor: colors.segmentedBg },
						]}
					>
						<Pressable
							style={[
								styles.segmentBtn,
								layoutMode === "horizontal" && [
									styles.segmentBtnActive,
									{ backgroundColor: colors.card },
								],
							]}
							onPress={() => {
								HapticService.medium();
								setLayoutMode("horizontal");
							}}
						>
							<Text
								style={[
									styles.segmentText,
									{ color: colors.textSecondary },
									layoutMode === "horizontal" && [
										styles.segmentTextActive,
										{ color: colors.tint },
									],
								]}
							>
								Horizontal
							</Text>
						</Pressable>
						<Pressable
							style={[
								styles.segmentBtn,
								layoutMode === "fullscreen" && [
									styles.segmentBtnActive,
									{ backgroundColor: colors.card },
								],
							]}
							onPress={() => {
								HapticService.medium();
								setLayoutMode("fullscreen");
							}}
						>
							<Text
								style={[
									styles.segmentText,
									{ color: colors.textSecondary },
									layoutMode === "fullscreen" && [
										styles.segmentTextActive,
										{ color: colors.tint },
									],
								]}
							>
								Fullscreen
							</Text>
						</Pressable>
					</View>
				</View>

        <View style={styles.controlRow}>
          <SimplePicker 
            label="Tuning"
            tooltip="Select the tuning for the instrument to update the fretboard notes."
            value={activeTuningId}
            options={allTunings.map((t) => ({ label: t.name, value: t.id }))}
            onSelect={setActiveTuningId}
            colors={colors}
          />
        </View>

				{/* Scale Toggle & Controls */}
				<View style={styles.toggleRow}>
					<LabelWithTooltip
						label="Show Scale Notes"
					/>
					<Switch
						value={showScale}
						onValueChange={(v) => {
							HapticService.medium();
							setShowScale(v);
						}}
						trackColor={{ false: colors.border, true: colors.tint }}
					/>
				</View>

				{showScale && (
					<View style={styles.gridRow}>
						<View style={{ flex: 1, marginRight: 8 }}>
							<SimplePicker
								label="Root"
								value={scaleRoot}
								options={NOTES.map((n) => ({ label: n, value: n }))}
								onSelect={setScaleRoot}
								colors={colors}
							/>
						</View>
						<View style={{ flex: 2 }}>
							<SimplePicker
								label="Scale"
								value={targetScale}
								options={SCALES.map((s) => ({ label: s.name, value: s.id }))}
								onSelect={setTargetScale}
								colors={colors}
							/>
						</View>
					</View>
				)}

				{/* Chord Toggle & Controls */}
				<View style={styles.toggleRow}>
					<LabelWithTooltip
						label="Show Chord Tones"
					/>
					<Switch
						value={showChord}
						onValueChange={(v) => {
							HapticService.medium();
							setShowChord(v);
						}}
						trackColor={{ false: colors.border, true: colors.tint }}
					/>
				</View>

				{showChord && (
					<View
						style={[
							styles.progressionContainer,
							{ backgroundColor: colors.surface, borderColor: colors.border },
						]}
					>
						<View style={styles.toggleRow}>
							<LabelWithTooltip
								label="Diatonic Only"
								tooltip="Hide chord tones that do not belong to the currently selected scale."
							/>
							<Switch
								value={hideNonScaleChordTones}
								onValueChange={(v) => {
									HapticService.medium();
									setHideNonScaleChordTones(v);
								}}
								trackColor={{ false: colors.border, true: colors.tint }}
							/>
						</View>

						{/* Chord Progression Viewer */}
						{chordProgression.length > 0 && (
							<View style={styles.sequenceViewer}>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									style={styles.sequenceScroll}
								>
									{chordProgression.map((chord, idx) => {
										const isActive = idx === activeProgressionIndex;
										const chordName =
											CHORDS.find((c) => c.id === chord.suffix)?.name ||
											chord.suffix;
										return (
											<Pressable
												key={`prog-${idx}`}
												style={[
													styles.sequenceBadge,
													{
														backgroundColor: colors.card,
														borderColor: colors.border,
													},
													isActive && [
														styles.sequenceBadgeActive,
														{
															backgroundColor: colors.tint,
															borderColor: colors.tint,
														},
													],
												]}
												onPress={() => {
													HapticService.medium();
													setIsPlayingProgression(false);
													setActiveProgressionIndex(idx);
												}}
											>
												<Text
													style={[
														styles.sequenceText,
														{ color: colors.text },
														isActive && [
															styles.sequenceTextActive,
															{ color: "#fff" },
														],
													]}
												>
													{chord.root} {chordName}
												</Text>
												<Pressable
													style={styles.sequenceRemoveBtn}
													onPress={() => {
														HapticService.medium();
														removeChordFromProgression(idx);
													}}
												>
													<Text
														style={[
															styles.sequenceRemoveText,
															{ color: colors.textMuted },
														]}
													>
														✕
													</Text>
												</Pressable>
											</Pressable>
										);
									})}
								</ScrollView>

								{/* Transport Controls */}
								<View style={[styles.transportBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
									<Pressable
										style={styles.transportBtn}
										onPress={() => {
											HapticService.medium();
											if (!isPlayingProgression) {
												setActiveProgressionIndex(
													Math.max(0, activeProgressionIndex - 1),
												);
											}
										}}
									>
										<Ionicons name="play-back" size={20} color={colors.text} />
									</Pressable>
                  <Pressable 
                    style={[
                      styles.transportBtn, 
                      styles.transportPlayBtn, 
                      { backgroundColor: 'transparent' },
                      isPlayingProgression && { 
                        backgroundColor: '#A855F7',
                        shadowColor: '#A855F7',
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 4
                      }
                    ]}
                    onPress={() => {
                      HapticService.medium();
                      setIsPlayingProgression(!isPlayingProgression);
                    }}
                  >
                    <Ionicons 
                      name={isPlayingProgression ? "pause" : "play"} 
                      size={28} 
                      color={isPlayingProgression ? "#fff" : colors.text} 
                    />
                  </Pressable>
									<Pressable
										style={styles.transportBtn}
										onPress={() => {
											HapticService.medium();
											if (!isPlayingProgression) {
												setActiveProgressionIndex(
													(activeProgressionIndex + 1) %
														chordProgression.length,
												);
											}
										}}
									>
										<Ionicons name="play-forward" size={20} color={colors.text} />
									</Pressable>

									<View
										style={[
											styles.speedControls,
											{ backgroundColor: colors.surface },
										]}
									>
										<Pressable
											style={[
												styles.speedBtn,
												progressionSpeedMs === 3000 && [
													styles.speedBtnActive,
													{ backgroundColor: colors.card },
												],
											]}
											onPress={() => setProgressionSpeedMs(3000)}
										>
											<Text
												style={[
													styles.speedText,
													{ color: colors.textSecondary },
													progressionSpeedMs === 3000 && [
														styles.speedTextActive,
														{ color: colors.tint },
													],
												]}
											>
												Slow
											</Text>
										</Pressable>
										<Pressable
											style={[
												styles.speedBtn,
												progressionSpeedMs === 2000 && [
													styles.speedBtnActive,
													{ backgroundColor: colors.card },
												],
											]}
											onPress={() => setProgressionSpeedMs(2000)}
										>
											<Text
												style={[
													styles.speedText,
													{ color: colors.textSecondary },
													progressionSpeedMs === 2000 && [
														styles.speedTextActive,
														{ color: colors.tint },
													],
												]}
											>
												Med
											</Text>
										</Pressable>
										<Pressable
											style={[
												styles.speedBtn,
												progressionSpeedMs === 1000 && [
													styles.speedBtnActive,
													{ backgroundColor: colors.card },
												],
											]}
											onPress={() => setProgressionSpeedMs(1000)}
										>
											<Text
												style={[
													styles.speedText,
													{ color: colors.textSecondary },
													progressionSpeedMs === 1000 && [
														styles.speedTextActive,
														{ color: colors.tint },
													],
												]}
											>
												Fast
											</Text>
										</Pressable>
									</View>
								</View>
							</View>
						)}

						<View style={styles.gridRow}>
							<View style={{ flex: 1, marginRight: 8 }}>
								<SimplePicker
									label="Root"
									value={chordRoot}
									options={NOTES.map((n) => ({ label: n, value: n }))}
									onSelect={setChordRoot}
									colors={colors}
								/>
							</View>
							<View style={{ flex: 2, marginRight: 8 }}>
								<SimplePicker
									label="Chord"
									value={targetChord}
									options={CHORDS.map((c) => ({ label: c.name, value: c.id }))}
									onSelect={setTargetChord}
									colors={colors}
								/>
							</View>
							<View style={{ flex: 1, justifyContent: "flex-end" }}>
								<Pressable
									style={[styles.addChordBtn, { backgroundColor: colors.tint }]}
									onPress={() => {
										HapticService.medium();
										addChordToProgression(chordRoot, targetChord);
										if (
											!isPlayingProgression &&
											chordProgression.length === 0
										) {
											setActiveProgressionIndex(0);
										}
									}}
								>
									<Text style={styles.addChordText}>+ Add</Text>
								</Pressable>
							</View>
						</View>
					</View>
				)}
			</View>
		</ScrollView>
	);

	  if (layoutMode === "fullscreen" || isLandscape) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["bottom", "left", "right"]}
      >
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
          <ScaleExplorer isPlaybackActive={isPlaybackActive} />
        </View>

				<Pressable
					style={[
						styles.floatingMenuBtn,
						{ backgroundColor: colors.card, shadowColor: colors.text },
					]}
					onPress={() => setIsOverlayOpen(true)}
				>
					<Text style={[styles.floatingMenuText, { color: colors.text }]}>
						Controls
					</Text>
				</Pressable>

				<Modal visible={isOverlayOpen} animationType="slide" transparent>
					<View style={styles.overlayContainer}>
						<Pressable
							style={styles.overlayDismiss}
							onPress={() => setIsOverlayOpen(false)}
						/>
						<View
							style={[
								styles.overlayMenu,
								{ backgroundColor: colors.background },
							]}
						>
							<View
								style={[
									styles.overlayHeader,
									{ borderBottomColor: colors.border },
								]}
							>
								<Text style={[styles.overlayTitle, { color: colors.text }]}>
									Fretboard Controls
								</Text>
								<Pressable onPress={() => setIsOverlayOpen(false)}>
									<Text style={[styles.overlayDoneBtn, { color: colors.tint }]}>
										Done
									</Text>
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["bottom", "left", "right"]}
    >
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
        <ScaleExplorer isPlaybackActive={isPlaybackActive} />
      </View>
			<View
				style={[
					styles.horizontalMenuArea,
					{ backgroundColor: colors.background, shadowColor: colors.text },
				]}
			>
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
	controlLabel: {
		fontSize: 14,
		fontWeight: "700",
		marginBottom: 8,
		textTransform: "uppercase",
	},
	toggleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	gridRow: {
		flexDirection: "row",
		marginBottom: 20,
	},
	progressionContainer: {
		borderRadius: 12,
		padding: 12,
		marginBottom: 20,
		borderWidth: 1,
	},
	sequenceViewer: {
		marginBottom: 16,
	},
	sequenceScroll: {
		flexDirection: "row",
		marginBottom: 12,
	},
	sequenceBadge: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
		marginRight: 8,
	},
	sequenceBadgeActive: {
		borderColor: "#007AFF",
		backgroundColor: "#007AFF",
	},
	sequenceText: {
		fontSize: 14,
		fontWeight: "600",
		marginRight: 6,
	},
	sequenceTextActive: {
		color: "#fff",
	},
	sequenceRemoveBtn: {
		padding: 4,
	},
	sequenceRemoveText: {
		fontSize: 12,
		fontWeight: "700",
	},
	transportBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 8,
		borderRadius: 24,
		borderWidth: 1,
	},
	transportBtn: {
		padding: 8,
		width: 40,
		alignItems: "center",
	},
	transportPlayBtn: {
		borderRadius: 24,
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
	},
	transportIcon: {
		fontSize: 18,
	},
	speedControls: {
		flexDirection: "row",
		borderRadius: 16,
		padding: 2,
	},
	speedBtn: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 14,
	},
	speedBtnActive: {
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
		elevation: 2,
	},
	speedText: {
		fontSize: 12,
		fontWeight: "600",
	},
	speedTextActive: {},
	addChordBtn: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		height: 44,
	},
	addChordText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 14,
	},

	// Segmented Control
	segmentedControl: {
		flexDirection: "row",
		borderRadius: 8,
		padding: 4,
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
	segmentTextActive: {},

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
