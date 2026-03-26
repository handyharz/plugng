import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { ticketApi } from "@/lib/api";

function getTicketTone(status: string) {
  switch (status) {
    case "resolved":
      return { dot: "#22C55E", text: "#22C55E" };
    case "closed":
      return { dot: theme.colors.textTertiary, text: theme.colors.textTertiary };
    default:
      return { dot: theme.colors.brand, text: theme.colors.brand };
  }
}

export default function SupportScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium"
  });

  async function loadTickets() {
    try {
      setLoading(true);
      const response = await ticketApi.getMyTickets();
      setTickets(response.data.tickets);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleCreateTicket() {
    if (!form.subject.trim() || !form.description.trim()) {
      Alert.alert("Missing details", "Please add a subject and description.");
      return;
    }

    try {
      setSubmitting(true);
      await ticketApi.create(form);
      setForm({ subject: "", description: "", priority: "medium" });
      await loadTickets();
      Alert.alert("Ticket created", "Support has received your request.");
    } catch (error) {
      Alert.alert("Could not create ticket", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Support" showBack />
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>SUPPORT HUB</Text>
        <Text style={styles.heroTitle}>Open Support Ticket</Text>
        <Text style={styles.heroBody}>Reach the support desk with your order, payment, or account issue and keep the full reply thread in one place.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Deploy Request</Text>
        <Text style={styles.body}>Describe the issue clearly so support can route it faster.</Text>
        <Text style={styles.label}>SUBJECT</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you need help with?"
          placeholderTextColor={theme.colors.textTertiary}
          value={form.subject}
          onChangeText={(value) => setForm((current) => ({ ...current, subject: value }))}
        />
        <Text style={styles.label}>DETAILS</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Describe the issue clearly"
          placeholderTextColor={theme.colors.textTertiary}
          value={form.description}
          onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateTicket} disabled={submitting}>
          <Text style={styles.primaryLabel}>{submitting ? "SUBMITTING..." : "CREATE TICKET"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Tickets</Text>
      {loading ? (
        <Text style={styles.emptyText}>Loading your support history...</Text>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="headset-outline" size={34} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Support Tickets Yet</Text>
          <Text style={styles.emptyText}>Your ticket history will appear here once you open a request.</Text>
        </View>
      ) : tickets.map((ticket) => (
        <TouchableOpacity
          key={ticket._id}
          style={styles.ticketCard}
          activeOpacity={0.86}
          onPress={() => router.push(`/support/${ticket._id}`)}
        >
          <View style={styles.ticketHeader}>
            <View style={styles.ticketHeaderText}>
              <View style={styles.ticketSubjectRow}>
                <View style={[styles.ticketDot, { backgroundColor: getTicketTone(ticket.status || "open").dot }]} />
                <Text style={styles.ticketSubject}>{ticket.subject}</Text>
              </View>
              <Text style={[styles.ticketMeta, { color: getTicketTone(ticket.status || "open").text }]}>
                {String(ticket.priority || "medium").toUpperCase()} • {String(ticket.status || "open").toUpperCase()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </View>
          <Text style={styles.ticketBody} numberOfLines={2}>{ticket.description}</Text>
        </TouchableOpacity>
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
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  title: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  body: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  label: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: theme.spacing.sm },
  input: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.glass, color: theme.colors.textPrimary, paddingHorizontal: theme.spacing.lg, fontSize: 15, marginBottom: theme.spacing.md },
  textarea: { height: 120, paddingTop: theme.spacing.lg },
  primaryButton: { height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  primaryLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", marginBottom: theme.spacing.lg },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  emptyCard: { padding: theme.spacing.xxl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center" },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  ticketCard: { padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg },
  ticketHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md },
  ticketHeaderText: { flex: 1 },
  ticketSubjectRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  ticketDot: { width: 8, height: 8, borderRadius: 999 },
  ticketSubject: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  ticketMeta: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.4, marginTop: theme.spacing.sm },
  ticketBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md }
});
