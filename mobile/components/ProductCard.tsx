import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "react-native";
import { Alert, Pressable, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Product } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { theme } from "@/constants/theme";

type Props = {
  product: Product;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ProductCard({ product, compact = false, style }: Props) {
  const { isAuthenticated } = useAuth();
  const { itemIds, toggle } = useWishlist();
  const isWishlisted = itemIds.has(product.id);
  const savings = product.compareAtPrice ? Math.max(product.compareAtPrice - product.price, 0) : 0;

  async function handleWishlistToggle() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await toggle(product);
    } catch (error) {
      Alert.alert("Wishlist update failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact, style]}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Pressable
        style={styles.wishlistButton}
        onPress={(event) => {
          event.stopPropagation();
          handleWishlistToggle();
        }}
      >
        <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={18} color={isWishlisted ? theme.colors.rose : theme.colors.textPrimary} />
      </Pressable>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={[styles.image, compact && styles.imageCompact]} resizeMode="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: product.imageColor }, compact && styles.imageCompact]} />
      )}
      <Text style={styles.category}>{product.category.toUpperCase()}</Text>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
      {(product.compareAtPrice || product.walletPerk) ? (
        <View style={styles.pricingMeta}>
          {product.compareAtPrice ? (
            <View style={styles.valuePill}>
              <Text style={styles.compare}>₦{product.compareAtPrice.toLocaleString()}</Text>
              {savings > 0 ? <Text style={styles.savings}>SAVE ₦{savings.toLocaleString()}</Text> : null}
            </View>
          ) : null}
          {product.walletPerk ? (
            <View style={styles.perkPill}>
              <Ionicons name="flash-outline" size={12} color={theme.colors.brand} />
              <Text style={styles.perk}>{product.walletPerk}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    position: "relative"
  },
  cardCompact: {
    width: 180
  },
  image: {
    height: 150,
    width: "100%",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg
  },
  imageCompact: {
    height: 120
  },
  wishlistButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(9,9,9,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  category: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: theme.spacing.sm
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21
  },
  price: {
    color: theme.colors.brand,
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: theme.spacing.md
  },
  compare: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textDecorationLine: "line-through"
  },
  pricingMeta: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  valuePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  savings: {
    color: theme.colors.amber,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1
  },
  perkPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)"
  },
  perk: {
    color: theme.colors.brand,
    fontSize: 11,
    fontWeight: "800"
  }
});
