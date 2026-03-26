import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { theme } from "@/constants/theme";

export default function WishlistScreen() {
  const { isAuthenticated } = useAuth();
  const { items } = useWishlist();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Wishlist" />

      {!isAuthenticated ? (
        <View style={styles.emptyCard}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>PREMIUM ACCESS</Text>
          </View>
          <Text style={styles.emptyTitle}>Sign In To Use Wishlist</Text>
          <Text style={styles.emptyBody}>Save products you like, build your shortlist, and come back to them anytime.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
            <Text style={styles.buttonLabel}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={34} color={theme.colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
          <Text style={styles.emptyBody}>Products you save will show up here as your personal shortlist.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")}>
            <Text style={styles.shopButtonLabel}>BROWSE PLUG</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.headerBlock}>
            <Text style={styles.kicker}>CURATED SHORTLIST</Text>
            <Text style={styles.heading}>Saved Items</Text>
            <Text style={styles.subheading}>{items.length} item{items.length === 1 ? "" : "s"} waiting in your archive.</Text>
          </View>
          <View style={styles.resultsList}>
            {items.map((product) => (
              <ProductCard key={product.id} product={product} compact style={styles.gridCard} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  headerBlock: { marginBottom: theme.spacing.xl },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  kickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.brand },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.sm },
  resultsList: {
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
  emptyCard: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center"
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -0.6,
    textAlign: "center"
  },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, textAlign: "center" },
  button: {
    marginTop: theme.spacing.xl,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    width: "100%"
  },
  buttonLabel: { color: theme.colors.white, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  shopButton: {
    marginTop: theme.spacing.xl,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.textPrimary,
    width: "100%"
  },
  shopButtonLabel: { color: theme.colors.canvas, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 }
});
