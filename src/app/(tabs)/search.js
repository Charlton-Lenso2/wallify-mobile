import { useState, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import { useRouter } from "expo-router";
import { searchWallpapers } from "../../api/unsplash";
import { CATEGORIES } from "../../constants/categories";
import { useTheme } from "../../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;
const gap = 8;
const itemWidth = (screenWidth - gap * 3) / 2;

export default function Search() {
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);
  const isFetching = useRef(false);

  const runSearch = useCallback(
    async (searchTerm, pageNum = 1, append = false) => {
      if (!searchTerm.trim()) return;
      if (isFetching.current) return;
      isFetching.current = true;
      append ? setLoadingMore(true) : setLoading(true);

      try {
        const res = await searchWallpapers(searchTerm, pageNum);
        const newResults = res.data.results;
        setHasMore(newResults.length > 0);
        setResults((prev) => {
          if (!append) return newResults;
          const existingIds = new Set(prev.map((w) => w.id));
          return [...prev, ...newResults.filter((w) => !existingIds.has(w.id))];
        });
        setPage(pageNum);
        setHasSearched(true);
      } catch (err) {
        console.log("Search error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetching.current = false;
      }
    },
    [],
  );

  const handleTextChange = (text) => {
    setQuery(text);
    setActiveCategory(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(text, 1, false);
    }, 500);
  };

  const handleCategoryPress = (cat) => {
    setActiveCategory(cat.id);
    setQuery(cat.label);
    runSearch(cat.label, 1, false);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore || !hasSearched) return;
    const term = activeCategory
      ? CATEGORIES.find((c) => c.id === activeCategory).label
      : query;
    runSearch(term, page + 1, true);
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
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.subtext} />
        <TextInput
          value={query}
          onChangeText={handleTextChange}
          placeholder="Search wallpapers"
          placeholderTextColor={colors.subtext}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
              setActiveCategory(null);
            }}
          >
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </Pressable>
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
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.subtext }}>No results found</Text>
        </View>
      ) : (
        <MasonryList
          data={results}
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
  container: { flex: 1, paddingTop: 60 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  listContent: { paddingHorizontal: gap, paddingBottom: 110 },
  image: { borderRadius: 12, marginBottom: gap },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
});
