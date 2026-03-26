import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { ticketApi } from "@/lib/api";

function getStatusTone(status: string) {
  switch (status) {
    case "resolved":
      return { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.24)" };
    case "closed":
      return { color: theme.colors.textTertiary, bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.20)" };
    default:
      return { color: theme.colors.brand, bg: theme.colors.brandSoft, border: "rgba(59,130,246,0.22)" };
  }
}

export default function SupportTicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const statusTone = getStatusTone(ticket?.status || "open");
  const publicComments = useMemo(() => (ticket?.comments || []).filter((comment: any) => !comment.isInternal), [ticket?.comments]);
  const channelClosed = ticket?.status === "resolved" || ticket?.status === "closed";

  async function loadTicket() {
    if (!id) return;
    try {
      setLoading(true);
      const response = await ticketApi.getDetails(id);
      setTicket(response.data.ticket);
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [publicComments.length]);

  async function handleSend() {
    if (!id || !message.trim() || sending || channelClosed) return;

    try {
      setSending(true);
      await ticketApi.addComment(id, message.trim());
      setMessage("");
      await loadTicket();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.colors.brand} size="large" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <AppHeader title="Support" showBack />
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Transmission Failed</Text>
            <Text style={styles.emptyBody}>The requested support ticket could not be retrieved.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
              <Text style={styles.actionLabel}>RETURN TO CENTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.content}>
        <AppHeader title="Support Ticket" showBack />

        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backPill} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.backPillText}>TERMINAL OUTPUT</Text>
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <View style={[styles.statusPill, { backgroundColor: statusTone.bg, borderColor: statusTone.border }]}>
              <Text style={[styles.statusPillText, { color: statusTone.color }]}>{String(ticket.status).toUpperCase()}</Text>
            </View>
            <View style={styles.priorityPill}>
              <Text style={styles.priorityText}>{String(ticket.priority || "medium").toUpperCase()} PRIORITY</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.subject}>{ticket.subject}</Text>
          <Text style={styles.summaryMeta}>
            Ref: #{String(ticket._id).slice(-8).toUpperCase()} • Created {new Date(ticket.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>

        <View style={[styles.threadCard, channelClosed && styles.threadCardResolved]}>
          <View style={styles.threadHeader}>
            <View style={styles.threadTitleRow}>
              <Ionicons name="headset-outline" size={20} color={theme.colors.brand} />
              <Text style={styles.threadTitle}>Encrypted Connection</Text>
            </View>
            <View style={styles.threadMetaRow}>
              <Ionicons name="shield-checkmark-outline" size={12} color={theme.colors.textTertiary} />
              <Text style={styles.threadMeta}>VERIFIED AGENT ACCESS</Text>
            </View>
          </View>

          <ScrollView ref={scrollRef} style={styles.threadBody} contentContainerStyle={styles.threadBodyContent}>
            {publicComments.length === 0 ? (
              <View style={styles.noMessages}>
                <Ionicons name="chatbubble-ellipses-outline" size={42} color={theme.colors.textTertiary} />
                <Text style={styles.noMessagesTitle}>Awaiting Agent Response</Text>
              </View>
            ) : (
              publicComments.map((comment: any, index: number) => {
                const isMe = !comment.isAdmin;
                return (
                  <View key={`${comment.date}-${index}`} style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
                    <View style={[styles.messageBubbleWrap, isMe ? styles.messageBubbleWrapRight : null]}>
                      <View style={[styles.avatar, isMe ? styles.avatarMine : styles.avatarAgent]}>
                        <Ionicons name={isMe ? "person-outline" : "headset-outline"} size={16} color={isMe ? theme.colors.textPrimary : theme.colors.textSecondary} />
                      </View>
                      <View style={styles.messageCopy}>
                        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMine : styles.messageBubbleAgent]}>
                          <Text style={[styles.messageText, isMe ? styles.messageTextMine : null]}>{comment.message}</Text>
                        </View>
                        <Text style={[styles.messageMeta, isMe ? styles.messageMetaRight : null]}>
                          {new Date(comment.date).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder={channelClosed ? "THIS CHANNEL IS CLOSED" : "TYPE YOUR MESSAGE..."}
              placeholderTextColor={theme.colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              editable={!channelClosed}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!message.trim() || sending || channelClosed) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim() || sending || channelClosed}
            >
              {sending ? <ActivityIndicator color={theme.colors.canvas} size="small" /> : <Ionicons name="send" size={16} color={theme.colors.canvas} />}
            </TouchableOpacity>
          </View>
          {channelClosed ? (
            <Text style={[styles.closedText, ticket.status === "resolved" ? styles.closedTextResolved : null]}>
              This transmission has been marked as {ticket.status}.
            </Text>
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: theme.colors.canvas, alignItems: "center", justifyContent: "center" },
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { flex: 1, padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 24 },
  headerRow: { gap: theme.spacing.lg, marginBottom: theme.spacing.lg },
  backPill: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, alignSelf: "flex-start" },
  backPillText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  statusRow: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  statusPillText: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  priorityPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  priorityText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  summaryCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xl },
  subject: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  summaryMeta: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "800", marginTop: theme.spacing.md, letterSpacing: 1.1 },
  description: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.lg },
  threadCard: {
    flex: 1,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  threadCardResolved: { borderColor: "rgba(34,197,94,0.32)" },
  threadHeader: { padding: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  threadTitleRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  threadTitle: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.4, textTransform: "uppercase" },
  threadMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  threadMeta: { color: theme.colors.textTertiary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  threadBody: { flex: 1 },
  threadBodyContent: { padding: theme.spacing.xl, gap: theme.spacing.lg },
  noMessages: { minHeight: 220, alignItems: "center", justifyContent: "center" },
  noMessagesTitle: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, textTransform: "uppercase", marginTop: theme.spacing.lg },
  messageRow: { width: "100%" },
  messageRowLeft: { alignItems: "flex-start" },
  messageRowRight: { alignItems: "flex-end" },
  messageBubbleWrap: { flexDirection: "row", alignItems: "flex-end", gap: theme.spacing.md, maxWidth: "86%" },
  messageBubbleWrapRight: { flexDirection: "row-reverse" },
  avatar: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.border },
  avatarMine: { backgroundColor: theme.colors.brand },
  avatarAgent: { backgroundColor: "rgba(255,255,255,0.06)" },
  messageCopy: { gap: 6, flexShrink: 1 },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 22, maxWidth: "100%" },
  messageBubbleMine: { backgroundColor: theme.colors.brand, borderTopRightRadius: 6 },
  messageBubbleAgent: { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: theme.colors.border, borderTopLeftRadius: 6 },
  messageText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 },
  messageTextMine: { color: theme.colors.canvas },
  messageMeta: { color: theme.colors.textTertiary, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  messageMetaRight: { textAlign: "right" },
  composer: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: "rgba(0,0,0,0.18)" },
  composerInput: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1
  },
  sendButton: { width: 50, height: 50, borderRadius: 18, backgroundColor: theme.colors.textPrimary, alignItems: "center", justifyContent: "center" },
  sendButtonDisabled: { opacity: 0.3 },
  closedText: { color: theme.colors.textTertiary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2, textAlign: "center", paddingBottom: theme.spacing.lg, textTransform: "uppercase" },
  closedTextResolved: { color: "#22C55E" },
  emptyCard: { paddingHorizontal: 24, paddingVertical: 28, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  actionButton: { marginTop: theme.spacing.xl, height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  actionLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 }
});
