import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Activity, LayoutGrid, Music, Settings, BookOpen, RefreshCcw, ArrowRightLeft, Timer, Wrench } from "lucide-react-native";
import AnimatedPressable from "../src/components/ui/AnimatedPressable";
import GlassCard from "../src/components/ui/GlassCard";

const tools = [
  {
    title: "Scales",
    subtitle: "Find your path across the fretboard",
    href: "/scale-explorer",
    icon: LayoutGrid,
    colors: ["#00E5FF", "#A855F7"] as const,
  },
  {
    title: "Chords",
    subtitle: "Build and discover new voicings",
    href: "/chord-explorer",
    icon: Music,
    colors: ["#D946EF", "#00E5FF"] as const,
  },
  {
    title: "Fretboard",
    subtitle: "Highlight notes and triads",
    href: "/pattern-explorer",
    icon: Activity,
    colors: ["#A855F7", "#D946EF"] as const,
  },
  {
    title: "Circle of Fifths",
    subtitle: "Master chord progressions",
    href: "/circle-of-fifths",
    icon: RefreshCcw,
    colors: ["#FF5E00", "#D946EF"] as const,
  },
  {
    title: "Cheat Sheet",
    subtitle: "Quick theory references",
    href: "/cheat-sheet",
    icon: BookOpen,
    colors: ["#00E5FF", "#3B82F6"] as const,
  },
  {
    title: "Utilities",
    subtitle: "Transposition & Metronome",
    href: "/utilities",
    icon: Wrench,
    colors: ["#3B82F6", "#00E5FF"] as const,
  },
];

export default function Dashboard() {
  const { colors } = useTheme();

  return (
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
      
      <View style={styles.footer}>
        <Link href="/settings" asChild>
          <AnimatedPressable style={styles.settingsBtn}>
            <Settings color={colors.textSecondary} size={24} />
            <Text style={[styles.settingsText, { color: colors.textSecondary }]}>Settings</Text>
          </AnimatedPressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
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
  footer: {
    alignItems: "center",
  },
  settingsBtn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 6,
  },
  settingsText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
