import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { theme } from "@/constants/theme";

export default function CheckoutPaymentScreen() {
  const { addressId } = useLocalSearchParams<{ addressId: string }>();
  const { user } = useAuth();
  const { totalAmount, items } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | "bank_transfer">("wallet");
  const walletBalance = user?.wallet?.balance || 0;
  const selectedAddress = useMemo(
    () => user?.addresses.find((address) => address._id === addressId),
    [addressId, user?.addresses]
  );
  const deliveryFee = selectedAddress?.state?.toLowerCase() === "lagos" || selectedAddress?.state?.toLowerCase() === "abuja" || selectedAddress?.state?.toLowerCase() === "fct" ? 1200 : 2000;
  const total = totalAmount >= 5000 ? totalAmount : totalAmount + deliveryFee;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Checkout" showBack />
        <Text style={styles.step}>STEP 2 OF 3</Text>
        <Text style={styles.heading}>Payment Rail</Text>

        <View style={styles.heroCard}>
          <Text style={styles.kicker}>PAYMENT CONTROL</Text>
          <Text style={styles.heroTitle}>Choose Settlement Method</Text>
          <Text style={styles.heroBody}>Wallet is fastest, card uses Paystack checkout, and bank transfer creates an order before settlement.</Text>
        </View>

        {[
          { key: "wallet", title: "Wallet", body: `Balance: ₦${walletBalance.toLocaleString()}` },
          { key: "card", title: "Card", body: "Pay securely with Paystack checkout" },
          { key: "bank_transfer", title: "Bank Transfer", body: "Create order and complete payment after transfer" }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, paymentMethod === item.key && styles.cardActive]}
            activeOpacity={0.9}
            onPress={() => setPaymentMethod(item.key as "wallet" | "card" | "bank_transfer")}
          >
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
              <View style={[styles.radio, paymentMethod === item.key && styles.radioActive]} />
            </View>
          </TouchableOpacity>
        ))}

        {selectedAddress ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Delivering To</Text>
            <Text style={styles.noticeText}>{selectedAddress.fullName}</Text>
            <Text style={styles.noticeText}>{selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state}</Text>
          </View>
        ) : null}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Order Summary</Text>
          <Text style={styles.noticeText}>Items: {items.length} item{items.length === 1 ? "" : "s"}</Text>
          <Text style={styles.noticeText}>Subtotal: ₦{totalAmount.toLocaleString()}</Text>
          <Text style={styles.noticeText}>Delivery: ₦{(totalAmount >= 5000 ? 0 : deliveryFee).toLocaleString()}</Text>
          <Text style={styles.noticeTotal}>Total: ₦{total.toLocaleString()}</Text>
        </View>
      </ScrollView>
      <StickyBottomBar
        primaryLabel="Continue to Review"
        priceLabel={`₦${total.toLocaleString()}`}
        onPrimaryPress={() => router.push({ pathname: "/checkout/review", params: { addressId, paymentMethod } })}
      />
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
  cardActive: { borderColor: theme.colors.brand, backgroundColor: theme.colors.brandSoft },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.lg, alignItems: "center" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.colors.borderStrong },
  radioActive: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  cardBody: { color: theme.colors.textSecondary, fontSize: 14, marginTop: theme.spacing.sm, lineHeight: 20, maxWidth: 240 },
  notice: { marginTop: theme.spacing.xl, padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  noticeTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "800", marginBottom: theme.spacing.sm },
  noticeText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 },
  noticeTotal: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.md }
});
