import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Text,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getWallpaperById } from "../../api/unsplash";

const { width, height } = Dimensions.get("window");

export default function WallpaperDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, activeScheme } = useTheme();
  const { user } = useAuth();
  const [wallpaper, setWallpaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getWallpaperById(id)
      .then((res) => setWallpaper(res.data))
      .catch((err) => console.log("Error fetching wallpaper:", err.message))
      .finally(() => setLoading(false));

    if (user) {
      const ref = doc(db, "users", user.uid, "wallpaperInteractions", id);
      getDoc(ref).then((snap) => {
        if (snap.exists()) {
          setLiked(!!snap.data().liked);
          setSaved(!!snap.data().saved);
        }
      });
    }
  }, [id, user]);

  const updateInteraction = async (fields) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "wallpaperInteractions", id);
    await setDoc(ref, fields, { merge: true });
  };

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    updateInteraction({ liked: next });
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    updateInteraction({ saved: next });
  };

  const handleNotInterested = async () => {
    await updateInteraction({ notInterested: true });
    router.back();
  };

  const handleDownload = async () => {
    if (!wallpaper) return;

    if (Platform.OS === "web") {
      Alert.alert(
        "Download unavailable",
        "Wallpaper downloads are supported on mobile devices.",
      );
      return;
    }

    setDownloading(true);
    try {
      const [{ default: FileSystem }, MediaLibrary] = await Promise.all([
        import("expo-file-system"),
        import("expo-media-library"),
      ]);
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Allow photo library access to save wallpapers.",
        );
        return;
      }
      const fileUri = FileSystem.documentDirectory + `wallify-${id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(
        wallpaper.urls.full,
        fileUri,
      );
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Wallpaper saved to your photos.");
    } catch (err) {
      console.log("Download error:", err.message);
      Alert.alert("Download failed", "Something went wrong. Try again.");
    } finally {
      setDownloading(false);
    }
  };

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

  const iconColor = activeScheme === "dark" ? "#fff" : "#000";

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: wallpaper.urls.full }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <BlurView
          intensity={60}
          tint={activeScheme === "dark" ? "dark" : "light"}
          style={styles.blurCircle}
        >
          <Ionicons name="close" size={22} color={iconColor} />
        </BlurView>
      </Pressable>

      <View style={styles.bottomBar}>
        <BlurView
          intensity={80}
          tint={activeScheme === "dark" ? "dark" : "light"}
          style={styles.bottomBlur}
        >
          <ActionButton
            icon={liked ? "heart" : "heart-outline"}
            label="Like"
            active={liked}
            color={iconColor}
            onPress={toggleLike}
          />
          <ActionButton
            icon={saved ? "bookmark" : "bookmark-outline"}
            label="Save"
            active={saved}
            color={iconColor}
            onPress={toggleSave}
          />
          <ActionButton
            icon="download-outline"
            label="Download"
            color={iconColor}
            onPress={handleDownload}
            loading={downloading}
          />
          <ActionButton
            icon="close-circle-outline"
            label="Not interested"
            color={iconColor}
            onPress={handleNotInterested}
          />
        </BlurView>
      </View>
    </View>
  );
}

function ActionButton({ icon, label, color, active, onPress, loading }) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={24} color={active ? "#3478F6" : color} />
      )}
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
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
  actionButton: { alignItems: "center", gap: 4, minWidth: 60 },
  actionLabel: { fontSize: 11 },
});
