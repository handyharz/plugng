import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { reviewApi } from "@/lib/api";

export default function AccountReviewsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const response = await reviewApi.getMyReviews();
        setItems(response.data.reviews || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Reviews" showBack />
      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>REVIEW ARCHIVE</Text>
        <Text style={styles.heading}>Your Reviews</Text>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={theme.colors.brand} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="star-outline" size={34} color={theme.colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Reviews Logged</Text>
          <Text style={styles.emptyBody}>When you review delivered products, they’ll appear here as part of your account archive.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const image = item.product?.images?.[0]?.url;
            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.media}>
                    {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <View style={styles.fallback} />}
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.productName}>{item.product?.name || "Product"}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.meta}>RATING {item.rating}/5</Text>
                      <View style={styles.starRow}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Ionicons
                            key={index}
                            name={index < item.rating ? "star" : "star-outline"}
                            size={12}
                            color={theme.colors.amber}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.comment}>{item.comment}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  headerBlock: { marginBottom: theme.spacing.xl },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  loaderWrap: { paddingVertical: theme.spacing.xxl },
  emptyCard: { padding: theme.spacing.xxl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center" },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.xl },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: theme.spacing.md },
  list: { gap: theme.spacing.lg },
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  cardRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.lg },
  media: { width: 78, height: 78, borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  image: { width: "100%", height: "100%" },
  fallback: { flex: 1, backgroundColor: "rgba(59,130,246,0.18)" },
  copy: { flex: 1 },
  productName: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md, marginTop: theme.spacing.sm },
  meta: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  starRow: { flexDirection: "row", gap: 3 },
  comment: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.lg }
});
