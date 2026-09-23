import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function SettingsScreen() {
  const { colors, preference, setThemePreference } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
        APPEARANCE
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {THEME_OPTIONS.map((opt, i) => (
          <Pressable
            key={opt.value}
            onPress={() => setThemePreference(opt.value)}
            style={[
              styles.row,
              i < THEME_OPTIONS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {opt.label}
            </Text>
            {preference === opt.value && (
              <Text style={{ color: colors.accent }}>✓</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
        ABOUT
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.push("/privacy-policy")}
          style={[
            styles.row,
            { borderBottomWidth: 1, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            Privacy Policy
          </Text>
          <Text style={{ color: colors.subtext }}>›</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/terms")} style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            Terms of Use
          </Text>
          <Text style={{ color: colors.subtext }}>›</Text>
        </Pressable>
      </View>

      <Text style={[styles.version, { color: colors.subtext }]}>
        Wallify v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 16 },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});
