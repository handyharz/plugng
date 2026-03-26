import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { WalletPromoCard } from "@/components/WalletPromoCard";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { theme } from "@/constants/theme";

export default function CartScreen() {
  const { isAuthenticated, user } = useAuth();
  const { items, refresh, removeFromCart, updateQuantity, totalAmount } = useCart();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [isAuthenticated, refresh])
  );

  async function removeItem(productId: string) {
    try {
      await removeFromCart(productId);
    } catch (error) {
      Alert.alert("Could not update cart", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function changeQuantity(productId: string, quantity: number) {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      Alert.alert("Could not update quantity", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Cart" showBack />
        {!isAuthenticated ? (
          <View style={styles.emptyCard}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>PREMIUM ACCESS</Text>
            </View>
            <Text style={styles.emptyTitle}>Sign In To Sync Your Cart</Text>
            <Text style={styles.emptyBody}>Keep your cart across devices, unlock wallet checkout, and continue where you stopped.</Text>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push("/login")}>
              <Text style={styles.authButtonLabel}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your Cart Is Empty</Text>
            <Text style={styles.emptyBody}>Start shopping to add products here.</Text>
            <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")}>
              <Text style={styles.shopButtonLabel}>MANIFEST SHOP</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerBlock}>
              <Text style={styles.kicker}>CHECKOUT STAGING</Text>
              <Text style={styles.heading}>Cart Archive</Text>
              <Text style={styles.subheading}>{items.length} item{items.length === 1 ? "" : "s"} ready to move into checkout.</Text>
            </View>

            {items.map((product) => (
              <View key={product.id} style={styles.item}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: product.imageColor }]} />
                )}
                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  <Text style={styles.itemMeta}>{product.category}</Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => changeQuantity(product.id, product.quantity - 1)}>
                      <Text style={styles.quantityButtonLabel}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{product.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => changeQuantity(product.id, product.quantity + 1)}>
                      <Text style={styles.quantityButtonLabel}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>₦{(product.price * product.quantity).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => removeItem(product.id)}>
                      <Text style={styles.removeText}>REMOVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.utilityCard}>
              <Text style={styles.utilityTitle}>Apply Coupon</Text>
              <TouchableOpacity style={styles.utilityAction}>
                <Text style={styles.utilityActionText}>ENTER CODE</Text>
              </TouchableOpacity>
            </View>

            <WalletPromoCard
              balance={`₦${(user?.wallet?.balance || 0).toLocaleString()}`}
              onTopUpPress={() => router.push("/wallet")}
              onUseWalletPress={() => router.push("/checkout")}
            />

            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>ORDER LEDGER</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLine}>Subtotal</Text>
                <Text style={styles.summaryValue}>₦{totalAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLine}>Delivery</Text>
                <Text style={styles.summaryValue}>Calculated at checkout</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.total}>Total</Text>
                <Text style={styles.totalValue}>₦{totalAmount.toLocaleString()}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <StickyBottomBar
        primaryLabel="Proceed to Checkout"
        priceLabel={`₦${totalAmount.toLocaleString()}`}
        onPrimaryPress={() => isAuthenticated ? router.push("/checkout") : router.push("/login")}
      />
    </View>
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
  item: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  thumb: { width: 92, height: 92, borderRadius: theme.radius.lg },
  itemBody: { flex: 1 },
  itemName: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  itemMeta: { color: theme.colors.textSecondary, fontSize: 11, marginTop: theme.spacing.sm, fontWeight: "800", letterSpacing: 1.1 },
  itemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: theme.spacing.md },
  itemPrice: { color: theme.colors.brand, fontSize: 22, fontWeight: "900", fontStyle: "italic" },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  quantityButton: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  quantityButtonLabel: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  quantityValue: { minWidth: 24, color: theme.colors.textPrimary, fontSize: 14, fontWeight: "900", textAlign: "center" },
  utilityCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  utilityTitle: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: 16 },
  utilityAction: { paddingHorizontal: theme.spacing.lg, paddingVertical: 10, borderRadius: theme.radius.md, backgroundColor: theme.colors.brandSoft },
  utilityActionText: { color: theme.colors.brand, fontWeight: "800", fontSize: 12 },
  emptyCard: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxl,
    alignItems: "center"
  },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", letterSpacing: -0.6, textAlign: "center" },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, textAlign: "center" },
  authButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", width: "100%" },
  authButtonLabel: { color: theme.colors.white, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  shopButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.textPrimary, width: "100%" },
  shopButtonLabel: { color: theme.colors.canvas, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  summary: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  summaryLabel: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: theme.spacing.md },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  summaryLine: { color: theme.colors.textSecondary, fontSize: 14 },
  summaryValue: { color: theme.colors.brand, fontSize: 13, fontWeight: "800" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  total: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  totalValue: { color: theme.colors.brand, fontSize: 24, fontWeight: "900", fontStyle: "italic" },
  removeText: { color: theme.colors.rose, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }
});
