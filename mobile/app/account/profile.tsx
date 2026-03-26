import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";

export default function AccountProfileScreen() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "" });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || ""
    });
  }, [user?.firstName, user?.lastName]);

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert("Missing details", "Please provide both first name and last name.");
      return;
    }

    try {
      setSaving(true);
      const response = await userApi.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim()
      });
      setUser(response.data.user);
      Alert.alert("Identity updated", "Your account profile has been refreshed.");
    } catch (error) {
      Alert.alert("Update failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="General Profile" showBack />

      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <Text style={styles.kicker}>GENERAL INFO</Text>
        <Text style={styles.title}>Identity Ledger</Text>
        <Text style={styles.body}>
          Update the name attached to your PlugNG account. Email and phone stay locked so your orders, support history, and wallet identity remain consistent.
        </Text>

        <View style={styles.formGrid}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={form.firstName}
              onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
            />
          </View>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
              style={styles.input}
              value={form.lastName}
              onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
            />
          </View>
        </View>

        <View style={styles.infoStack}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textPrimary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.readOnlyPill}>
              <Text style={styles.readOnlyLabel}>READ ONLY</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="call-outline" size={18} color={theme.colors.textPrimary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>PHONE NUMBER</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
            <View style={styles.readOnlyPill}>
              <Text style={styles.readOnlyLabel}>READ ONLY</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerHint}>
            {user?.phoneVerified ? "PHONE VERIFIED" : "VERIFY PHONE TO INCREASE ACCOUNT TRUST"}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.primaryLabel}>{saving ? "UPDATING..." : "UPDATE PROFILE"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  heroCard: {
    position: "relative",
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    top: -80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)"
  },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  title: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  body: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  formGrid: { gap: theme.spacing.md },
  fieldBlock: { gap: theme.spacing.sm },
  label: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 15,
    fontWeight: "700"
  },
  infoStack: { gap: theme.spacing.md, marginTop: theme.spacing.xl },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  infoIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  infoCopy: { flex: 1 },
  infoLabel: { color: theme.colors.textTertiary, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  infoValue: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "800", marginTop: theme.spacing.sm },
  readOnlyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  readOnlyLabel: { color: theme.colors.textTertiary, fontSize: 8, fontWeight: "900", letterSpacing: 1.3 },
  footerRow: { marginTop: theme.spacing.xl, gap: theme.spacing.lg },
  footerHint: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.textPrimary,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryLabel: { color: theme.colors.canvas, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 }
});
