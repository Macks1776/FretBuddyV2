export const LightTheme = {
  background: "#f0f2f5",
  card: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  textMuted: "#999999",
  border: "#e0e0e0",
  tint: "#007AFF",
  surface: "#f9f9f9",
  segmentedBg: "#f0f2f5",
  danger: "#e74c3c",
};

export const DarkTheme = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#aaaaaa",
  textMuted: "#666666",
  border: "#333333",
  tint: "#0a84ff", // iOS dark mode blue
  surface: "#2a2a2a",
  segmentedBg: "#2c2c2e",
  danger: "#ff6961",
};

export type ThemeColors = typeof LightTheme;
