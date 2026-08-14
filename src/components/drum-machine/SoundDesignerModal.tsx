import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	Pressable,
	TextInput,
	ScrollView,
	DeviceEventEmitter,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import {
	useDrumMachineStore,
	CustomSound,
	BUILT_IN_SOUNDS,
} from "../../store/useDrumMachineStore";
import {
	X,
	Save,
	Play,
	ChevronDown,
	ChevronUp,
	Info,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import DropdownPicker from "../ui/DropdownPicker";
import HapticService from "../../services/HapticService";

interface Props {
	visible: boolean;
	onClose: () => void;
}

const CollapsibleSection = ({
	title,
	children,
	defaultOpen = false,
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const { colors } = useTheme();

	return (
		<View style={[styles.sectionContainer, { borderColor: colors.border }]}>
			<Pressable
				style={[styles.sectionHeader, { backgroundColor: `${colors.tint}10` }]}
				onPress={() => {
					HapticService.light();
					setIsOpen(!isOpen);
				}}
			>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>
					{title}
				</Text>
				{isOpen ? (
					<ChevronUp color={colors.textSecondary} size={20} />
				) : (
					<ChevronDown color={colors.textSecondary} size={20} />
				)}
			</Pressable>
			{isOpen && <View style={styles.sectionContent}>{children}</View>}
		</View>
	);
};

export default function SoundDesignerModal({ visible, onClose }: Props) {
	const { colors } = useTheme();
	const { saveCustomSound } = useDrumMachineStore();

	const [name, setName] = useState("");

	// Synth Parameters
	const [oscWaveform, setOscWaveform] =
		useState<CustomSound["oscWaveform"]>("sine");
	const [pitchStart, setPitchStart] = useState(150);
	const [pitchEnd, setPitchEnd] = useState(40);
	const [pitchDecay, setPitchDecay] = useState(0.2);
	const [toneVolume, setToneVolume] = useState(1.0);

	const [noiseFilterType, setNoiseFilterType] =
		useState<CustomSound["noiseFilterType"]>("lowpass");
	const [noiseFilterFreq, setNoiseFilterFreq] = useState(1000);
	const [noiseDecay, setNoiseDecay] = useState(0.05);
	const [noiseVolume, setNoiseVolume] = useState(0.1);

	const [masterDecay, setMasterDecay] = useState(0.4);

	const [preset, setPreset] = useState("kick");

	const [activeTooltip, setActiveTooltip] = useState<{
		title: string;
		message: string;
	} | null>(null);

	const handleShowTooltip = (title: string, message: string) => {
		HapticService.light();
		setActiveTooltip({ title, message });
	};

	const handleLoadPreset = (val: string) => {
		HapticService.light();
		setPreset(val);
		const p = BUILT_IN_SOUNDS[val];
		if (p) {
			setOscWaveform(p.oscWaveform);
			setPitchStart(p.pitchStart);
			setPitchEnd(p.pitchEnd);
			setPitchDecay(p.pitchDecay);
			setToneVolume(p.toneVolume);

			setNoiseFilterType(p.noiseFilterType);
			setNoiseFilterFreq(p.noiseFilterFreq);
			setNoiseDecay(p.noiseDecay);
			setNoiseVolume(p.noiseVolume);

			setMasterDecay(p.masterDecay);
		}
	};

	const getCurrentPatch = (): CustomSound => ({
		oscWaveform,
		pitchStart,
		pitchEnd,
		pitchDecay,
		toneVolume,
		noiseFilterType,
		noiseFilterFreq,
		noiseDecay,
		noiseVolume,
		masterDecay,
	});

	const handleTest = () => {
		HapticService.light();
		DeviceEventEmitter.emit("playDrumHit", {
			soundId: "temp_test_sound",
			velocity: 1.0,
			customSounds: {
				temp_test_sound: getCurrentPatch(),
			},
		});
	};

	const handleSave = () => {
		if (!name.trim()) return;
		HapticService.medium();
		const id = name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "_");
		saveCustomSound(id, getCurrentPatch());
		setName("");
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View style={styles.overlay}>
				<View
					style={[
						styles.container,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}
				>
					<View style={styles.header}>
						<Text style={[styles.title, { color: colors.text }]}>
							Sound Designer
						</Text>
						<Pressable onPress={onClose}>
							<X color={colors.textSecondary} />
						</Pressable>
					</View>

					<ScrollView
						style={styles.content}
						showsVerticalScrollIndicator={false}
					>
						<Text style={[styles.label, { color: colors.textSecondary }]}>
							Load Preset
						</Text>
						<DropdownPicker
							selectedValue={preset}
							onValueChange={handleLoadPreset}
							label="Select Preset"
							options={Object.keys(BUILT_IN_SOUNDS).map((k) => ({
								label: k.replace("_", " ").toUpperCase(),
								value: k,
							}))}
						/>

						<CollapsibleSection title="Tone Generator" defaultOpen={true}>
							<LabelWithTooltip
								label="Waveform"
								tooltip="The fundamental shape of the sound. Sine is smooth and deep (good for kicks). Square and Sawtooth are harsh and buzzy. Triangle is in between."
								onShowTooltip={handleShowTooltip}
							/>
							<DropdownPicker
								selectedValue={oscWaveform}
								onValueChange={(val: any) => setOscWaveform(val)}
								label="Waveform"
								options={[
									{ label: "Sine", value: "sine" },
									{ label: "Square", value: "square" },
									{ label: "Sawtooth", value: "sawtooth" },
									{ label: "Triangle", value: "triangle" },
								]}
							/>

							<SliderRow
								label={`Start Pitch (${Math.round(pitchStart)} Hz)`}
								value={pitchStart}
								onValueChange={setPitchStart}
								min={20}
								max={2000}
								tooltip="The frequency the sound starts at. Higher values give more 'punch' or 'click'."
								tooltipTitle="Start Pitch"
								onShowTooltip={handleShowTooltip}
							/>
							<SliderRow
								label={`End Pitch (${Math.round(pitchEnd)} Hz)`}
								value={pitchEnd}
								onValueChange={setPitchEnd}
								min={20}
								max={2000}
								tooltip="The frequency the sound drops down to. Lower values give more sub-bass body."
								tooltipTitle="End Pitch"
								onShowTooltip={handleShowTooltip}
							/>
							<SliderRow
								label={`Pitch Decay (${pitchDecay.toFixed(2)} s)`}
								value={pitchDecay}
								onValueChange={setPitchDecay}
								min={0.01}
								max={1.0}
								tooltip="How quickly the pitch drops from Start to End. Faster decay creates a sharper hit."
								tooltipTitle="Pitch Decay"
								onShowTooltip={handleShowTooltip}
							/>
							<SliderRow
								label={`Tone Volume (${Math.round(toneVolume * 100)}%)`}
								value={toneVolume}
								onValueChange={setToneVolume}
								min={0}
								max={1.0}
								tooltip="The overall loudness of the Tone Generator."
								tooltipTitle="Tone Volume"
								onShowTooltip={handleShowTooltip}
							/>
						</CollapsibleSection>

						<CollapsibleSection title="Noise Generator">
							<LabelWithTooltip
								label="Filter Type"
								tooltip="How the white noise is shaped. Lowpass cuts high frequencies, Highpass cuts low frequencies, Bandpass leaves only a narrow frequency band."
								onShowTooltip={handleShowTooltip}
							/>
							<DropdownPicker
								selectedValue={noiseFilterType}
								onValueChange={(val: any) => setNoiseFilterType(val)}
								label="Filter Type"
								options={[
									{ label: "Lowpass", value: "lowpass" },
									{ label: "Highpass", value: "highpass" },
									{ label: "Bandpass", value: "bandpass" },
								]}
							/>

							<SliderRow
								label={`Filter Freq (${Math.round(noiseFilterFreq)} Hz)`}
								value={noiseFilterFreq}
								onValueChange={setNoiseFilterFreq}
								min={100}
								max={10000}
								tooltip="The target frequency for the noise filter. Higher values make the noise brighter and thinner."
								tooltipTitle="Filter Freq"
								onShowTooltip={handleShowTooltip}
							/>
							<SliderRow
								label={`Noise Decay (${noiseDecay.toFixed(2)} s)`}
								value={noiseDecay}
								onValueChange={setNoiseDecay}
								min={0.01}
								max={1.0}
								tooltip="How quickly the noise fades out. Short decay is good for clicks, long decay is good for cymbals/hats."
								tooltipTitle="Noise Decay"
								onShowTooltip={handleShowTooltip}
							/>
							<SliderRow
								label={`Noise Volume (${Math.round(noiseVolume * 100)}%)`}
								value={noiseVolume}
								onValueChange={setNoiseVolume}
								min={0}
								max={1.0}
								tooltip="The overall loudness of the Noise Generator."
								tooltipTitle="Noise Volume"
								onShowTooltip={handleShowTooltip}
							/>
						</CollapsibleSection>

						<CollapsibleSection title="Master Envelope">
							<SliderRow
								label={`Master Decay (${masterDecay.toFixed(2)} s)`}
								value={masterDecay}
								onValueChange={setMasterDecay}
								min={0.05}
								max={2.0}
								tooltip="The final fade-out of the entire sound. This acts as a maximum length constraint."
								tooltipTitle="Master Decay"
								onShowTooltip={handleShowTooltip}
							/>
						</CollapsibleSection>

						<View style={styles.footerSpace} />
					</ScrollView>

					<View style={[styles.footer, { borderTopColor: colors.border }]}>
						<TextInput
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.background,
								},
							]}
							placeholder="My Custom Drum..."
							placeholderTextColor={colors.textSecondary}
							value={name}
							onChangeText={setName}
						/>

						<View style={styles.actionButtons}>
							<Pressable
								onPress={handleTest}
								style={[
									styles.actionButton,
									{
										backgroundColor: colors.surface,
										borderColor: colors.border,
										borderWidth: 1,
										flex: 0.3,
									},
								]}
							>
								<Play color={colors.text} size={20} />
							</Pressable>

							<Pressable
								onPress={handleSave}
								style={[
									styles.actionButton,
									styles.saveButton,
									{
										backgroundColor: name.trim() ? colors.tint : colors.surface,
										flex: 0.7,
									},
								]}
								disabled={!name.trim()}
							>
								<Save
									color={name.trim() ? "#FFF" : colors.textSecondary}
									size={20}
								/>
								<Text
									style={[
										styles.saveText,
										{ color: name.trim() ? "#FFF" : colors.textSecondary },
									]}
								>
									Save Sound
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>

			{activeTooltip && (
				<Modal visible={true} transparent animationType="fade">
					<Pressable
						style={styles.tooltipOverlay}
						onPress={() => setActiveTooltip(null)}
					>
						<Pressable
							style={[
								styles.tooltipContainer,
								{ backgroundColor: colors.surface, borderColor: colors.border },
							]}
						>
							<View style={styles.tooltipHeader}>
								<Text style={[styles.tooltipTitle, { color: colors.text }]}>
									{activeTooltip.title}
								</Text>
								<Pressable onPress={() => setActiveTooltip(null)}>
									<X color={colors.textSecondary} size={20} />
								</Pressable>
							</View>
							<Text
								style={[styles.tooltipMessage, { color: colors.textSecondary }]}
							>
								{activeTooltip.message}
							</Text>
						</Pressable>
					</Pressable>
				</Modal>
			)}
		</Modal>
	);
}

const LabelWithTooltip = ({
	label,
	tooltip,
	tooltipTitle,
	onShowTooltip,
}: {
	label: string;
	tooltip?: string;
	tooltipTitle?: string;
	onShowTooltip?: (title: string, msg: string) => void;
}) => {
	const { colors } = useTheme();
	return (
		<View style={styles.labelContainer}>
			<Text
				style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}
			>
				{label}
			</Text>
			{tooltip && onShowTooltip && (
				<Pressable
					onPress={() => onShowTooltip(tooltipTitle || label, tooltip)}
					hitSlop={10}
					style={{ marginLeft: 6 }}
				>
					<Info color={colors.textSecondary} size={16} />
				</Pressable>
			)}
		</View>
	);
};

const SliderRow = ({
	label,
	value,
	onValueChange,
	min,
	max,
	tooltip,
	tooltipTitle,
	onShowTooltip,
}: any) => {
	const { colors } = useTheme();
	return (
		<View style={styles.sliderRow}>
			<LabelWithTooltip
				label={label}
				tooltip={tooltip}
				tooltipTitle={tooltipTitle}
				onShowTooltip={onShowTooltip}
			/>
			<Slider
				style={{ width: "100%", height: 40 }}
				minimumValue={min}
				maximumValue={max}
				value={value}
				onValueChange={onValueChange}
				minimumTrackTintColor={colors.tint}
				maximumTrackTintColor={colors.border}
				thumbTintColor={colors.tint}
			/>
		</View>
	);
};

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
		maxHeight: "90%",
		paddingTop: 24,
		paddingBottom: 24,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 20,
		fontWeight: "800",
	},
	content: {
		flexGrow: 0,
		paddingHorizontal: 24,
	},
	labelContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
	},
	sliderRow: {
		marginBottom: 16,
	},
	input: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		marginBottom: 16,
	},
	footer: {
		paddingTop: 16,
		paddingHorizontal: 24,
		borderTopWidth: 1,
		marginTop: 8,
	},
	actionButtons: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
		gap: 8,
	},
	saveButton: {
		flex: 1,
	},
	saveText: {
		fontSize: 16,
		fontWeight: "700",
	},
	footerSpace: {
		height: 40,
	},
	sectionContainer: {
		borderWidth: 1,
		borderRadius: 12,
		marginBottom: 24,
		overflow: "hidden",
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "700",
	},
	sectionContent: {
		padding: 16,
	},
	tooltipOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	tooltipContainer: {
		width: "100%",
		borderRadius: 16,
		borderWidth: 1,
		padding: 24,
	},
	tooltipHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	tooltipTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	tooltipMessage: {
		fontSize: 16,
		lineHeight: 24,
	},
});
