import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { WalletPromoCard } from "@/components/WalletPromoCard";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useWishlist } from "@/context/WishlistContext";
import { theme } from "@/constants/theme";
import { orderApi, ticketApi } from "@/lib/api";

function getTierTarget(tier?: string) {
  if (tier === "Master") return 1000000;
  if (tier === "Elite") return 1000000;
  return 250000;
}

function getNextTierLabel(tier?: string) {
  if (tier === "Master") return "MAX TIER";
  if (tier === "Elite") return "MASTER";
  return "ELITE";
}

export default function AccountScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const { items: wishlistItems, refresh: refreshWishlist } = useWishlist();
  const [orderTotal, setOrderTotal] = useState(0);
  const [ticketTotal, setTicketTotal] = useState(0);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();

      async function loadSummary() {
        if (!isAuthenticated) {
          setOrderTotal(0);
          setTicketTotal(0);
          return;
        }

        try {
          const [orderResponse, ticketResponse] = await Promise.all([
            orderApi.getMyOrders({ page: 1, limit: 1 }),
            ticketApi.getMyTickets()
          ]);
          setOrderTotal(orderResponse.data.total || 0);
          setTicketTotal(ticketResponse.data.tickets?.length || 0);
          await refreshWishlist();
        } catch {
          setOrderTotal(0);
          setTicketTotal(0);
        }
      }

      loadSummary();
    }, [isAuthenticated, refreshUnreadCount, refreshWishlist])
  );

  const progressTarget = getTierTarget(user?.loyaltyTier);
  const progress = Math.min(100, ((user?.totalSpent || 0) / progressTarget) * 100);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Account" />
      {!isAuthenticated ? (
        <View style={styles.authCard}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>PREMIUM ACCESS</Text>
          </View>
          <Text style={styles.authTitle}>Sign In To Unlock Your Account</Text>
          <Text style={styles.authBody}>See your orders, save products, manage addresses, use wallet checkout, and enter your full control center.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/login")}>
            <Text style={styles.primaryLabel}>SIGN IN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/register")}>
            <Text style={styles.secondaryLabel}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.identityRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.identityCopy}>
                <View style={styles.kickerRow}>
                  <View style={styles.kickerDot} />
                  <Text style={styles.kicker}>CONTROL CENTER</Text>
                </View>
                <Text style={styles.heroTitle}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.heroMeta}>{user?.role || "SHOP"} USER • {user?.phoneVerified ? "PHONE VERIFIED" : "VERIFY PHONE"}</Text>
              </View>
              {user?.phoneVerified ? (
                <View style={styles.verifiedSeal}>
                  <Ionicons name="shield-checkmark" size={16} color={theme.colors.textPrimary} />
                </View>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabRow}
              style={styles.tabScroller}
            >
              {[
                { label: "GENERAL", route: "/account/profile", icon: "person-outline" },
                { label: "ADDRESSES", route: "/account/addresses", icon: "location-outline" },
                { label: "ORDERS", route: "/orders", icon: "cube-outline" },
                { label: "WALLET", route: "/wallet", icon: "card-outline" },
                { label: "SECURITY", route: "/account/security", icon: "lock-closed-outline" },
                { label: "WISHLIST", route: "/wishlist", icon: "heart-outline" },
                { label: "SUPPORT", route: "/support", icon: "headset-outline" },
                { label: "REVIEWS", route: "/account/reviews", icon: "star-outline" },
                { label: "ALERTS", route: "/notifications", icon: "notifications-outline" }
              ].map((item) => (
                <TouchableOpacity key={item.label} style={styles.tabChip} onPress={() => router.push(item.route as any)} activeOpacity={0.86}>
                  <Ionicons name={item.icon as any} size={12} color={theme.colors.textPrimary} />
                  <Text style={styles.tabChipLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>WALLET</Text>
                <Text style={styles.statValue}>₦{Number(user?.wallet?.balance || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>ORDERS</Text>
                <Text style={styles.statValue}>{orderTotal}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>WISHLIST</Text>
                <Text style={styles.statValue}>{wishlistItems.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>ALERTS</Text>
                <Text style={styles.statValue}>{unreadCount}</Text>
              </View>
            </View>

            <View style={styles.identityPanel}>
              <View style={styles.identityInfoCard}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="mail-outline" size={16} color={theme.colors.textPrimary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.identityInfoCard}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="call-outline" size={16} color={theme.colors.textPrimary} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={styles.infoLabel}>PHONE NUMBER</Text>
                  <Text style={styles.infoValue}>{user?.phone}</Text>
                </View>
              </View>
            </View>

            <View style={styles.loyaltyCard}>
              <View style={styles.loyaltyHeader}>
                <Text style={styles.loyaltyLabel}>LOYALTY TIER</Text>
                <Text style={styles.loyaltyTier}>{user?.loyaltyTier || "ENTHUSIAST"}</Text>
              </View>
              <Text style={styles.loyaltyMeta}>
                ₦{Number(user?.totalSpent || 0).toLocaleString()} spent • Progress to {getNextTierLabel(user?.loyaltyTier)}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </View>

          <WalletPromoCard
            balance={`₦${Number(user?.wallet?.balance || 0).toLocaleString()}`}
            onTopUpPress={() => router.push("/wallet")}
            onUseWalletPress={() => router.push("/checkout")}
          />

          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.previewGrid}>
            <TouchableOpacity style={styles.previewCard} activeOpacity={0.86} onPress={() => router.push("/wallet")}>
              <Text style={styles.previewKicker}>WALLET RAIL</Text>
              <Text style={styles.previewTitle}>Top up, verify payments, and use balance-first checkout.</Text>
              <View style={styles.previewFooter}>
                <Text style={styles.previewMetric}>₦{Number(user?.wallet?.balance || 0).toLocaleString()}</Text>
                <Text style={styles.previewAction}>OPEN</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewCard} activeOpacity={0.86} onPress={() => router.push("/orders")}>
              <Text style={styles.previewKicker}>ORDER ARCHIVE</Text>
              <Text style={styles.previewTitle}>View your purchase history, track logistics, and inspect the full ledger.</Text>
              <View style={styles.previewFooter}>
                <Text style={styles.previewMetric}>{orderTotal} ORDER{orderTotal === 1 ? "" : "S"}</Text>
                <Text style={styles.previewAction}>OPEN</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewCard} activeOpacity={0.86} onPress={() => router.push("/notifications")}>
              <Text style={styles.previewKicker}>ALERT MATRIX</Text>
              <Text style={styles.previewTitle}>Payment updates, ticket replies, and order movements land here first.</Text>
              <View style={styles.previewFooter}>
                <Text style={styles.previewMetric}>{unreadCount} UNREAD</Text>
                <Text style={styles.previewAction}>OPEN</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewCard} activeOpacity={0.86} onPress={() => router.push("/support")}>
              <Text style={styles.previewKicker}>SUPPORT LINE</Text>
              <Text style={styles.previewTitle}>Create tickets, follow replies, and keep the resolution thread in one place.</Text>
              <View style={styles.previewFooter}>
                <Text style={styles.previewMetric}>{ticketTotal} THREAD{ticketTotal === 1 ? "" : "S"}</Text>
                <Text style={styles.previewAction}>OPEN</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.groupCard}>
            {[
              { label: "General Profile", onPress: () => router.push("/account/profile"), icon: "person-outline" },
              { label: "Addresses", onPress: () => router.push("/account/addresses"), icon: "location-outline", badge: user?.addresses?.length || 0 },
              { label: "Security", onPress: () => router.push("/account/security"), icon: "lock-closed-outline" },
              { label: "Reviews", onPress: () => router.push("/account/reviews"), icon: "star-outline" }
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.row} onPress={item.onPress} activeOpacity={0.86}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIconWrap}>
                    <Ionicons name={item.icon as any} size={18} color={theme.colors.textPrimary} />
                  </View>
                  <Text style={styles.label}>{item.label}</Text>
                </View>
                <View style={styles.rowRight}>
                  {typeof item.badge === "number" ? (
                    <View style={styles.softBadge}>
                      <Text style={styles.softBadgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Commerce</Text>
          <View style={styles.groupCard}>
            {[
              { label: "Wallet", onPress: () => router.push("/wallet"), icon: "card-outline" },
              { label: "Orders", onPress: () => router.push("/orders"), icon: "cube-outline", badge: orderTotal },
              { label: "Wishlist", onPress: () => router.push("/wishlist"), icon: "heart-outline" },
              { label: "Track Order", onPress: () => router.push("/track-order"), icon: "navigate-outline" }
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.row} onPress={item.onPress} activeOpacity={0.86}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIconWrap}>
                    <Ionicons name={item.icon as any} size={18} color={theme.colors.textPrimary} />
                  </View>
                  <Text style={styles.label}>{item.label}</Text>
                </View>
                <View style={styles.rowRight}>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <View style={styles.softBadge}>
                      <Text style={styles.softBadgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.groupCard}>
            {[
              { label: "Support Tickets", onPress: () => router.push("/support"), icon: "headset-outline" },
              { label: "Notifications", onPress: () => router.push("/notifications"), icon: "notifications-outline", badge: unreadCount }
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.row} onPress={item.onPress} activeOpacity={0.86}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIconWrap}>
                    <Ionicons name={item.icon as any} size={18} color={theme.colors.textPrimary} />
                  </View>
                  <Text style={styles.label}>{item.label}</Text>
                </View>
                <View style={styles.rowRight}>
                  {item.badge ? (
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertBadgeText}>{item.badge > 99 ? "99+" : item.badge}</Text>
                    </View>
                  ) : null}
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.groupCard}>
            <TouchableOpacity style={styles.row} onPress={() => router.push("/account/security")} activeOpacity={0.86}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, styles.rowIconWrapDanger]}>
                  <Ionicons name="warning-outline" size={18} color={theme.colors.rose} />
                </View>
                <View style={styles.destructiveCopy}>
                  <Text style={styles.label}>Delete Account</Text>
                  <Text style={styles.destructiveHint}>Open Security to permanently close this account.</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutRow} onPress={logout} activeOpacity={0.86}>
            <Text style={styles.logout}>LOG OUT</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  authCard: { paddingHorizontal: 24, paddingVertical: 28, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  kickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.brand },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  authTitle: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", letterSpacing: -0.6 },
  authBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  primaryButton: { height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginTop: theme.spacing.xl },
  primaryLabel: { color: theme.colors.white, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  secondaryButton: { height: 54, borderRadius: 18, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, justifyContent: "center", alignItems: "center", marginTop: theme.spacing.md },
  secondaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 1.8 },
  heroCard: { position: "relative", padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, overflow: "hidden", marginBottom: theme.spacing.xxl },
  heroGlow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(59,130,246,0.16)", right: -40, top: -60 },
  identityRow: { flexDirection: "row", gap: theme.spacing.lg, alignItems: "center" },
  avatar: { width: 74, height: 74, borderRadius: 24, backgroundColor: theme.colors.brand, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.canvas, fontSize: 26, fontWeight: "900", fontStyle: "italic" },
  identityCopy: { flex: 1 },
  verifiedSeal: { width: 40, height: 40, borderRadius: 16, backgroundColor: theme.colors.emerald, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  heroMeta: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "900", marginTop: theme.spacing.sm, letterSpacing: 1.2 },
  tabScroller: { marginTop: theme.spacing.xl },
  tabRow: { gap: theme.spacing.sm, paddingRight: theme.spacing.md },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  tabChipLabel: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  statsRow: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.xl },
  statCard: { flex: 1, padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  statLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  statValue: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  identityPanel: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
  identityInfoCard: { flexDirection: "row", gap: theme.spacing.md, padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  infoIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  infoCopy: { flex: 1 },
  infoLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  infoValue: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "800", marginTop: theme.spacing.sm },
  loyaltyCard: { marginTop: theme.spacing.lg, padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  loyaltyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  loyaltyLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  loyaltyTier: { color: theme.colors.brand, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  loyaltyMeta: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: theme.spacing.sm },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", marginTop: theme.spacing.md, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: theme.colors.brand, borderRadius: 999 },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", marginBottom: theme.spacing.lg },
  previewGrid: { gap: theme.spacing.lg, marginBottom: theme.spacing.xxl },
  previewCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  previewKicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  previewTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic", lineHeight: 24, marginTop: theme.spacing.md, textTransform: "uppercase" },
  previewFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: theme.spacing.lg },
  previewMetric: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  previewAction: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  groupCard: { borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, overflow: "hidden", marginBottom: theme.spacing.xxl },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md, flex: 1 },
  rowIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  rowIconWrapDanger: { backgroundColor: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.18)" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  label: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  destructiveCopy: { flex: 1 },
  destructiveHint: { color: theme.colors.textTertiary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  softBadge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: theme.colors.border },
  softBadgeText: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900" },
  alertBadge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.brand },
  alertBadgeText: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900" },
  logoutRow: { height: 58, borderRadius: 18, backgroundColor: "rgba(244,63,94,0.08)", borderWidth: 1, borderColor: "rgba(244,63,94,0.22)", alignItems: "center", justifyContent: "center" },
  logout: { color: theme.colors.rose, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 }
});
