import React, { useState } from "react";
import {
	View,
	Text,
	Pressable,
	Modal,
	FlatList,
	StyleSheet,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { ChevronDown, X } from "lucide-react-native";
import LabelWithTooltip from "./LabelWithTooltip";

export interface DropdownPickerProps {
	options: { label: string; value: string }[];
	selectedValue: string;
	onValueChange: (value: string) => void;
	label?: string;
	tooltip?: string;
	tooltipTitle?: string;
}

export default function DropdownPicker({
	options,
	selectedValue,
	onValueChange,
	label,
	tooltip,
	tooltipTitle,
}: DropdownPickerProps) {
	const [visible, setVisible] = useState(false);
	const { colors } = useTheme();

	const selectedOption =
		options.find((o) => o.value === selectedValue) || options[0];

	return (
		<View style={styles.container}>
			{label && (
				<LabelWithTooltip
					label={label}
					tooltip={tooltip}
					tooltipTitle={tooltipTitle}
				/>
			)}
			<Pressable
				style={[
					styles.trigger,
					{ backgroundColor: colors.background, borderColor: colors.border },
				]}
				onPress={() => setVisible(true)}
			>
				<Text style={{ color: colors.text, fontSize: 16 }}>
					{selectedOption?.label}
				</Text>
				<ChevronDown color={colors.textSecondary} size={20} />
			</Pressable>

			<Modal visible={visible} transparent animationType="fade">
				<Pressable style={styles.overlay} onPress={() => setVisible(false)}>
					<Pressable
						style={[
							styles.modalContent,
							{ backgroundColor: colors.surface, borderColor: colors.border },
						]}
					>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: colors.text }]}>
								{label || "Select Option"}
							</Text>
							<Pressable onPress={() => setVisible(false)}>
								<X color={colors.textSecondary} size={24} />
							</Pressable>
						</View>
						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => (
								<Pressable
									style={[
										styles.optionItem,
										selectedValue === item.value && {
											backgroundColor: `${colors.tint}20`,
										},
									]}
									onPress={() => {
										onValueChange(item.value);
										setVisible(false);
									}}
								>
									<Text
										style={[
											styles.optionText,
											{
												color:
													selectedValue === item.value
														? colors.tint
														: colors.text,
											},
										]}
									>
										{item.label}
									</Text>
								</Pressable>
							)}
						/>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	trigger: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		padding: 24,
	},
	modalContent: {
		borderRadius: 16,
		borderWidth: 1,
		maxHeight: "80%",
		overflow: "hidden",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(255,255,255,0.1)",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	optionItem: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(255,255,255,0.05)",
	},
	optionText: {
		fontSize: 16,
		fontWeight: "500",
	},
});
