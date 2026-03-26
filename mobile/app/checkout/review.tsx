import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { theme } from "@/constants/theme";
import { orderApi } from "@/lib/api";

const CHECKOUT_SUCCESS_CALLBACK_URL = "plugng://checkout/success";

export default function CheckoutReviewScreen() {
  const { addressId, paymentMethod } = useLocalSearchParams<{ addressId: string; paymentMethod: "wallet" | "card" | "bank_transfer" }>();
  const { user, refreshUser } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedAddress = useMemo(
    () => user?.addresses.find((address) => address._id === addressId),
    [addressId, user?.addresses]
  );
  const subtotal = totalAmount;
  const deliveryFee = selectedAddress?.state?.toLowerCase() === "lagos" || selectedAddress?.state?.toLowerCase() === "abuja" || selectedAddress?.state?.toLowerCase() === "fct" ? 1200 : 2000;
  const appliedDeliveryFee = subtotal >= 5000 ? 0 : deliveryFee;
  const total = subtotal + appliedDeliveryFee;

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      Alert.alert("Missing address", "Go back and select a shipping address.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await orderApi.create({
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethod || "wallet",
        callbackUrl: CHECKOUT_SUCCESS_CALLBACK_URL
      });

      if (response.data.paymentUrl) {
        await Linking.openURL(response.data.paymentUrl);
        router.replace({ pathname: "/checkout/success", params: { reference: response.data.reference || "" } });
        return;
      }

      clearCart();
      await refreshUser();
      Alert.alert("Order placed", "Your order has been created successfully.");
      router.replace("/orders");
    } catch (error) {
      Alert.alert("Could not place order", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleConfirmTap() {
    if (submitting) return;
    setConfirmOpen(true);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Checkout" showBack />
        <Text style={styles.step}>STEP 3 OF 3</Text>
        <Text style={styles.heading}>Review Ledger</Text>

        <View style={styles.heroCard}>
          <Text style={styles.kicker}>FINAL CHECK</Text>
          <Text style={styles.heroTitle}>Confirm The Manifest</Text>
          <Text style={styles.heroBody}>Review your items, payment method, delivery route, and final total before we deploy the order.</Text>
        </View>

        {[
          ["Items", `${items.length} item${items.length === 1 ? "" : "s"} ready for checkout`],
          ["Address", selectedAddress ? `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state}` : "No address selected"],
          ["Payment", String(paymentMethod || "wallet").replace("_", " ").toUpperCase()]
        ].map(([title, body]) => (
          <View key={title} style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardBody}>{body}</Text>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cost Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Delivery</Text>
            <Text style={styles.breakdownValue}>₦{appliedDeliveryFee.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.total}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>
      <StickyBottomBar primaryLabel={submitting ? "PLACING ORDER..." : "Place Order"} priceLabel={`₦${total.toLocaleString()}`} onPrimaryPress={handleConfirmTap} />
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissLayer} onPress={() => setConfirmOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>FINAL CHECK</Text>
            <Text style={styles.modalTitle}>Confirm This Order</Text>
            <Text style={styles.modalBody}>Please confirm your payment method, delivery address, and total before we place the order.</Text>

            <View style={styles.modalInfoCard}>
              <Text style={styles.modalInfoLabel}>PAYMENT</Text>
              <Text style={styles.modalInfoValue}>{String(paymentMethod || "wallet").replace("_", " ").toUpperCase()}</Text>
            </View>

            <View style={styles.modalInfoCard}>
              <Text style={styles.modalInfoLabel}>DELIVERY</Text>
              <Text style={styles.modalInfoValue}>{selectedAddress ? `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state}` : "No address selected"}</Text>
            </View>

            <View style={styles.modalInfoCard}>
              <Text style={styles.modalInfoLabel}>TOTAL</Text>
              <Text style={styles.modalTotal}>₦{total.toLocaleString()}</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondaryButton} onPress={() => setConfirmOpen(false)}>
                <Text style={styles.modalSecondaryLabel}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={[styles.modalPrimaryButton, submitting && styles.modalPrimaryButtonDisabled]}
                onPress={async () => {
                  setConfirmOpen(false);
                  await handlePlaceOrder();
                }}
                disabled={submitting}
              >
                <Text style={styles.modalPrimaryLabel}>{submitting ? "PLACING..." : "CONFIRM ORDER"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  step: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm, marginBottom: theme.spacing.xl },
  heroCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  heroBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  cardBody: { color: theme.colors.textSecondary, fontSize: 14, marginTop: theme.spacing.sm, lineHeight: 20 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: theme.spacing.md },
  breakdownLabel: { color: theme.colors.textSecondary, fontSize: 14 },
  breakdownValue: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "800" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.lg },
  total: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900" },
  totalValue: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "900", fontStyle: "italic" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  modalDismissLayer: { flex: 1 },
  modalCard: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.colors.border },
  modalKicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  modalTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  modalBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  modalInfoCard: { padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  modalInfoLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  modalInfoValue: { color: theme.colors.textPrimary, fontSize: 14, lineHeight: 21, fontWeight: "800", marginTop: theme.spacing.sm },
  modalTotal: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  modalActions: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.lg },
  modalSecondaryButton: { flex: 1, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  modalSecondaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 1.6 },
  modalPrimaryButton: { flex: 1, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  modalPrimaryButtonDisabled: { opacity: 0.6 },
  modalPrimaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 }
});
