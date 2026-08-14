export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  tint: string;
  surface: string;
  segmentedBg: string;
  danger: string;
  gradientPrimary: readonly string[];
  gradientSecondary: readonly string[];
  glassBg: string;
  glassBorder: string;
};

export const LightTheme: ThemeColors = {
  background: "#F1F5F9",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  tint: "#06B6D4",
  surface: "#E2E8F0",
  segmentedBg: "#CBD5E1",
  danger: "#EF4444",
  gradientPrimary: ["#06B6D4", "#D946EF"],
  gradientSecondary: ["#A855F7", "#06B6D4"],
  glassBg: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(6, 182, 212, 0.2)",
};

export const DarkTheme: ThemeColors = {
  background: "#0B101E",
  card: "#151B2B",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#475569",
  border: "#2A3447",
  tint: "#00E5FF",
  surface: "#1A2235",
  segmentedBg: "#0B101E",
  danger: "#FF2A5F",
  gradientPrimary: ["#00E5FF", "#D946EF"],
  gradientSecondary: ["#A855F7", "#00E5FF"],
  glassBg: "rgba(21, 27, 43, 0.75)",
  glassBorder: "rgba(0, 229, 255, 0.15)",
};
