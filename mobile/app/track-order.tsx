import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { trackingApi } from "@/lib/api";

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "delivered":
      return { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.24)" };
    case "cancelled":
    case "failed":
      return { color: theme.colors.rose, bg: "rgba(244,63,94,0.10)", border: "rgba(244,63,94,0.22)" };
    case "shipped":
      return { color: theme.colors.brand, bg: theme.colors.brandSoft, border: "rgba(59,130,246,0.22)" };
    default:
      return { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" };
  }
}

export default function TrackOrderScreen() {
  const [orderNumber, setOrderNumber] = useState("");
  const [verifyMethod, setVerifyMethod] = useState<"email" | "phone">("email");
  const [credential, setCredential] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const statusStyle = getStatusColor(trackingData?.deliveryStatus || "pending");
  const timelineEvents = useMemo(
    () => (trackingData?.trackingEvents || []).slice().reverse(),
    [trackingData?.trackingEvents]
  );

  async function handleLookup() {
    const normalizedOrderNumber = orderNumber.trim().toUpperCase();
    if (!normalizedOrderNumber) return;

    try {
      setLoading(true);
      setLookupError("");
      setVerifyError("");
      const response = await trackingApi.getPublicTracking(normalizedOrderNumber);
      setTrackingData(response.data);
    } catch (error) {
      setTrackingData(null);
      setLookupError(error instanceof Error ? error.message : "Please check the order number and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    const normalizedOrderNumber = orderNumber.trim().toUpperCase();
    const normalizedCredential = credential.trim();
    if (!normalizedOrderNumber || !normalizedCredential) return;

    try {
      setVerifying(true);
      setVerifyError("");
      const response = await trackingApi.verifyAndTrack(normalizedOrderNumber, {
        email: verifyMethod === "email" ? normalizedCredential : undefined,
        phone: verifyMethod === "phone" ? normalizedCredential : undefined
      });
      setTrackingData(response.data);
      setCredential("");
      setShowVerifyModal(false);
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Verification failed. The details did not match our records.");
    } finally {
      setVerifying(false);
    }
  }

  function resetTracking() {
    setTrackingData(null);
    setLookupError("");
    setVerifyError("");
    setCredential("");
  }

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <AppHeader title="Track Order" showBack />

        {!trackingData ? (
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.heroIconWrap}>
              <Ionicons name="cube-outline" size={42} color={theme.colors.brand} />
            </View>
            <Text style={styles.kicker}>LOGISTICS INTEL</Text>
            <Text style={styles.heroTitle}>Track Your Order</Text>
            <Text style={styles.heroBody}>
              Enter your order number to open the public delivery ledger. Verify with your email or phone later to unlock full pricing and item detail.
            </Text>

            <Text style={styles.label}>ORDER NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="ORD-123456"
              placeholderTextColor={theme.colors.textTertiary}
              value={orderNumber}
              onChangeText={(value) => setOrderNumber(value.toUpperCase())}
              autoCapitalize="characters"
            />

            {lookupError ? (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.colors.rose} />
                <View style={styles.errorBody}>
                  <Text style={styles.errorTitle}>Order Not Found</Text>
                  <Text style={styles.errorText}>{lookupError}</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleLookup} disabled={loading}>
              {loading ? <ActivityIndicator color={theme.colors.textPrimary} /> : <Text style={styles.primaryLabel}>TRACK PACKAGE</Text>}
            </TouchableOpacity>

            <View style={styles.heroFooter}>
              <View style={styles.helpPill}>
                <View style={styles.helpDot} />
                <Text style={styles.helpText}>Use the order number from your confirmation email or orders tab.</Text>
              </View>
              <Text style={styles.helpCaption}>No login required. Real-time movement. Secure verification if you need full details.</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <TouchableOpacity style={styles.backPill} onPress={resetTracking}>
                <Ionicons name="chevron-back" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.backPillText}>TRACK ANOTHER ORDER</Text>
              </TouchableOpacity>

              <View style={styles.headerRow}>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.headerTitle}>
                    Order <Text style={styles.headerAccent}>#{trackingData.orderNumber}</Text>
                  </Text>
                  <Text style={styles.headerMeta}>{trackingData.verified ? "VERIFIED TRACKING" : "PUBLIC TRACKING"}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                  <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
                    {String(trackingData.deliveryStatus || "pending").toUpperCase()}
                  </Text>
                </View>
              </View>

              {!trackingData.verified ? (
                <TouchableOpacity style={styles.verifyTrigger} onPress={() => setShowVerifyModal(true)}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.colors.brand} />
                  <Text style={styles.verifyTriggerText}>VIEW FULL DETAILS</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {trackingData.estimatedDelivery ? (
              <View style={styles.summaryCard}>
                <Text style={styles.cardLabel}>ESTIMATED DELIVERY</Text>
                <Text style={styles.summaryAmount}>
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </Text>
                <Text style={styles.summarySubtext}>
                  Your shipment is active in our logistics ledger and updates will continue to appear here as the package moves.
                </Text>
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Logistics Timeline</Text>
            <View style={styles.timelineCard}>
              {timelineEvents.length > 0 ? (
                timelineEvents.map((event: any, index: number) => (
                  <View key={`${event.timestamp}-${index}`} style={styles.timelineRow}>
                    <View style={styles.timelineRail}>
                      <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
                      {index < timelineEvents.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>
                    <View style={styles.timelineBody}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineMeta}>{new Date(event.timestamp).toLocaleString()}</Text>
                        {index === 0 ? <Text style={styles.latestBadge}>LATEST UPDATE</Text> : null}
                      </View>
                      <Text style={[styles.timelineTitle, index === 0 && styles.timelineTitleActive]}>
                        {String(event.status).replace(/_/g, " ")} @ {event.location}
                      </Text>
                      <Text style={styles.timelineText}>"{event.message}"</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={38} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyStateTitle}>No Tracking Events Yet</Text>
                  <Text style={styles.emptyStateBody}>The order has been created, but no movement has been logged yet.</Text>
                </View>
              )}
            </View>

            {trackingData.verified && trackingData.items?.length ? (
              <>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {trackingData.items.map((item: any, index: number) => (
                  <View key={`${item.sku || item.name}-${index}`} style={styles.itemCard}>
                    <View style={styles.itemMediaWrap}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.itemImageFallback} />
                      )}
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      <Text style={styles.itemMeta}>QTY {item.quantity}</Text>
                    </View>
                    <View style={styles.itemPricing}>
                      <Text style={styles.itemPrice}>₦{Number(item.price * item.quantity).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Delivery Terminal</Text>
            <View style={styles.card}>
              <View style={styles.iconRow}>
                <Ionicons name="location-outline" size={16} color={theme.colors.brand} />
                <Text style={styles.cardTitle}>Delivery Address</Text>
              </View>
              <Text style={styles.addressName}>{trackingData.shippingAddress?.fullName}</Text>
              <Text style={styles.addressMeta}>{trackingData.shippingAddress?.phone}</Text>
              <Text style={styles.addressBody}>
                {trackingData.shippingAddress?.address}, {trackingData.shippingAddress?.city}, {trackingData.shippingAddress?.state}
              </Text>
              {!trackingData.verified ? (
                <View style={styles.partialInfoPill}>
                  <Ionicons name="lock-closed-outline" size={12} color="#F59E0B" />
                  <Text style={styles.partialInfoText}>PARTIAL INFO. VERIFY TO SEE FULL DETAILS.</Text>
                </View>
              ) : null}
            </View>

            {trackingData.verified ? (
              <>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.card}>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Subtotal</Text>
                    <Text style={styles.ledgerValue}>₦{Number(trackingData.subtotal || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Delivery Fee</Text>
                    <Text style={styles.ledgerValue}>₦{Number(trackingData.deliveryFee || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.ledgerDivider} />
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerHighlight}>Total</Text>
                    <Text style={styles.ledgerTotal}>₦{Number(trackingData.total || 0).toLocaleString()}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <Modal visible={showVerifyModal} transparent animationType="fade" onRequestClose={() => setShowVerifyModal(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissLayer} onPress={() => setShowVerifyModal(false)} />
          <View style={styles.modalCard}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowVerifyModal(false)}>
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Verify Identity</Text>
            <Text style={styles.modalBody}>
              Enter the email or phone number used for the order to unlock full pricing, item detail, and the full delivery record.
            </Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, verifyMethod === "email" && styles.toggleButtonActive]}
                onPress={() => setVerifyMethod("email")}
              >
                <Text style={[styles.toggleLabel, verifyMethod === "email" && styles.toggleLabelActive]}>EMAIL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, verifyMethod === "phone" && styles.toggleButtonActive]}
                onPress={() => setVerifyMethod("phone")}
              >
                <Text style={[styles.toggleLabel, verifyMethod === "phone" && styles.toggleLabelActive]}>PHONE</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{verifyMethod === "email" ? "EMAIL ADDRESS" : "PHONE NUMBER"}</Text>
            <TextInput
              style={styles.input}
              placeholder={verifyMethod === "email" ? "your@email.com" : "+234..."}
              placeholderTextColor={theme.colors.textTertiary}
              value={credential}
              onChangeText={setCredential}
              autoCapitalize="none"
              keyboardType={verifyMethod === "email" ? "email-address" : "phone-pad"}
            />

            {verifyError ? (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.colors.rose} />
                <View style={styles.errorBody}>
                  <Text style={styles.errorTitle}>Verification Failed</Text>
                  <Text style={styles.errorText}>{verifyError}</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerify} disabled={verifying}>
              {verifying ? <ActivityIndicator color={theme.colors.textPrimary} /> : <Text style={styles.primaryLabel}>VERIFY & VIEW DETAILS</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  heroCard: {
    position: "relative",
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.12)"
  },
  heroIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.22)",
    marginBottom: theme.spacing.xl
  },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8, marginBottom: theme.spacing.sm },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  heroBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  label: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: theme.spacing.sm },
  input: {
    height: 54,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 15,
    fontWeight: "700"
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl
  },
  primaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  heroFooter: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
  helpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  helpDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: theme.colors.brand },
  helpText: { flex: 1, color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  helpCaption: { color: theme.colors.textTertiary, fontSize: 11, lineHeight: 18, fontWeight: "700" },
  headerSection: { marginBottom: theme.spacing.xl },
  backPill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: theme.spacing.xs, marginBottom: theme.spacing.lg },
  backPillText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.md },
  headerTextGroup: { flex: 1 },
  headerTitle: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  headerAccent: { color: theme.colors.brand },
  headerMeta: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.6, marginTop: theme.spacing.sm },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  statusPillText: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  verifyTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    alignSelf: "flex-start",
    marginTop: theme.spacing.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.22)"
  },
  verifyTriggerText: { color: theme.colors.brand, fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  summaryCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxl
  },
  cardLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  summaryAmount: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  summarySubtext: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: theme.spacing.md },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", marginBottom: theme.spacing.lg },
  timelineCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxl
  },
  timelineRow: { flexDirection: "row", gap: theme.spacing.md },
  timelineRail: { width: 18, alignItems: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.textTertiary, marginTop: 6 },
  timelineDotActive: { backgroundColor: theme.colors.brand },
  timelineLine: { width: 2, flex: 1, backgroundColor: theme.colors.border, marginTop: 6, marginBottom: 2 },
  timelineBody: { flex: 1, paddingBottom: theme.spacing.xl },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.md },
  timelineMeta: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, flex: 1 },
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
  emptyState: { paddingVertical: theme.spacing.xxl, alignItems: "center" },
  emptyStateTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.lg, textTransform: "uppercase" },
  emptyStateBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: theme.spacing.sm },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  itemMediaWrap: {
    width: 76,
    height: 76,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  itemImage: { width: "100%", height: "100%" },
  itemImageFallback: { flex: 1, backgroundColor: "rgba(59,130,246,0.18)" },
  itemDetails: { flex: 1 },
  itemTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  itemMeta: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "800", marginTop: theme.spacing.sm, letterSpacing: 1 },
  itemPricing: { alignItems: "flex-end" },
  itemPrice: { color: theme.colors.brand, fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  card: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 },
  addressName: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.lg },
  addressMeta: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "800", marginTop: theme.spacing.sm, letterSpacing: 1 },
  addressBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  partialInfoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.10)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.22)"
  },
  partialInfoText: { color: "#F59E0B", fontSize: 10, fontWeight: "900", letterSpacing: 1.2, flex: 1 },
  ledgerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
  ledgerLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  ledgerValue: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "800" },
  ledgerDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  ledgerHighlight: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6 },
  ledgerTotal: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "900", fontStyle: "italic" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.76)", justifyContent: "flex-end" },
  modalDismissLayer: { flex: 1 },
  modalCard: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: theme.colors.canvas,
    borderTopWidth: 1,
    borderColor: theme.colors.border
  },
  handle: { alignSelf: "center", width: 54, height: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.14)", marginBottom: theme.spacing.lg },
  modalClose: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)"
  },
  modalTitle: { color: theme.colors.textPrimary, fontSize: 26, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  modalBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl, paddingRight: 28 },
  toggleRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: 6,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  toggleButton: { flex: 1, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  toggleButtonActive: { backgroundColor: theme.colors.brandSoft },
  toggleLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  toggleLabelActive: { color: theme.colors.brand },
  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(244,63,94,0.08)",
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.22)"
  },
  errorBody: { flex: 1 },
  errorTitle: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 },
  errorText: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 }
});
