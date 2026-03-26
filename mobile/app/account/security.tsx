import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";

export default function AccountSecurityScreen() {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmation: ""
  });

  async function handleSave() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      Alert.alert("Missing details", "Please complete all password fields.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Password mismatch", "Your new password and confirmation do not match.");
      return;
    }

    if (form.newPassword.length < 6) {
      Alert.alert("Weak password", "Please use at least 6 characters.");
      return;
    }

    try {
      setSaving(true);
      await userApi.updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      Alert.alert("Access updated", "Your account secret has been refreshed.");
    } catch (error) {
      Alert.alert("Update failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTerminateSession() {
    await logout();
  }

  async function handleDeleteAccount() {
    if (!deleteForm.password || !deleteForm.confirmation) {
      Alert.alert("Missing details", "Enter your current password and type DELETE to continue.");
      return;
    }

    if (deleteForm.confirmation !== "DELETE") {
      Alert.alert("Confirmation required", "Type DELETE exactly to confirm account deletion.");
      return;
    }

    try {
      setDeleting(true);
      await userApi.deleteAccount(deleteForm);
      await logout();
      Alert.alert("Account deleted", "Your account has been deleted and this session has been closed.");
    } catch (error) {
      Alert.alert("Deletion failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Security" showBack />

      <Text style={styles.pageTitle}>Security Center</Text>

      <View style={styles.securityGrid}>
        <View style={styles.formCard}>
          <View style={styles.cardGlow} />
          <View style={styles.iconTitleRow}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.brand} />
            <Text style={styles.cardTitle}>Access Control</Text>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>EXISTING PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={form.currentPassword}
              onChangeText={(value) => setForm((current) => ({ ...current, currentPassword: value }))}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={form.newPassword}
              onChangeText={(value) => setForm((current) => ({ ...current, newPassword: value }))}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={form.confirmPassword}
              onChangeText={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.primaryLabel}>{saving ? "UPDATING..." : "UPDATE SECRET"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusColumn}>
          <View style={styles.statusCard}>
            <View style={styles.iconTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.emerald} />
              <Text style={styles.cardTitle}>System Status</Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>EMAIL LINKED</Text>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.emerald} />
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>PHONE VERIFIED</Text>
              <Ionicons
                name={user?.phoneVerified ? "checkmark-circle" : "alert-circle-outline"}
                size={18}
                color={user?.phoneVerified ? theme.colors.emerald : theme.colors.amber}
              />
            </View>

            <View style={styles.statusMetaCard}>
              <Text style={styles.statusMetaTitle}>ACCOUNT HARDENING</Text>
              <Text style={styles.statusMetaBody}>
                Rotating your password here keeps wallet access, order history, and support threads protected across devices.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.terminateButton} onPress={handleTerminateSession}>
            <Text style={styles.terminateLabel}>TERMINATE SESSION</Text>
          </TouchableOpacity>

          <View style={styles.deleteCard}>
            <View style={styles.iconTitleRow}>
              <Ionicons name="warning-outline" size={20} color={theme.colors.rose} />
              <Text style={styles.cardTitle}>Delete Account</Text>
            </View>
            <Text style={styles.deleteBody}>
              This closes your PlugNG account and signs you out. Some records may still be retained where required for order, fraud, or legal compliance.
            </Text>

            {!showDeleteForm ? (
              <TouchableOpacity style={styles.deleteTrigger} onPress={() => setShowDeleteForm(true)}>
                <Text style={styles.deleteTriggerLabel}>START DELETION</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.deleteForm}>
                <View style={styles.deleteInfoCard}>
                  <Text style={styles.deleteInfoTitle}>Before you continue</Text>
                  <Text style={styles.deleteInfoBody}>You will lose access to your saved addresses, wishlist, wallet access, and account session.</Text>
                  <Text style={styles.deleteInfoBody}>Type DELETE and enter your current password to confirm.</Text>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>CURRENT PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    value={deleteForm.password}
                    onChangeText={(value) => setDeleteForm((current) => ({ ...current, password: value }))}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>TYPE DELETE TO CONFIRM</Text>
                  <TextInput
                    style={styles.input}
                    value={deleteForm.confirmation}
                    onChangeText={(value) => setDeleteForm((current) => ({ ...current, confirmation: value.toUpperCase() }))}
                    placeholder="DELETE"
                    autoCapitalize="characters"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>

                <View style={styles.deleteActions}>
                  <TouchableOpacity
                    style={styles.deleteCancelButton}
                    onPress={() => {
                      setShowDeleteForm(false);
                      setDeleteForm({ password: "", confirmation: "" });
                    }}
                  >
                    <Text style={styles.deleteCancelLabel}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteConfirmButton} onPress={handleDeleteAccount} disabled={deleting}>
                    <Text style={styles.deleteConfirmLabel}>{deleting ? "DELETING..." : "DELETE ACCOUNT"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  pageTitle: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginBottom: theme.spacing.xl },
  securityGrid: { gap: theme.spacing.xl },
  formCard: {
    position: "relative",
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  cardGlow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.12)"
  },
  iconTitleRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  fieldBlock: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  label: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 15
  },
  primaryButton: { height: 56, borderRadius: 18, backgroundColor: theme.colors.textPrimary, alignItems: "center", justifyContent: "center", marginTop: theme.spacing.xl },
  primaryLabel: { color: theme.colors.canvas, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  statusColumn: { gap: theme.spacing.lg },
  statusCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  statusLabel: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  statusMetaCard: { marginTop: theme.spacing.xl, padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  statusMetaTitle: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  statusMetaBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: theme.spacing.sm },
  terminateButton: { height: 56, borderRadius: 18, backgroundColor: "rgba(244,63,94,0.10)", borderWidth: 1, borderColor: "rgba(244,63,94,0.22)", alignItems: "center", justifyContent: "center" },
  terminateLabel: { color: theme.colors.rose, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  deleteCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: "rgba(244,63,94,0.06)", borderWidth: 1, borderColor: "rgba(244,63,94,0.18)" },
  deleteBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: theme.spacing.sm },
  deleteTrigger: { marginTop: theme.spacing.xl, height: 52, borderRadius: 16, backgroundColor: "rgba(244,63,94,0.12)", borderWidth: 1, borderColor: "rgba(244,63,94,0.24)", alignItems: "center", justifyContent: "center" },
  deleteTriggerLabel: { color: theme.colors.rose, fontSize: 12, fontWeight: "900", letterSpacing: 1.6 },
  deleteForm: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
  deleteInfoCard: { padding: theme.spacing.lg, borderRadius: theme.radius.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border },
  deleteInfoTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "900", marginBottom: theme.spacing.sm },
  deleteInfoBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 4 },
  deleteActions: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.md },
  deleteCancelButton: { flex: 1, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  deleteCancelLabel: { color: theme.colors.textPrimary, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  deleteConfirmButton: { flex: 1, height: 52, borderRadius: 16, backgroundColor: "rgba(244,63,94,0.16)", borderWidth: 1, borderColor: "rgba(244,63,94,0.28)", alignItems: "center", justifyContent: "center" },
  deleteConfirmLabel: { color: theme.colors.rose, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 }
});
