import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import ToneService from "../src/services/ToneService";
import { useTheme } from "../src/hooks/useTheme";
import { StatusBar, View } from "react-native";

export default function Layout() {
  const { isDark, colors } = useTheme();

  const customTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
    },
  };

  return (
    <ThemeProvider value={customTheme}>
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
          <Stack.Screen name="scale-explorer" options={{ title: "Scale Explorer" }} />
          <Stack.Screen name="pattern-explorer" options={{ title: "Pattern Explorer" }} />
          <Stack.Screen name="circle-of-fifths" options={{ title: "Circle of Fifths" }} />
          <Stack.Screen name="cheat-sheet" options={{ title: "Cheat Sheet" }} />
          <Stack.Screen name="chord-explorer" options={{ title: "Chord Explorer" }} />
          <Stack.Screen name="transposer" options={{ title: "Transposer" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
