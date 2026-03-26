import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";
import { walletApi } from "@/lib/api";

const WALLET_CALLBACK_URL = "plugng://wallet";

export default function WalletScreen() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingReference, setPendingReference] = useState("");

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const reference = new URL(url).searchParams.get("reference");
      if (reference) {
        setPendingReference(reference);
        handleVerify(reference);
      }
    });

    return () => subscription.remove();
  }, []);

  async function handleVerify(referenceParam?: string) {
    const reference = referenceParam || pendingReference;
    if (!reference) {
      Alert.alert("No reference found", "Start a wallet top-up first before verifying.");
      return;
    }

    try {
      setVerifying(true);
      const response = await walletApi.verifyTopup(reference);
      await refreshUser();
      setPendingReference("");
      Alert.alert(
        "Wallet funded",
        response.data?.transaction ? `₦${response.data.transaction.amount.toLocaleString()} added successfully.` : "Your wallet was updated successfully."
      );
    } catch (error) {
      Alert.alert("Verification failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleTopUp() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 100) {
      Alert.alert("Invalid amount", "Minimum top-up is ₦100.");
      return;
    }

    try {
      setLoading(true);
      const response = await walletApi.initializeTopup(numericAmount, WALLET_CALLBACK_URL);
      setPendingReference(response.data.reference);
      await Linking.openURL(response.data.paymentUrl);
      Alert.alert("Continue in browser", "Complete payment, then return here and tap Verify Pending Top-up.");
    } catch (error) {
      Alert.alert("Could not start top-up", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Wallet" showBack />
      {!isAuthenticated ? (
        <View style={styles.authCard}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>PREMIUM ACCESS</Text>
          </View>
          <Text style={styles.authTitle}>Sign In To Unlock Your Wallet</Text>
          <Text style={styles.authBody}>Top up faster, track wallet transactions, and use balance at checkout with less friction.</Text>
          <TouchableOpacity style={styles.authButton} activeOpacity={0.9} onPress={() => router.push("/login")}>
            <Text style={styles.authButtonLabel}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <Text style={styles.kicker}>DIGITAL WALLET</Text>
            <Text style={styles.heroTitle}>Deploy Capital</Text>
            <Text style={styles.heroBalance}>₦{(user?.wallet?.balance || 0).toLocaleString()}</Text>
            <Text style={styles.heroBody}>Add funds via secure gateway, then use balance-first checkout across your orders.</Text>

            <View style={styles.quickStats}>
              <View style={styles.quickStatCard}>
                <Text style={styles.quickStatLabel}>ACTIVE BALANCE</Text>
                <Text style={styles.quickStatValue}>₦{(user?.wallet?.balance || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.quickStatCard}>
                <Text style={styles.quickStatLabel}>RECENT LOGS</Text>
                <Text style={styles.quickStatValue}>{(user?.wallet?.transactions || []).length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.topupCard}>
            <View style={styles.topupHeader}>
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.brand} />
              <Text style={styles.topupTitle}>Add Funds via Secure Gateway</Text>
            </View>

            <Text style={styles.fieldLabel}>TOP-UP AMOUNT</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.currency}>₦</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 100"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.quickActions}>
              {[1000, 5000, 10000].map((value) => (
                <TouchableOpacity key={value} style={styles.quickChip} onPress={() => setAmount(String(value))}>
                  <Text style={styles.quickChipText}>₦{value.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={handleTopUp} disabled={loading}>
              <Text style={styles.buttonLabel}>{loading ? "STARTING..." : "FUND CREDITS"}</Text>
            </TouchableOpacity>

            {pendingReference ? (
              <TouchableOpacity style={styles.verifyButton} activeOpacity={0.9} onPress={() => handleVerify()} disabled={verifying}>
                <Text style={styles.verifyButtonLabel}>{verifying ? "VERIFYING..." : "VERIFY PENDING TOP-UP"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={18} color={theme.colors.brand} />
            <Text style={styles.sectionTitle}>Transaction Log</Text>
          </View>

          {(user?.wallet?.transactions || []).slice().reverse().map((transaction, index) => (
            <View key={`${transaction.date}-${index}`} style={styles.transaction}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, transaction.type === "credit" ? styles.transactionCredit : styles.transactionDebit]}>
                  <Ionicons
                    name={transaction.type === "credit" ? "arrow-down-outline" : "arrow-up-outline"}
                    size={20}
                    color={transaction.type === "credit" ? theme.colors.emerald : theme.colors.rose}
                  />
                </View>
                <View style={styles.transactionCopy}>
                  <Text style={styles.transactionTitle}>{transaction.description}</Text>
                  <Text style={styles.transactionMeta}>{new Date(transaction.date).toLocaleString()}</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, transaction.type === "credit" ? styles.amountCredit : styles.amountDebit]}>
                {transaction.type === "credit" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 100 },
  authCard: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  kickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.brand },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  authTitle: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", letterSpacing: -0.6 },
  authBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  authButton: {
    marginTop: theme.spacing.xl,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  authButtonLabel: { color: theme.colors.white, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  heroCard: {
    position: "relative",
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: theme.spacing.xxl
  },
  heroGlow: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)"
  },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  heroBalance: { color: theme.colors.textPrimary, fontSize: 40, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  heroBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  quickStats: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.xl },
  quickStatCard: { flex: 1, padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  quickStatLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  quickStatValue: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm },
  topupCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  topupHeader: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  topupTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  fieldLabel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: theme.spacing.sm },
  inputWrap: { position: "relative" },
  currency: { position: "absolute", left: 18, top: 17, color: theme.colors.textSecondary, fontSize: 18, fontWeight: "900", zIndex: 1 },
  input: {
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(0,0,0,0.24)",
    color: theme.colors.textPrimary,
    paddingHorizontal: 42,
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic"
  },
  quickActions: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.md },
  quickChip: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: theme.colors.border, alignItems: "center" },
  quickChipText: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  button: { marginTop: theme.spacing.xl, height: 56, borderRadius: 18, backgroundColor: theme.colors.textPrimary, alignItems: "center", justifyContent: "center" },
  buttonLabel: { color: theme.colors.canvas, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  verifyButton: { marginTop: theme.spacing.md, height: 52, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  verifyButtonLabel: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic" },
  transaction: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  transactionLeft: { flexDirection: "row", gap: theme.spacing.lg, flex: 1 },
  transactionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  transactionCredit: { backgroundColor: "rgba(16,185,129,0.12)" },
  transactionDebit: { backgroundColor: "rgba(244,63,94,0.12)" },
  transactionCopy: { flex: 1 },
  transactionTitle: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  transactionMeta: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginTop: theme.spacing.sm },
  transactionAmount: { fontSize: 20, fontWeight: "900", fontStyle: "italic" },
  amountCredit: { color: theme.colors.emerald },
  amountDebit: { color: theme.colors.rose }
});
