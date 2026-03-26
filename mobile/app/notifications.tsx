import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { notificationApi } from "@/lib/api";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshUnreadCount, decrementUnreadCount, resetUnreadCount } = useNotifications();

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await notificationApi.getMyNotifications({ page: 1, limit: 20 });
      setItems(response.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await notificationApi.markAllAsRead();
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    resetUnreadCount();
    await loadNotifications();
  }

  async function markOneRead(id: string) {
    await notificationApi.markAsRead(id);
    setItems((current) => current.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    decrementUnreadCount();
    await refreshUnreadCount();
  }

  function resolveMobileLink(link?: string) {
    if (!link) return null;

    const normalizedLink = link.replace(/^https?:\/\/[^/]+/i, "");

    if (/^\/orders\/[^/]+$/i.test(normalizedLink)) {
      return normalizedLink.replace(/^\/orders\//i, "/order/");
    }

    if (/^\/profile\/support\/[^/]+$/i.test(normalizedLink)) {
      return normalizedLink.replace(/^\/profile\/support\//i, "/support/");
    }

    if (/^\/wallet$/i.test(normalizedLink) || /^\/profile\?tab=wallet/i.test(normalizedLink)) {
      return "/wallet";
    }

    if (/^\/notifications$/i.test(normalizedLink) || /^\/profile\?tab=notifications/i.test(normalizedLink)) {
      return "/notifications";
    }

    return null;
  }

  async function handleViewDetails(item: any) {
    const mobileLink = resolveMobileLink(item.link);

    if (!mobileLink) {
      Alert.alert("Link not supported yet", "This notification points to a web route we haven't mapped in the mobile app yet.");
      return;
    }

    if (!item.isRead) {
      await markOneRead(item._id);
    }

    router.push(mobileLink as any);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  const typeToIcon = (type: string) => {
    if (type === "payment_success") return "checkmark-circle-outline";
    if (type === "wallet_update") return "card-outline";
    if (type === "order_update") return "cube-outline";
    return "notifications-outline";
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Notifications" showBack />
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>ALERT MATRIX</Text>
        <Text style={styles.heroTitle}>Notification Inbox</Text>
        <Text style={styles.heroBody}>Payment updates, ticket replies, and order movement all land here first.</Text>
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Inbox</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.action}>MARK ALL READ</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={styles.emptyText}>Loading notifications...</Text>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-off-outline" size={34} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>Everything Caught Up</Text>
          <Text style={styles.emptyText}>No active alerts detected right now.</Text>
        </View>
      ) : items.map((item) => (
        <View key={item._id} style={[styles.card, !item.isRead && styles.cardUnread]}>
          <View style={styles.cardRow}>
            <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
              <Ionicons name={typeToIcon(item.type) as any} size={18} color={!item.isRead ? theme.colors.brand : theme.colors.textSecondary} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}>{item.title}</Text>
                <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={styles.cardBody}>{item.message}</Text>
              <View style={styles.cardActions}>
                {item.link ? (
                  <TouchableOpacity onPress={() => handleViewDetails(item)}>
                    <Text style={styles.linkAction}>VIEW DETAILS</Text>
                  </TouchableOpacity>
                ) : null}
                {!item.isRead ? (
                  <TouchableOpacity onPress={() => markOneRead(item._id)}>
                    <Text style={styles.secondaryAction}>MARK AS READ</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  heroCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  heroBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.xl },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  action: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  emptyCard: { padding: theme.spacing.xxl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center" },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg },
  cardUnread: { borderColor: theme.colors.brand },
  cardRow: { flexDirection: "row", gap: theme.spacing.lg },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  iconWrapUnread: {
    backgroundColor: theme.colors.brandSoft,
    borderColor: "rgba(59,130,246,0.22)"
  },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  cardTitle: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: "800", flex: 1 },
  cardTitleUnread: { color: theme.colors.textPrimary },
  cardBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.sm },
  cardMeta: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "700", textAlign: "right" },
  cardActions: { flexDirection: "row", gap: theme.spacing.lg, marginTop: theme.spacing.md, flexWrap: "wrap" },
  linkAction: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  secondaryAction: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }
});
