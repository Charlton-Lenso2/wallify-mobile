import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import MasonryList from "@react-native-seoul/masonry-list";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getWallpaperById } from "../api/unsplash";

const screenWidth = Dimensions.get("window").width;
const gap = 8;
const itemWidth = (screenWidth - gap * 3) / 2;

export default function Saved() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "wallpaperInteractions"),
        where("saved", "==", true),
      );
      const snap = await getDocs(q);
      const ids = snap.docs.map((d) => d.id);
      const results = await Promise.all(
        ids.map((id) =>
          getWallpaperById(id)
            .then((res) => res.data)
            .catch(() => null),
        ),
      );
      setWallpapers(results.filter(Boolean));
    } catch (err) {
      console.log("Error loading saved wallpapers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const aspectRatio = item.width / item.height;
    const height = itemWidth / aspectRatio;
    return (
      <Pressable onPress={() => router.push(`/wallpaper/${item.id}`)}>
        <Image
          source={{ uri: item.urls.small }}
          style={[styles.image, { width: itemWidth, height }]}
          contentFit="cover"
        />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : wallpapers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.subtext }}>No saved wallpapers yet</Text>
        </View>
      ) : (
        <MasonryList
          data={wallpapers}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: gap, paddingTop: 8, paddingBottom: 40 },
  image: { borderRadius: 12, marginBottom: gap },
  emptyState: { marginTop: 100, alignItems: "center" },
});
