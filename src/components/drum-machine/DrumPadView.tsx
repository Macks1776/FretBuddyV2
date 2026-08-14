import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	DeviceEventEmitter,
	Dimensions,
	GestureResponderEvent,
	ScrollView,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useDrumMachineStore } from "../../store/useDrumMachineStore";
import GlassCard from "../ui/GlassCard";
import HapticService from "../../services/HapticService";
import { Smartphone, Edit3, Sliders, Grid } from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Pressable } from "react-native";
import SoundDesignerModal from "./SoundDesignerModal";
import SoundSelectorModal from "./SoundSelectorModal";
import DrumPadSettingsModal from "./DrumPadSettingsModal";

const { width } = Dimensions.get("window");
const PADDING = 24;

export default function DrumPadView() {
	const { colors } = useTheme();
	const {
		padLayout,
		padAssignments,
		customSounds,
        velocityZonesEnabled,
		loadStateFromStorage,
		updatePadAssignment,
	} = useDrumMachineStore();
	const [isLandscape, setIsLandscape] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [designerVisible, setDesignerVisible] = useState(false);
	const [selectorVisible, setSelectorVisible] = useState(false);
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [selectedPadIndex, setSelectedPadIndex] = useState<number | null>(null);

	useEffect(() => {
		loadStateFromStorage();
	}, []);

	const gap = 16;
	const availableWidth = width - PADDING * 2 - gap * (padLayout.cols - 1);
	const padWidth = availableWidth / padLayout.cols;
	const padHeight = padWidth; // Make them square

	const triggerPad = (index: number, relativeY: number) => {
		HapticService.light();

		if (editMode) {
			setSelectedPadIndex(index);
			setSelectorVisible(true);
			return;
		}

		let velocity = 1.0;
		if (velocityZonesEnabled) {
			// relativeY = 0 is top (loudest), relativeY = padHeight is bottom (softest)
			const ratio = 1 - (relativeY / padHeight);
			velocity = Math.max(0.2, Math.min(1.0, 0.2 + (ratio * 0.8)));
		}

		const soundId = padAssignments[index] || "kick";
		DeviceEventEmitter.emit("playDrumHit", { soundId, velocity, customSounds });
	};

	const handleGridTouch = (evt: GestureResponderEvent) => {
		const touches = evt.nativeEvent.changedTouches;
		for (const touch of touches) {
			const x = touch.locationX;
			const y = touch.locationY;
			
			const col = Math.floor(x / (padWidth + gap));
			const row = Math.floor(y / (padHeight + gap));
			
			const padX0 = col * (padWidth + gap);
			const padY0 = row * (padHeight + gap);
			
			// Ensure the touch is within the pad bounds and not the gap
			if (x >= padX0 && x <= padX0 + padWidth && y >= padY0 && y <= padY0 + padHeight) {
				const index = row * padLayout.cols + col;
				if (index >= 0 && index < padAssignments.length) {
					const relativeY = y - padY0;
					triggerPad(index, relativeY);
				}
			}
		}
	};

	const getPadColor = (soundId: string) => {
		switch (soundId) {
			case "kick":
				return "#F43F5E";
			case "snare":
				return "#00E5FF";
			case "closed_hat":
				return "#A855F7";
			case "open_hat":
				return "#D946EF";
			case "high_tom":
				return "#3B82F6";
			case "low_tom":
				return "#10B981";
			case "crash":
				return "#F59E0B";
			default:
				return "#A855F7";
		}
	};

	const formatName = (id: string) => {
		return id
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// Pad width/height are calculated above before handlePadPress

	const toggleOrientation = async () => {
		HapticService.light();
		if (isLandscape) {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT_UP,
			);
			setIsLandscape(false);
		} else {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.LANDSCAPE,
			);
			setIsLandscape(true);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.controlsRow}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
					<Pressable
						onPress={() => {
							HapticService.light();
							setSettingsVisible(true);
						}}
						style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					>
						<Grid color={colors.textSecondary} size={16} />
						<Text style={[styles.controlText, { color: colors.text }]}>Grid Setup</Text>
					</Pressable>

					<Pressable
						onPress={() => {
							HapticService.light();
							setDesignerVisible(true);
						}}
						style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					>
						<Sliders color={colors.textSecondary} size={16} />
						<Text style={[styles.controlText, { color: colors.text }]}>Designer</Text>
					</Pressable>

					<Pressable
						onPress={() => {
							HapticService.light();
							setEditMode(!editMode);
						}}
						style={[styles.controlBtn, { 
							backgroundColor: editMode ? colors.tint : colors.surface, 
							borderColor: editMode ? colors.tint : colors.border 
						}]}
					>
						<Edit3 color={editMode ? "#FFF" : colors.textSecondary} size={16} />
						<Text style={[styles.controlText, { color: editMode ? "#FFF" : colors.text }]}>Assign</Text>
					</Pressable>

					<Pressable
						onPress={toggleOrientation}
						style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
					>
						<Smartphone color={isLandscape ? colors.tint : colors.textSecondary} size={16} />
						<Text style={[styles.controlText, { color: colors.text }]}>Rotate</Text>
					</Pressable>
				</ScrollView>
			</View>

			{editMode && (
				<Text style={[styles.hint, { color: colors.tint, marginBottom: 16 }]}>
					Edit Mode: Tap a pad to assign a sound
				</Text>
			)}

			<View 
				style={[styles.grid, { gap }]}
				onStartShouldSetResponder={() => true}
				onResponderGrant={handleGridTouch}
				onResponderStart={handleGridTouch}
			>
				{Array.from({ length: padLayout.rows * padLayout.cols }).map((_, i) => {
					const soundId = padAssignments[i] || "kick";
					const padColor = getPadColor(soundId);

					return (
						<View
							key={i}
							style={{ width: padWidth, height: padHeight }}
						>
							<GlassCard
								style={[
									styles.pad,
									{
										flex: 1,
										borderColor: `${padColor}40`,
									},
								]}
								pointerEvents="none"
							>
								<View
									style={[
										styles.padInner,
										{ backgroundColor: `${padColor}10` },
									]}
								>
									<Text
										style={[styles.padText, { color: colors.textSecondary }]}
									>
										{formatName(soundId)}
									</Text>
								</View>
							</GlassCard>
						</View>
					);
				})}
			</View>

			<SoundDesignerModal
				visible={designerVisible}
				onClose={() => setDesignerVisible(false)}
			/>
			<SoundSelectorModal
				visible={selectorVisible}
				onClose={() => setSelectorVisible(false)}
				selectedSoundId={
					selectedPadIndex !== null
						? padAssignments[selectedPadIndex]
						: undefined
				}
				onSelect={(soundId) => {
					if (selectedPadIndex !== null) {
						updatePadAssignment(selectedPadIndex, soundId);
					}
				}}
			/>
            <DrumPadSettingsModal 
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
            />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: PADDING,
		justifyContent: "center",
	},
	controlsRow: {
		marginBottom: 16,
	},
	controlBtn: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
		borderWidth: 1,
		gap: 8,
	},
	controlText: {
		fontSize: 14,
		fontWeight: "700",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	pad: {
		borderRadius: 24,
		padding: 0,
		overflow: "hidden",
	},
	padInner: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	padText: {
		fontSize: 16,
		fontWeight: "700",
		textAlign: "center",
	},
	hint: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 14,
	},
});
