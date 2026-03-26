import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { useCart } from "@/context/CartContext";
import { theme } from "@/constants/theme";
import { orderApi } from "@/lib/api";

export default function CheckoutSuccessScreen() {
  const { reference } = useLocalSearchParams<{ reference: string }>();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference || hasRun.current) return;
      hasRun.current = true;

      try {
        const response = await orderApi.verify(reference);
        setOrderNumber(response.data.order?.orderNumber || "");
        clearCart();
        setStatus("success");
      } catch {
        setStatus("failed");
      }
    }

    verifyPayment();
  }, [clearCart, reference]);

  if (status === "loading") {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={theme.colors.brand} size="large" />
        <Text style={styles.loadingText}>Verifying transaction...</Text>
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <AppHeader title="Checkout" showBack />
          <View style={styles.card}>
            <Ionicons name="alert-circle-outline" size={42} color={theme.colors.rose} />
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.body}>We couldn't confirm your payment yet. You can try again from Orders later.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/orders")}>
              <Text style={styles.primaryLabel}>GO TO ORDERS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <AppHeader title="Checkout" showBack />
        <View style={styles.card}>
          <Ionicons name="checkmark-circle-outline" size={54} color={theme.colors.emerald} />
          <Text style={styles.title}>Order Locked In</Text>
          <Text style={styles.body}>Your payment has been verified and your order is now secured.</Text>
          {orderNumber ? <Text style={styles.orderMeta}>Order Number: {orderNumber}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/orders")}>
            <Text style={styles.primaryLabel}>GO TO MY ORDERS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.secondaryLabel}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerScreen: { flex: 1, backgroundColor: theme.colors.canvas, justifyContent: "center", alignItems: "center", padding: theme.spacing.xl },
  loadingText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6, marginTop: theme.spacing.lg },
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { flex: 1, padding: theme.spacing.xl, paddingTop: 64, justifyContent: "center" },
  card: { backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.hero, paddingHorizontal: 24, paddingVertical: 28, alignItems: "center" },
  title: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.lg },
  body: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, textAlign: "center" },
  orderMeta: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "800", marginTop: theme.spacing.lg, letterSpacing: 0.4 },
  primaryButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", alignSelf: "stretch" },
  primaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  secondaryButton: { marginTop: theme.spacing.md, height: 52, borderRadius: 18, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center", alignSelf: "stretch" },
  secondaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 1.6 }
});
