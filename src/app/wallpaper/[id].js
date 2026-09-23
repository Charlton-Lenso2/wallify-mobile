import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "../../context/ThemeContext";
import { getWallpaperById } from "../../api/unsplash";

const { width, height } = Dimensions.get("window");

export default function WallpaperDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, activeScheme } = useTheme();
  const [wallpaper, setWallpaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching wallpaper with id:", id);
    getWallpaperById(id)
      .then((res) => {
        console.log("Wallpaper data received:", res.data?.urls);
        setWallpaper(res.data);
      })
      .catch((err) => {
        console.log(
          "Error fetching wallpaper:",
          err.response?.data || err.message,
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!wallpaper) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>
          Couldn't load this wallpaper.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: wallpaper.urls.full }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        onError={(e) => console.log("Image load error:", e.error)}
      />

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView
          intensity={60}
          tint={activeScheme === "dark" ? "dark" : "light"}
          style={styles.blurCircle}
        >
          <Ionicons
            name="close"
            size={22}
            color={activeScheme === "dark" ? "#fff" : "#000"}
          />
        </BlurView>
      </Pressable>

      <View style={styles.bottomBar}>
        <BlurView
          intensity={80}
          tint={activeScheme === "dark" ? "dark" : "light"}
          style={styles.bottomBlur}
        >
          <ActionButton
            icon="heart-outline"
            label="Like"
            dark={activeScheme === "dark"}
          />
          <ActionButton
            icon="bookmark-outline"
            label="Save"
            dark={activeScheme === "dark"}
          />
          <ActionButton
            icon="download-outline"
            label="Download"
            dark={activeScheme === "dark"}
          />
          <ActionButton
            icon="close-circle-outline"
            label="Not interested"
            dark={activeScheme === "dark"}
          />
        </BlurView>
      </View>
    </View>
  );
}

function ActionButton({ icon, label, dark }) {
  return (
    <Pressable style={styles.actionButton}>
      <Ionicons name={icon} size={24} color={dark ? "#fff" : "#000"} />
      <Text style={[styles.actionLabel, { color: dark ? "#fff" : "#000" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width, height },
  backButton: { position: "absolute", top: 56, left: 16 },
  blurCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bottomBar: { position: "absolute", bottom: 32, left: 16, right: 16 },
  bottomBlur: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 24,
    paddingVertical: 14,
    overflow: "hidden",
  },
  actionButton: { alignItems: "center", gap: 4 },
  actionLabel: { fontSize: 11 },
});
