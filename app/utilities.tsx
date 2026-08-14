import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Link, Stack } from "expo-router";
import { useTheme } from "../src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRightLeft, Timer } from "lucide-react-native";
import AnimatedPressable from "../src/components/ui/AnimatedPressable";
import GlassCard from "../src/components/ui/GlassCard";

const tools = [
  {
    title: "Transposer",
    subtitle: "Shift chords and keys",
    href: "/transposer",
    icon: ArrowRightLeft,
    colors: ["#D946EF", "#A855F7"] as const,
  },
  {
    title: "Metronome",
    subtitle: "Practice your timing",
    href: "/metronome",
    icon: Timer,
    colors: ["#3B82F6", "#00E5FF"] as const,
  },
];

export default function UtilitiesScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Utilities' }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {tools.map((tool, idx) => (
            <View key={idx} style={styles.cardWrapper}>
              <Link href={tool.href as any} asChild>
                <AnimatedPressable>
                  <GlassCard style={styles.card}>
                    <LinearGradient
                      colors={tool.colors as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconContainer}
                    >
                      <tool.icon color="#FFF" size={24} />
                    </LinearGradient>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{tool.title}</Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{tool.subtitle}</Text>
                    </View>
                  </GlassCard>
                </AnimatedPressable>
              </Link>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  cardWrapper: {
    width: "47.5%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 24,
    minHeight: 170,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cardText: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
