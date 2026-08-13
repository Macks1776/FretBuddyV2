import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import ToneService from "../src/services/ToneService";
import { useTheme } from "../src/hooks/useTheme";
import { StatusBar } from "react-native";

export default function Layout() {
  const { isDark, colors } = useTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ToneService />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: !isDark,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="index" options={{ title: "Dashboard" }} />
        <Stack.Screen name="fretboard" options={{ title: "Fretboard" }} />
        <Stack.Screen name="circle-of-fifths" options={{ title: "Circle of Fifths" }} />
        <Stack.Screen name="cheat-sheet" options={{ title: "Cheat Sheet" }} />
        <Stack.Screen name="chord-explorer" options={{ title: "Chord Explorer" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </ThemeProvider>
  );
}
