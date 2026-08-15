import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, Switch } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useDrumMachineStore } from "../../store/useDrumMachineStore";
import { X, Minus, Plus } from "lucide-react-native";
import HapticService from "../../services/HapticService";

interface Props {
	visible: boolean;
	onClose: () => void;
}

export default function DrumPadSettingsModal({ visible, onClose }: Props) {
	const { colors } = useTheme();
	const {
		velocityZonesEnabled,
		setVelocityZonesEnabled,
		padAssignments,
		setPadCount,
	} = useDrumMachineStore();

	const padCount = padAssignments.length;

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View style={styles.overlay}>
				<View
					style={[
						styles.container,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}
				>
					<View style={styles.header}>
						<Text style={[styles.title, { color: colors.text }]}>
							Pad Settings
						</Text>
						<Pressable onPress={onClose}>
							<X color={colors.textSecondary} size={24} />
						</Pressable>
					</View>

					<View style={styles.settingRow}>
						<View>
							<Text style={[styles.settingLabel, { color: colors.text }]}>
								Velocity Zones
							</Text>
							<Text
								style={[styles.settingDesc, { color: colors.textSecondary }]}
							>
								Tap top of pad for louder sound
							</Text>
						</View>
						<Switch
							value={velocityZonesEnabled}
							onValueChange={(val) => {
								HapticService.light();
								setVelocityZonesEnabled(val);
							}}
							trackColor={{ false: colors.border, true: colors.tint }}
							thumbColor="#FFF"
						/>
					</View>

					<View style={styles.settingRow}>
						<View>
							<Text style={[styles.settingLabel, { color: colors.text }]}>
								Number of Pads
							</Text>
							<Text
								style={[styles.settingDesc, { color: colors.textSecondary }]}
							>
								Total pads to display in the grid
							</Text>
						</View>
						<View style={styles.counter}>
							<Pressable
								style={[
									styles.counterBtn,
									{
										backgroundColor: colors.background,
										borderColor: colors.border,
									},
								]}
								onPress={() => {
									HapticService.light();
									if (padCount > 2) setPadCount(padCount - 2);
								}}
							>
								<Minus color={colors.textSecondary} size={16} />
							</Pressable>
							<Text style={[styles.counterText, { color: colors.text }]}>
								{padCount}
							</Text>
							<Pressable
								style={[
									styles.counterBtn,
									{
										backgroundColor: colors.background,
										borderColor: colors.border,
									},
								]}
								onPress={() => {
									HapticService.light();
									if (padCount < 16) setPadCount(padCount + 2);
								}}
							>
								<Plus color={colors.textSecondary} size={16} />
							</Pressable>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "center",
		padding: 24,
	},
	container: {
		borderRadius: 24,
		borderWidth: 1,
		padding: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	title: {
		fontSize: 20,
		fontWeight: "800",
	},
	settingRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	settingLabel: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 4,
	},
	settingDesc: {
		fontSize: 12,
		maxWidth: 160,
	},
	counter: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	counterBtn: {
		width: 32,
		height: 32,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	counterText: {
		fontSize: 18,
		fontWeight: "700",
		width: 24,
		textAlign: "center",
	},
});
