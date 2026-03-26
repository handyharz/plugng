import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { orderApi } from "@/lib/api";

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "delivered":
      return { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.24)" };
    case "cancelled":
    case "failed":
      return { color: theme.colors.rose, bg: "rgba(244,63,94,0.10)", border: "rgba(244,63,94,0.22)" };
    default:
      return { color: theme.colors.brand, bg: theme.colors.brandSoft, border: "rgba(59,130,246,0.22)" };
  }
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      try {
        const response = await orderApi.getById(id);
        setOrder(response.data.order);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.colors.brand} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <AppHeader title="Order" showBack />
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Order Not Found</Text>
            <Text style={styles.emptyBody}>We couldn't locate the details for this order.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
              <Text style={styles.actionLabel}>GO BACK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const deliveryStatusStyle = getStatusColor(order.deliveryStatus || "pending");
  const paymentStatusStyle = getStatusColor(order.paymentStatus || "pending");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppHeader title="Order" showBack />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>ORDER LEDGER</Text>
          <Text style={styles.heading}>Order Details</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: deliveryStatusStyle.bg, borderColor: deliveryStatusStyle.border }]}>
          <Text style={[styles.statusText, { color: deliveryStatusStyle.color }]}>{String(order.deliveryStatus || "pending").toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.cardLabel}>TOTAL SETTLED</Text>
        <Text style={styles.summaryAmount}>₦{Number(order.total || 0).toLocaleString()}</Text>
        <Text style={styles.summarySubtext}>Your payment ledger and shipping intelligence are fully synchronized.</Text>
      </View>

      <Text style={styles.sectionTitle}>Order Items</Text>
      {order.items?.map((item: any, index: number) => (
        <View key={`${item.sku}-${index}`} style={styles.itemCard}>
          <View style={styles.itemMediaWrap}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <View style={styles.itemImageFallback} />
            )}
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View style={styles.itemMetaRow}>
              <Text style={styles.itemMeta}>SKU {item.sku}</Text>
              <Text style={styles.itemMeta}>QTY {item.quantity}</Text>
            </View>
            {item.variantAttributes ? (
              <View style={styles.attributeRow}>
                {Object.entries(item.variantAttributes).map(([key, value]) => (
                  <Text key={key} style={styles.attributeChip}>{key}: {String(value)}</Text>
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.itemPricing}>
            <Text style={styles.itemPrice}>₦{Number(item.price * item.quantity).toLocaleString()}</Text>
            <Text style={styles.itemUnitPrice}>₦{Number(item.price).toLocaleString()} ea</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Logistics Timeline</Text>
      <View style={styles.timelineCard}>
        {(order.trackingEvents || []).slice().reverse().map((event: any, index: number) => (
          <View key={`${event.timestamp}-${index}`} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
              {index < order.trackingEvents.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineBody}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineMeta}>{new Date(event.timestamp).toLocaleString()}</Text>
                {index === 0 ? <Text style={styles.latestBadge}>LATEST UPDATE</Text> : null}
              </View>
              <Text style={[styles.timelineTitle, index === 0 && styles.timelineTitleActive]}>{String(event.status).replace("_", " ")} @ {event.location}</Text>
              <Text style={styles.timelineText}>"{event.message}"</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Financial Ledger</Text>
      <View style={styles.card}>
        <View style={styles.ledgerRow}>
          <Text style={styles.ledgerLabel}>Subtotal</Text>
          <Text style={styles.ledgerValue}>₦{Number(order.subtotal || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.ledgerRow}>
          <Text style={styles.ledgerLabel}>Delivery Fee</Text>
          <Text style={styles.ledgerValue}>₦{Number(order.deliveryFee || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.ledgerDivider} />
        <View style={styles.ledgerRow}>
          <Text style={styles.ledgerHighlight}>Total Settled</Text>
          <Text style={styles.ledgerTotal}>₦{Number(order.total || 0).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Delivery Terminal</Text>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.brand} />
          <Text style={styles.cardTitle}>Shipping Address</Text>
        </View>
        <Text style={styles.itemTitle}>{order.shippingAddress?.fullName}</Text>
        <Text style={styles.itemMeta}>{order.shippingAddress?.phone}</Text>
        <Text style={styles.bodyText}>
          {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
        </Text>
        {order.shippingAddress?.landmark ? <Text style={styles.bodyText}>Landmark: {order.shippingAddress.landmark}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Ionicons name="card-outline" size={16} color={theme.colors.brand} />
          <Text style={styles.cardTitle}>{String(order.paymentMethod).replace("_", " ").toUpperCase()}</Text>
        </View>
        <View style={[styles.statusPillInline, { backgroundColor: paymentStatusStyle.bg, borderColor: paymentStatusStyle.border }]}>
          <Text style={[styles.statusText, { color: paymentStatusStyle.color }]}>{String(order.paymentStatus || "pending").toUpperCase()}</Text>
        </View>
        {order.paymentReference ? <Text style={styles.itemMeta}>Ref: {order.paymentReference}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: theme.colors.canvas, alignItems: "center", justifyContent: "center" },
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: theme.spacing.xl },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8, marginBottom: theme.spacing.sm },
  heading: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  orderNumber: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "800", marginTop: theme.spacing.sm, letterSpacing: 1.2 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  statusPillInline: { alignSelf: "flex-start", marginTop: theme.spacing.md, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  summaryCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  cardLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  summaryAmount: { color: theme.colors.brand, fontSize: 30, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  summarySubtext: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: theme.spacing.md },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", marginBottom: theme.spacing.lg },
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg },
  itemCard: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    alignItems: "center"
  },
  itemMediaWrap: {
    width: 78,
    height: 78,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  itemImage: {
    width: "100%",
    height: "100%"
  },
  itemImageFallback: {
    flex: 1,
    backgroundColor: "rgba(59,130,246,0.18)"
  },
  itemDetails: {
    flex: 1
  },
  itemTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  itemMetaRow: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.sm, flexWrap: "wrap" },
  itemMeta: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  attributeRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.md },
  attributeChip: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  itemPricing: {
    alignItems: "flex-end"
  },
  itemPrice: { color: theme.colors.brand, fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  itemUnitPrice: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "800", marginTop: theme.spacing.sm, letterSpacing: 0.8 },
  timelineCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  timelineRow: { flexDirection: "row", gap: theme.spacing.md },
  timelineRail: { width: 18, alignItems: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.textTertiary, marginTop: 6 },
  timelineDotActive: { backgroundColor: theme.colors.brand },
  timelineLine: { width: 2, flex: 1, backgroundColor: theme.colors.border, marginTop: 6, marginBottom: 2 },
  timelineBody: { flex: 1, paddingBottom: theme.spacing.xl },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelineMeta: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  latestBadge: {
    color: theme.colors.brand,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.22)"
  },
  timelineTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800", marginTop: theme.spacing.sm, textTransform: "uppercase" },
  timelineTitleActive: { color: theme.colors.white },
  timelineText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.sm },
  iconRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 },
  bodyText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.sm },
  ledgerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  ledgerLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  ledgerValue: { color: theme.colors.brand, fontSize: 13, fontWeight: "800" },
  ledgerDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  ledgerHighlight: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6 },
  ledgerTotal: { color: theme.colors.brand, fontSize: 24, fontWeight: "900", fontStyle: "italic" },
  emptyCard: { paddingHorizontal: 24, paddingVertical: 28, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  actionButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  actionLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 }
});
