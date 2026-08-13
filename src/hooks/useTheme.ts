import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/useSettingsStore";
import { LightTheme, DarkTheme, ThemeColors } from "../theme/colors";

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const systemColorScheme = useColorScheme();
  const { themePreference } = useSettingsStore();

  const isDark = 
    themePreference === "dark" || 
    (themePreference === "system" && systemColorScheme === "dark");

  return {
    isDark,
    colors: isDark ? DarkTheme : LightTheme,
  };
}
