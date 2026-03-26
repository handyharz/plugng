import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";

export default function AccountAddressesScreen() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "Home",
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "Lagos",
    landmark: ""
  });

  function resetForm(nextUser = user) {
    setEditingAddressId(null);
    setShowForm(false);
    setForm({
      label: "Home",
      fullName: `${nextUser?.firstName || ""} ${nextUser?.lastName || ""}`.trim(),
      phone: nextUser?.phone || "",
      address: "",
      city: "",
      state: "Lagos",
      landmark: ""
    });
  }

  function handleCreateTap() {
    if (showForm && !editingAddressId) {
      resetForm();
      return;
    }
    resetForm();
    setShowForm(true);
  }

  function handleEdit(address: NonNullable<typeof user>["addresses"][number]) {
    setEditingAddressId(address._id || null);
    setForm({
      label: address.label || "Home",
      fullName: address.fullName || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "Lagos",
      landmark: address.landmark || ""
    });
    setShowForm(true);
  }

  async function handleSaveAddress() {
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim()) {
      Alert.alert("Missing details", "Please complete the address form.");
      return;
    }

    try {
      setSaving(true);
      const response = editingAddressId
        ? await userApi.updateAddress(editingAddressId, form)
        : await userApi.addAddress(form);
      setUser(response.data.user);
      resetForm(response.data.user);
    } catch (error) {
      Alert.alert(
        editingAddressId ? "Could not update address" : "Could not add address",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await userApi.deleteAddress(id);
      setUser(response.data.user);
    } catch (error) {
      Alert.alert("Delete failed", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function handleDefault(id: string) {
    try {
      const response = await userApi.setDefaultAddress(id);
      setUser(response.data.user);
    } catch (error) {
      Alert.alert("Could not update default", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader title="Addresses" showBack />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Saved Addresses</Text>
          <Text style={styles.subheading}>Secure the delivery hubs your orders can route through.</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleCreateTap}>
          <Text style={styles.headerButtonLabel}>{showForm && !editingAddressId ? "CANCEL" : "ADD NEW"}</Text>
        </TouchableOpacity>
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <View style={styles.formGlow} />
          <Text style={styles.formKicker}>{editingAddressId ? "EDIT ADDRESS" : "NEW ADDRESS"}</Text>
          <Text style={styles.formTitle}>{editingAddressId ? "Update Delivery Hub" : "Secure Delivery Hub"}</Text>

          {[
            ["LABEL", "label"],
            ["FULL NAME", "fullName"],
            ["PHONE", "phone"],
            ["ADDRESS", "address"],
            ["CITY", "city"],
            ["STATE", "state"],
            ["LANDMARK", "landmark"]
          ].map(([label, key]) => (
            <View key={key} style={styles.fieldBlock}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={(form as any)[key]}
                onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAddress} disabled={saving}>
            <Text style={styles.primaryLabel}>
              {saving ? "SAVING..." : editingAddressId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!user?.addresses?.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="location-outline" size={32} color={theme.colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Addresses Secured</Text>
          <Text style={styles.emptyBody}>Your future deliveries are waiting for a home. Add a default hub to speed up checkout.</Text>
        </View>
      ) : (
        user.addresses.map((address) => (
          <View key={address._id || address.address} style={styles.addressCard}>
            {address.isDefault ? <View style={styles.defaultRibbon}><Text style={styles.defaultRibbonText}>DEFAULT HUB</Text></View> : null}
            <View style={styles.addressHeader}>
              <View style={styles.addressTitleWrap}>
                <View style={styles.labelChip}>
                  <Text style={styles.labelChipText}>{address.label}</Text>
                </View>
                <Text style={styles.addressName}>{address.fullName}</Text>
                <Text style={styles.addressBody}>{address.address}, {address.city}, {address.state}</Text>
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.addressMeta}>{address.phone}</Text>
                </View>
                {address.landmark ? <Text style={styles.landmark}>Landmark: {address.landmark}</Text> : null}
              </View>

              <View style={styles.actionsColumn}>
                {address._id ? (
                  <TouchableOpacity style={styles.iconAction} onPress={() => handleEdit(address)}>
                    <Ionicons name="create-outline" size={18} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                ) : null}
                {!address.isDefault && address._id ? (
                  <TouchableOpacity style={styles.iconAction} onPress={() => handleDefault(address._id!)}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.brand} />
                  </TouchableOpacity>
                ) : null}
                {address._id ? (
                  <TouchableOpacity style={styles.iconAction} onPress={() => handleDelete(address._id!)}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.rose} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  subheading: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: theme.spacing.sm, maxWidth: 220 },
  headerButton: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: theme.colors.brandSoft, borderWidth: 1, borderColor: "rgba(59,130,246,0.22)" },
  headerButtonLabel: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  formCard: { position: "relative", padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: "rgba(59,130,246,0.22)", overflow: "hidden", marginBottom: theme.spacing.xxl },
  formGlow: { position: "absolute", top: -80, right: -80, width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(59,130,246,0.12)" },
  formKicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  formTitle: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  fieldBlock: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  label: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  input: { height: 56, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: "rgba(255,255,255,0.05)", color: theme.colors.textPrimary, paddingHorizontal: theme.spacing.lg, fontSize: 15 },
  primaryButton: { height: 56, borderRadius: 18, backgroundColor: theme.colors.textPrimary, alignItems: "center", justifyContent: "center", marginTop: theme.spacing.xl },
  primaryLabel: { color: theme.colors.canvas, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  emptyCard: { padding: theme.spacing.xxl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center" },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.xl },
  emptyBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: theme.spacing.md },
  addressCard: { position: "relative", padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg, overflow: "hidden" },
  defaultRibbon: { position: "absolute", top: 0, right: 24, backgroundColor: theme.colors.brand, paddingHorizontal: 12, paddingVertical: 6, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  defaultRibbonText: { color: theme.colors.textPrimary, fontSize: 8, fontWeight: "900", letterSpacing: 1.3 },
  addressHeader: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  addressTitleWrap: { flex: 1 },
  labelChip: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  labelChipText: { color: theme.colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1.3, textTransform: "uppercase" },
  addressName: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  addressMeta: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  addressBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.sm, maxWidth: 260 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  landmark: { color: theme.colors.textTertiary, fontSize: 12, lineHeight: 18, marginTop: theme.spacing.sm },
  actionsColumn: { gap: theme.spacing.sm },
  iconAction: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: theme.colors.border }
});
