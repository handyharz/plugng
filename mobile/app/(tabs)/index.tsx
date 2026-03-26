import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/AppHeader";
import { CategoryChipRow } from "@/components/CategoryChipRow";
import { ProductCard } from "@/components/ProductCard";
import { SearchEntryBar } from "@/components/SearchEntryBar";
import { SectionHeader } from "@/components/SectionHeader";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationContext";
import { categories, products } from "@/data/mock";
import { theme } from "@/constants/theme";
import { productApi, searchApi, toMobileProduct } from "@/lib/api";

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const [featuredItems, setFeaturedItems] = useState(products);
  const [trendingItems, setTrendingItems] = useState(products.slice(0, 3));
  const [browseItems, setBrowseItems] = useState(products.slice(0, 4));
  const [loading, setLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [browsePage, setBrowsePage] = useState(1);
  const [hasMoreBrowse, setHasMoreBrowse] = useState(true);
  const [error, setError] = useState("");
  const [backendConnected, setBackendConnected] = useState(false);
  const [heroTerms, setHeroTerms] = useState(["MagSafe", "USB-C", "Audio", "Protection"]);
  const [archiveTerms, setArchiveTerms] = useState(categories);

  const browseLimit = 6;

  const loadBrowsePage = useCallback(async (page: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setBrowseLoading(true);
    }

    try {
      const response = await productApi.getAll({ page, limit: browseLimit });
      const nextItems = response.data.products.map(toMobileProduct);

      setBrowseItems((current) => {
        if (!append) return nextItems;
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...nextItems.filter((item) => !seen.has(item.id))];
      });
      setBrowsePage(page);
      setHasMoreBrowse(page < response.data.pages);
    } catch {
      if (!append) {
        setBrowseItems(products.slice(0, 6));
      }
      setHasMoreBrowse(false);
    } finally {
      setBrowseLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [featuredResponse, trendingResponse] = await Promise.all([
          productApi.getAll({ featured: true, limit: 8 }),
          productApi.getAll({ trending: true, limit: 6 }),
          loadBrowsePage(1)
        ]);
        setBackendConnected(true);
        if (featuredResponse.data.products.length > 0) {
          setFeaturedItems(featuredResponse.data.products.map(toMobileProduct));
        }
        if (trendingResponse.data.products.length > 0) {
          setTrendingItems(trendingResponse.data.products.map(toMobileProduct));
        }
      } catch (err) {
        setBackendConnected(false);
        setError(err instanceof Error ? err.message : "Unable to load products");
        setBrowseLoading(false);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [loadBrowsePage]);

  useEffect(() => {
    async function loadTrendingSearch() {
      try {
        const response = await searchApi.trending();
        if (response.data.terms?.length) {
          setHeroTerms(response.data.terms.slice(0, 4));
        }
        if (response.data.categories?.length) {
          setArchiveTerms(response.data.categories.map((category) => category.name).slice(0, 6));
        }
      } catch {
        // Keep graceful fallback labels.
      }
    }

    loadTrendingSearch();
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasMoreBrowse || loadingMore || browseLoading) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const threshold = 260;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;

    if (isNearBottom) {
      loadBrowsePage(browsePage + 1, true);
    }
  }, [browseLoading, browsePage, hasMoreBrowse, loadBrowsePage, loadingMore]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <AppHeader
        brand
        rightSlot={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/notifications")}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
              {isAuthenticated && unreadCount > 0 ? (
                <View style={styles.alertBadge}>
                  <Text style={styles.cartBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/cart")}>
              <Ionicons name="cart-outline" size={20} color={theme.colors.textPrimary} />
              {totalItems > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        }
      />

      <LinearGradient
        colors={["rgba(59,130,246,0.20)", "rgba(139,92,246,0.12)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroGlow} />
        <View style={styles.heroInner}>
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, backendConnected ? styles.kickerDotConnected : null]} />
            <Text style={styles.kicker}>YOUR PLUG</Text>
          </View>
          <Text style={styles.heroTitle}>Find Your <Text style={styles.heroAccent}>Upgrade</Text></Text>
          <Text style={styles.heroBody}>Search the archive for premium, authentic gear built for your setup.</Text>
          <SearchEntryBar placeholder="Search accessories, brands, or device models" />
          <CategoryChipRow categories={heroTerms} onSelect={(term) => router.push({ pathname: "/search", params: { q: term } })} />
        </View>
      </LinearGradient>

      <SectionHeader title="Featured" actionLabel="View All" onActionPress={() => router.push("/search")} />
      <View style={styles.sectionIntro}>
        <Text style={styles.sectionKicker}>EDITOR'S PICK</Text>
        <Text style={styles.sectionBody}>Premium hero products and flagship accessories we want users to notice first.</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.colors.brand} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>Feed fallback active. Check `EXPO_PUBLIC_API_URL` if you want live data.</Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {featuredItems.map((product) => <ProductCard key={product.id} product={product} />)}
      </ScrollView>

      <SectionHeader title="Trending Now" actionLabel="See More" onActionPress={() => router.push("/search")} />
      <View style={[styles.sectionIntro, styles.sectionIntroTrending]}>
        <Text style={styles.sectionKickerTrending}>MOVING FAST</Text>
        <Text style={styles.sectionBody}>The products currently pulling the most demand across the catalogue.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {trendingItems.map((product) => <ProductCard key={product.id} product={product} compact />)}
      </ScrollView>

      <View style={styles.archiveCard}>
        <Text style={styles.archiveLabel}>THE ARCHIVE</Text>
        <Text style={styles.archiveTitle}>Curated collections across our hottest accessory ecosystems.</Text>
        <CategoryChipRow categories={archiveTerms} onSelect={(term) => router.push({ pathname: "/search", params: { q: term } })} />
      </View>

      <SectionHeader title="Browse The Archive" actionLabel="Search All" onActionPress={() => router.push("/search")} />
      <Text style={styles.browseIntro}>A live product feed from the full PlugNG catalogue, loaded as you scroll.</Text>
      {browseLoading ? (
        <ActivityIndicator color={theme.colors.brand} style={styles.loader} />
      ) : (
        <View style={styles.browseGrid}>
          {browseItems.map((product) => (
            <ProductCard key={product.id} product={product} compact style={styles.gridCard} />
          ))}
        </View>
      )}
      {loadingMore ? <ActivityIndicator color={theme.colors.brand} style={styles.loadMoreSpinner} /> : null}
      {!hasMoreBrowse && browseItems.length > 0 ? (
        <Text style={styles.endNote}>You’ve reached the end of the archive for now.</Text>
      ) : null}

      <TrustBadgeRow />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas
  },
  content: {
    padding: theme.spacing.xl,
    paddingTop: 64,
    paddingBottom: 120
  },
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.brand,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  alertBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F43F5E",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  cartBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: "900"
  },
  heroCard: {
    borderRadius: theme.radius.hero,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: theme.spacing.xxl
  },
  heroGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(59,130,246,0.20)",
    top: -40,
    right: -40
  },
  heroInner: {
    padding: theme.spacing.xxl
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand
  },
  kickerDotConnected: {
    backgroundColor: "#10B981"
  },
  kicker: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 38,
    lineHeight: 40,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -1,
    marginBottom: theme.spacing.md
  },
  heroAccent: {
    color: theme.colors.brand
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    maxWidth: 300
  },
  row: {
    marginBottom: theme.spacing.xxl
  },
  sectionIntro: {
    marginTop: -4,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sectionIntroTrending: {
    backgroundColor: "rgba(59,130,246,0.08)",
    borderColor: "rgba(59,130,246,0.18)"
  },
  sectionKicker: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: theme.spacing.sm
  },
  sectionKickerTrending: {
    color: "#60A5FA",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: theme.spacing.sm
  },
  sectionBody: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  browseIntro: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: theme.spacing.lg
  },
  browseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl
  },
  gridCard: {
    width: "48%",
    marginRight: 0,
    marginBottom: theme.spacing.md
  },
  archiveCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxl
  },
  archiveLabel: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: theme.spacing.sm
  },
  archiveTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: theme.spacing.lg
  },
  loader: {
    marginBottom: theme.spacing.lg
  },
  loadMoreSpinner: {
    marginBottom: theme.spacing.xl
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: theme.spacing.lg
  },
  endNote: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: theme.spacing.xxl
  }
});
