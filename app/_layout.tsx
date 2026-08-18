import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import ToneService from "../src/services/ToneService";
import { useTheme } from "../src/hooks/useTheme";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { StatusBar, View } from "react-native";
import { TooltipProvider } from "../src/providers/TooltipProvider";
import { Audio } from "expo-av";
import { useEffect } from "react";
export default function Layout() {
  const { isDark, colors } = useTheme();
  const { backgroundAudioEnabled } = useSettingsStore();

  useEffect(() => {
    // Configure native audio session for background playback
    Audio.setAudioModeAsync({
      staysActiveInBackground: backgroundAudioEnabled,
      playsInSilentModeIOS: true, // Also allow playback when physical switch is silent
      interruptionModeIOS: 1, // InterruptionModeIOS.DoNotMix
      interruptionModeAndroid: 1, // InterruptionModeAndroid.DoNotMix
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(err => {
      console.warn("Failed to set audio mode:", err);
    });
  }, [backgroundAudioEnabled]);

  const customTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
    },
  };

  return (
    <ThemeProvider value={customTheme}>
      <TooltipProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          <Stack.Screen name="index" options={{ title: "FretBuddy" }} />
          <Stack.Screen name="scale-explorer" options={{ title: "Scales" }} />
          <Stack.Screen name="pattern-explorer" options={{ title: "Fretboard" }} />
          <Stack.Screen name="circle-of-fifths" options={{ title: "Circle of Fifths" }} />
          <Stack.Screen name="cheat-sheet" options={{ title: "Cheat Sheet" }} />
          <Stack.Screen name="chord-explorer" options={{ title: "Chords" }} />
          <Stack.Screen name="transposer" options={{ title: "Transposer" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
      </View>
      </TooltipProvider>
    </ThemeProvider>
  );
}
