import { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Pressable,
  TextInput,
  Text,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import MasonryList from "@react-native-seoul/masonry-list";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchWallpapers, searchWallpapers } from "../api/unsplash";
import { CATEGORIES } from "../constants/categories";
import { useTheme } from "../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;
const gap = 8;
const itemWidth = (screenWidth - gap * 3) / 2;

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const [wallpapers, setWallpapers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetching = useRef(false);
  const debounceRef = useRef(null);

  const activeTerm = debouncedQuery.trim() || null;

  // Debounce raw typing into debouncedQuery so we don't hit the API every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const loadPage = useCallback(async (pageNum, term, append) => {
    if (isFetching.current) return;
    isFetching.current = true;
    append ? setLoadingMore(true) : setLoading(true);

    try {
      const res = term
        ? await searchWallpapers(term, pageNum)
        : await fetchWallpapers(pageNum);
      const newItems = term ? res.data.results : res.data;

      setHasMore(newItems.length > 0);
      setWallpapers((prev) => {
        if (!append) return newItems;
        const existingIds = new Set(prev.map((w) => w.id));
        return [...prev, ...newItems.filter((w) => !existingIds.has(w.id))];
      });
      setPage(pageNum);
    } catch (err) {
      console.log("Error fetching wallpapers:", err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []);

  // Refetch from page 1 whenever the effective search term changes
  useEffect(() => {
    setHasMore(true);
    loadPage(1, activeTerm, false);
  }, [activeTerm]);

  const handleTextChange = (text) => {
    setQuery(text);
    setActiveCategory(null);
  };

  const handleCategoryPress = (cat) => {
    setActiveCategory(cat.id);
    setQuery(cat.label);
    setDebouncedQuery(cat.label); // skip the debounce delay for taps
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setActiveCategory(null);
    setSearchActive(false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    loadPage(page + 1, activeTerm, true);
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
      <StatusBar style="auto" />

      <View style={styles.header}>
        {searchActive ? (
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.subtext} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={handleTextChange}
              placeholder="Search wallpapers"
              placeholderTextColor={colors.subtext}
              style={[styles.searchInput, { color: colors.text }]}
            />
            <Pressable onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color={colors.subtext} />
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => setSearchActive(true)}
              style={styles.iconButton}
            >
              <Ionicons name="search" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.title, { color: colors.text }]}>Wallify</Text>
            <View style={styles.iconButton} />
          </>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => handleCategoryPress(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.accent : colors.card,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? "#fff" : colors.text,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : activeTerm && wallpapers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.subtext }}>No results found</Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 44,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoryScroll: { maxHeight: 52, flexGrow: 0, marginTop: 8 },
  categoryRow: { paddingHorizontal: 16, alignItems: "center", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  listContent: { paddingHorizontal: gap, paddingTop: 8, paddingBottom: 110 },
  image: { borderRadius: 12, marginBottom: gap },
  emptyState: { marginTop: 60, alignItems: "center" },
});
