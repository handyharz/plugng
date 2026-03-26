import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { CategoryChipRow } from "@/components/CategoryChipRow";
import { ProductCard } from "@/components/ProductCard";
import { recentSearches } from "@/data/mock";
import { theme } from "@/constants/theme";
import { productApi, searchApi, toMobileProduct } from "@/lib/api";

type InstantState = {
  products: any[];
  categories: any[];
  brands: string[];
  suggestions: string[];
  trending: {
    terms: string[];
    categories: { name: string; slug: string }[];
    brands: string[];
  };
  queryMeta: {
    normalizedQuery: string;
    expandedTerms: string[];
    personalized: boolean;
  };
};

const emptyState: InstantState = {
  products: [],
  categories: [],
  brands: [],
  suggestions: [],
  trending: { terms: [], categories: [], brands: [] },
  queryMeta: { normalizedQuery: "", expandedTerms: [], personalized: false }
};

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof params.q === "string" ? params.q : "";

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<InstantState>(emptyState);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [trendingTerms, setTrendingTerms] = useState<string[]>(["iPhone 15 Pro", "30W Charger", "MagSafe Case", "Screen Protector"]);
  const [trendingCategories, setTrendingCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof params.q === "string" && params.q !== searchQuery) {
      setInputQuery(params.q);
      setSearchQuery(params.q);
    }
  }, [params.q, searchQuery]);

  useEffect(() => {
    let active = true;

    searchApi.trending()
      .then((response) => {
        if (!active) return;
        if (response.data.terms?.length) {
          setTrendingTerms(response.data.terms.slice(0, 6));
        }
        if (response.data.categories?.length) {
          setTrendingCategories(response.data.categories.map((category) => category.name).slice(0, 6));
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function runSearch() {
      if (searchQuery.trim().length < 2) {
        setResults(emptyState);
        setCatalogProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [instantResponse, productResponse] = await Promise.allSettled([
          searchApi.instant(searchQuery.trim()),
          productApi.getAll({ search: searchQuery.trim(), limit: 12 })
        ]);

        if (!active) return;

        if (instantResponse.status === "fulfilled") {
          setResults(instantResponse.value.data);
        } else {
          setResults(emptyState);
        }

        if (productResponse.status === "fulfilled") {
          setCatalogProducts(productResponse.value.data.products.map(toMobileProduct));
        } else {
          setCatalogProducts([]);
        }
      } catch {
        if (!active) return;
        setResults(emptyState);
        setCatalogProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    runSearch();

    return () => {
      active = false;
    };
  }, [searchQuery]);

  const zeroStateCategories = trendingCategories.length ? trendingCategories : ["Chargers", "Cases", "Audio", "Protection"];
  const hasSearch = searchQuery.trim().length >= 2;
  const hasPendingInput = inputQuery.trim() !== searchQuery.trim();

  const suggestionFallback = useMemo(() => {
    return Array.from(new Set([
      ...results.suggestions,
      ...results.brands,
      ...results.categories.map((category) => category.name),
      ...trendingTerms
    ])).slice(0, 8);
  }, [results, trendingTerms]);

  const submitSearch = (value?: string) => {
    const nextValue = (value ?? inputQuery).trim();
    setInputQuery(nextValue);
    setSearchQuery(nextValue);
    router.setParams(nextValue ? { q: nextValue } : {});
    Keyboard.dismiss();
  };

  const applyQuery = (value: string) => {
    setInputQuery(value);
    setSearchQuery(value);
    router.setParams({ q: value });
  };

  const clearSearch = () => {
    setInputQuery("");
    setSearchQuery("");
    setResults(emptyState);
    setCatalogProducts([]);
    router.replace("/search");
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Search" showBack />

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.kicker}>DISCOVERY ENGINE</Text>
          <Text style={styles.heading}>Search The Archive</Text>
          <Text style={styles.body}>Find products, device fits, and brand drops across the PlugNG catalogue.</Text>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              placeholder="Search products, brands, device models, or SKU"
              placeholderTextColor={theme.colors.textTertiary}
              style={styles.input}
              autoFocus
              value={inputQuery}
              onChangeText={setInputQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => submitSearch()}
            />
            {inputQuery ? (
              <TouchableOpacity
                onPressIn={clearSearch}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => submitSearch()} style={styles.searchAction}>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {hasPendingInput && inputQuery.trim().length >= 2 ? (
            <TouchableOpacity style={styles.pendingCard} onPress={() => submitSearch()}>
              <Text style={styles.pendingLabel}>READY TO SEARCH</Text>
              <Text style={styles.pendingText}>Tap to search for "{inputQuery.trim()}".</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.quickRow}>
            {trendingTerms.slice(0, 3).map((item) => (
              <TouchableOpacity key={item} style={styles.quickChip} onPress={() => applyQuery(item)}>
                <Text style={styles.quickChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {hasSearch ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.sectionLabel}>RESULTS</Text>
              <Text style={styles.resultCount}>
                {loading ? "SEARCHING..." : `${catalogProducts.length} match${catalogProducts.length === 1 ? "" : "es"}`}
              </Text>
            </View>

            {suggestionFallback.length > 0 ? (
              <View style={styles.suggestionWrap}>
                {suggestionFallback.slice(0, 6).map((item) => (
                  <TouchableOpacity key={item} style={styles.suggestionChip} onPress={() => applyQuery(item)}>
                    <Text style={styles.suggestionChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {results.queryMeta.expandedTerms.length > 0 ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>SMART MATCHES</Text>
                <Text style={styles.metaBody}>
                  Matching beyond exact text with {results.queryMeta.expandedTerms.join(", ")}.
                </Text>
              </View>
            ) : null}

            {results.categories.length > 0 || results.brands.length > 0 ? (
              <View style={styles.discoveryCard}>
                {results.categories.length > 0 ? (
                  <>
                    <Text style={styles.discoveryLabel}>CATEGORIES</Text>
                    <View style={styles.discoveryWrap}>
                      {results.categories.slice(0, 4).map((category) => (
                        <TouchableOpacity key={category._id || category.slug || category.name} style={styles.discoveryChip} onPress={() => applyQuery(category.name)}>
                          <Text style={styles.discoveryText}>{category.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : null}

                {results.brands.length > 0 ? (
                  <>
                    <Text style={[styles.discoveryLabel, styles.discoveryLabelGap]}>BRANDS</Text>
                    <View style={styles.discoveryWrap}>
                      {results.brands.slice(0, 5).map((brand) => (
                        <TouchableOpacity key={brand} style={styles.discoveryChip} onPress={() => applyQuery(brand)}>
                          <Text style={styles.discoveryText}>{brand}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            ) : null}

            <View style={styles.resultsList}>
              {catalogProducts.map((item) => (
                <ProductCard key={item.id} product={item} compact style={styles.gridCard} />
              ))}
              {!loading && catalogProducts.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No exact hits yet.</Text>
                  <Text style={styles.emptyBody}>Try one of these available suggestions instead.</Text>
                  {suggestionFallback.length > 0 ? (
                    <View style={styles.emptySuggestionWrap}>
                      {suggestionFallback.slice(0, 6).map((item) => (
                        <TouchableOpacity key={item} style={styles.emptySuggestionChip} onPress={() => applyQuery(item)}>
                          <Text style={styles.emptySuggestionText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>RECENT</Text>
            <View style={styles.chipWrap}>
              {recentSearches.map((item) => (
                <TouchableOpacity key={item} style={styles.searchChip} onPress={() => applyQuery(item)}>
                  <Text style={styles.searchChipLabel}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>TRENDING</Text>
            <View style={styles.trendingGrid}>
              {trendingTerms.map((item, index) => (
                <TouchableOpacity key={item} style={[styles.trendingCard, index === 0 && styles.trendingCardActive]} onPress={() => applyQuery(item)}>
                  <Text style={styles.trendingText}>{item}</Text>
                  <Ionicons name="arrow-forward" size={14} color={index === 0 ? theme.colors.textPrimary : theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>SHOP BY CATEGORY</Text>
            <CategoryChipRow categories={zeroStateCategories} onSelect={applyQuery} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  heroCard: {
    position: "relative",
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: theme.spacing.xxl
  },
  heroGlow: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)"
  },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  body: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 20,
    paddingLeft: theme.spacing.lg,
    paddingRight: 8,
    paddingVertical: 8
  },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 15, fontWeight: "700", paddingVertical: 10 },
  clearButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  },
  searchAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center"
  },
  pendingCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.26)"
  },
  pendingLabel: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 6 },
  pendingText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "700" },
  quickRow: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.lg, flexWrap: "wrap" },
  quickChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: theme.colors.border },
  quickChipText: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  sectionLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.7, marginBottom: theme.spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  resultCount: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  searchChip: { paddingHorizontal: theme.spacing.lg, paddingVertical: 10, backgroundColor: theme.colors.glass, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border },
  searchChipLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  trendingGrid: { gap: theme.spacing.md, marginBottom: theme.spacing.xxl },
  resultsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xxl
  },
  gridCard: {
    width: "48%",
    marginRight: 0,
    marginBottom: theme.spacing.md
  },
  trendingCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  trendingCardActive: { borderColor: theme.colors.brand, backgroundColor: theme.colors.brandSoft },
  trendingText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  suggestionWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  suggestionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.32)"
  },
  suggestionChipText: {
    color: theme.colors.brand,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  metaCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  metaLabel: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: theme.spacing.sm },
  metaBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20 },
  discoveryCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  discoveryLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: theme.spacing.sm },
  discoveryLabelGap: { marginTop: theme.spacing.lg },
  discoveryWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  discoveryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  discoveryText: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "800" },
  emptyCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", marginBottom: theme.spacing.sm },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21 },
  emptySuggestionWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  emptySuggestionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  emptySuggestionText: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "800" }
});
