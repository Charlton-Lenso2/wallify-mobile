import { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import MasonryList from "@react-native-seoul/masonry-list";
import { useRouter } from "expo-router";
import { fetchWallpapers } from "../api/unsplash";
import { useTheme } from "../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;
const gap = 8;
const itemWidth = (screenWidth - gap * 3) / 2;

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false); // synchronous lock, unlike state

  const loadMore = useCallback(async () => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;
    setLoadingMore(true);
    try {
      const res = await fetchWallpapers(page);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setWallpapers((prev) => {
          const existingIds = new Set(prev.map((w) => w.id));
          const newOnes = res.data.filter((w) => !existingIds.has(w.id));
          return [...prev, ...newOnes];
        });
        setPage((p) => p + 1);
      }
    } catch (err) {
      console.log("Error fetching wallpapers:", err);
    } finally {
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [page, hasMore]);

  useEffect(() => {
    loadMore();
  }, []); // initial load only

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
      <StatusBar style="auto" />
      <MasonryList
        data={wallpapers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={colors.accent}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: gap, paddingTop: 8, paddingBottom: 110 },
  image: { borderRadius: 12, marginBottom: gap },
});
