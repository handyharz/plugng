import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

function getOrderTone(status: string) {
  switch (status) {
    case "delivered":
      return {
        color: theme.colors.emerald,
        bg: "rgba(16,185,129,0.10)",
        icon: "checkmark-circle-outline"
      };
    case "cancelled":
      return {
        color: theme.colors.rose,
        bg: "rgba(244,63,94,0.10)",
        icon: "alert-circle-outline"
      };
    default:
      return {
        color: theme.colors.brand,
        bg: theme.colors.brandSoft,
        icon: "time-outline"
      };
  }
}

function OrderCard({ order }: { order: any }) {
  const tone = getOrderTone(order.deliveryStatus || "pending");

  return (
    <View style={styles.orderShell}>
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push(`/order/${order._id}`)}>
        <View style={styles.cardTopRow}>
          <View style={[styles.orderIconWrap, { backgroundColor: tone.bg }]}>
            <Ionicons name={tone.icon as any} size={26} color={tone.color} />
          </View>
          <View style={styles.orderMain}>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>ORD-{order.orderNumber}</Text>
              <View style={styles.dot} />
              <Text style={styles.meta}>{new Date(order.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.title}>
              {order.items?.[0]?.name || "Order"} {order.items?.length > 1 ? `+ ${order.items.length - 1} more` : ""}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusChip, { backgroundColor: order.paymentStatus === "paid" ? "rgba(16,185,129,0.14)" : "rgba(245,158,11,0.14)" }]}>
                <Text style={[styles.statusChipText, { color: order.paymentStatus === "paid" ? theme.colors.emerald : theme.colors.amber }]}>
                  PAYMENT: {String(order.paymentStatus || "pending").toUpperCase()}
                </Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: tone.bg }]}>
                <Text style={[styles.statusChipText, { color: tone.color }]}>
                  SHIPMENT: {String(order.deliveryStatus || "pending").toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardBottomRow}>
          <View>
            <Text style={styles.totalLabel}>ORDER TOTAL</Text>
            <Text style={styles.amount}>₦{Number(order.total || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.orderActions}>
            <TouchableOpacity onPress={() => router.push(`/order/${order._id}`)}>
              <Text style={styles.actionLink}>FULL DETAILS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/track-order")}>
              <Text style={styles.actionLinkMuted}>TRACK MANIFEST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadOrders() {
        if (!isAuthenticated) {
          setOrders([]);
          return;
        }

        const { orderApi } = await import("@/lib/api");
        try {
          const response = await orderApi.getMyOrders({ limit: 10, page: 1 });
          setOrders(response.data.orders);
        } catch {
          setOrders([]);
        }
      }

      loadOrders();
    }, [isAuthenticated])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Orders" />
      {!isAuthenticated ? (
        <View style={styles.emptyCard}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>PREMIUM ACCESS</Text>
          </View>
          <Text style={styles.emptyTitle}>Sign In To View Your Orders</Text>
          <Text style={styles.emptyBody}>Track deliveries, confirm payment progress, and keep every purchase in one place.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/login")}>
            <Text style={styles.emptyButtonLabel}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="bag-handle-outline" size={34} color={theme.colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Purchases Detected</Text>
          <Text style={styles.emptyBody}>Your completed checkout orders will appear here as soon as they’re logged.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")}>
            <Text style={styles.shopButtonLabel}>MANIFEST SHOP</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Order History</Text>
            <TouchableOpacity onPress={() => router.push("/track-order")}>
              <Text style={styles.headerAction}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
          {orders.map((order) => <OrderCard key={order._id} order={order} />)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  emptyCard: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center"
  },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  kickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.brand },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center", marginBottom: theme.spacing.lg },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", letterSpacing: -0.6, textAlign: "center" },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, textAlign: "center" },
  emptyButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", width: "100%" },
  emptyButtonLabel: { color: theme.colors.white, fontWeight: "900", fontSize: 12, letterSpacing: 1.8 },
  shopButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.brand, width: "100%" },
  shopButtonLabel: { color: theme.colors.textPrimary, fontWeight: "900", fontSize: 12, letterSpacing: 1.8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.xl },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  headerAction: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  orderShell: { marginBottom: theme.spacing.lg },
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  cardTopRow: { flexDirection: "row", gap: theme.spacing.lg },
  orderIconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  orderMain: { flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, flexWrap: "wrap" },
  meta: { color: theme.colors.textTertiary, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  dot: { width: 4, height: 4, borderRadius: 999, backgroundColor: theme.colors.textTertiary },
  title: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm, textTransform: "uppercase" },
  statusRow: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap", marginTop: theme.spacing.md },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusChipText: { fontSize: 8, fontWeight: "900", letterSpacing: 1.2 },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: theme.spacing.xl, gap: theme.spacing.lg },
  totalLabel: { color: theme.colors.textTertiary, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  amount: { color: theme.colors.brand, fontSize: 28, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  orderActions: { alignItems: "flex-end", gap: theme.spacing.sm },
  actionLink: { color: theme.colors.brand, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  actionLinkMuted: { color: theme.colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 }
});
