import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../src/hooks/useTheme";

export default function Dashboard() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>FretBuddy</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Master the fretboard</Text>

      <View style={styles.menu}>
        <Link href="/scale-explorer" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Scale Explorer</Text>
          </Pressable>
        </Link>
        <Link href="/chord-explorer" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Chord Explorer</Text>
          </Pressable>
        </Link>
        <Link href="/pattern-explorer" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Pattern Explorer</Text>
          </Pressable>
        </Link>
        <Link href="/circle-of-fifths" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Circle of Fifths</Text>
          </Pressable>
        </Link>
        <Link href="/cheat-sheet" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Cheat Sheet</Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Settings</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 48,
  },
  menu: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
