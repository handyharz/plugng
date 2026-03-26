import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";
import { userApi } from "@/lib/api";

export default function CheckoutAddressScreen() {
  const { isAuthenticated, user, setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const addresses = user?.addresses || [];
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    user?.addresses.find((address) => address.isDefault)?._id || user?.addresses[0]?._id
  );
  const [form, setForm] = useState({
    label: "Home",
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    landmark: ""
  });

  const selectedAddress = useMemo(
    () => addresses.find((address) => address._id === selectedAddressId) || addresses[0],
    [addresses, selectedAddressId]
  );

  async function handleSaveAddress() {
    try {
      setSubmitting(true);
      const response = await userApi.addAddress(form);
      setUser(response.data.user);
      const nextAddress = response.data.user.addresses[response.data.user.addresses.length - 1];
      setSelectedAddressId(nextAddress?._id);
      setShowForm(false);
      Alert.alert("Address saved", "Your delivery address has been added for checkout.");
    } catch (error) {
      Alert.alert("Could not save address", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!selectedAddress?._id) {
      Alert.alert("Select an address", "Choose a delivery address or add a new one first.");
      return;
    }

    router.push({ pathname: "/checkout/payment", params: { addressId: selectedAddress._id } });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Checkout" showBack />
        <Text style={styles.step}>STEP 1 OF 3</Text>
        <Text style={styles.heading}>Delivery Hub</Text>

        <View style={styles.heroCard}>
          <Text style={styles.kicker}>ADDRESS ROUTING</Text>
          <Text style={styles.heroTitle}>Choose Your Delivery Terminal</Text>
          <Text style={styles.heroBody}>Select one of your saved hubs or add a fresh destination for this order.</Text>
        </View>

        {addresses.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No Saved Address Yet</Text>
            <Text style={styles.cardBody}>Add one below to continue with checkout.</Text>
          </View>
        ) : addresses.map((address) => (
          <TouchableOpacity
            key={address._id || address.label}
            style={[styles.card, selectedAddressId === address._id && styles.cardActive]}
            activeOpacity={0.9}
            onPress={() => setSelectedAddressId(address._id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardMeta}>{address.label.toUpperCase()}</Text>
              {address.isDefault ? <Text style={styles.defaultBadge}>DEFAULT HUB</Text> : null}
            </View>
            <Text style={styles.cardTitle}>{address.fullName}</Text>
            <Text style={styles.cardBody}>{address.address}, {address.city}, {address.state}</Text>
            <Text style={styles.cardBody}>{address.phone}</Text>
          </TouchableOpacity>
        ))}

        {addresses.length > 0 && !showForm ? (
          <TouchableOpacity style={styles.addNewCard} activeOpacity={0.9} onPress={() => setShowForm(true)}>
            <Text style={styles.addNewKicker}>NEED ANOTHER HUB?</Text>
            <Text style={styles.addNewTitle}>Add New Address</Text>
            <Text style={styles.addNewBody}>Use a different delivery destination for this order without leaving checkout.</Text>
          </TouchableOpacity>
        ) : null}

        {showForm ? (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add New Address</Text>
              {addresses.length > 0 ? (
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.formCancel}>CANCEL</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {[
              ["Label", "label"],
              ["Full Name", "fullName"],
              ["Phone Number", "phone"],
              ["Address", "address"],
              ["City", "city"],
              ["State", "state"],
              ["Landmark", "landmark"]
            ].map(([field, key]) => (
              <View key={field} style={styles.fieldWrap}>
                <Text style={styles.fieldCaption}>{field.toUpperCase()}</Text>
                <TextInput
                  style={styles.field}
                  placeholder={field}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={form[key as keyof typeof form]}
                  onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.inlineButton} onPress={handleSaveAddress} disabled={submitting}>
              <Text style={styles.inlineButtonLabel}>{submitting ? "SAVING..." : "SAVE ADDRESS"}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      <StickyBottomBar primaryLabel="Continue to Payment" onPrimaryPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  step: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  heading: { color: theme.colors.textPrimary, fontSize: 30, fontWeight: "900", fontStyle: "italic", marginTop: theme.spacing.sm, marginBottom: theme.spacing.xl },
  heroCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xxl },
  kicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  heroBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.md },
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.xl, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.lg },
  cardActive: { borderColor: theme.colors.brand, backgroundColor: theme.colors.brandSoft },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardMeta: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800", marginTop: theme.spacing.sm },
  cardBody: { color: theme.colors.textSecondary, fontSize: 14, marginTop: theme.spacing.sm },
  defaultBadge: { color: theme.colors.textPrimary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  addNewCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: theme.colors.border, marginTop: theme.spacing.md },
  addNewKicker: { color: theme.colors.brand, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  addNewTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginTop: theme.spacing.md },
  addNewBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: theme.spacing.sm },
  formCard: { padding: theme.spacing.xl, borderRadius: theme.radius.hero, backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.border, marginTop: theme.spacing.xl },
  formHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.md },
  formTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginBottom: theme.spacing.lg },
  formCancel: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  fieldWrap: { marginBottom: theme.spacing.md },
  fieldCaption: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: theme.spacing.sm },
  field: { height: 52, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.glass, color: theme.colors.textPrimary, fontSize: 14 },
  inlineButton: { marginTop: theme.spacing.md, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" },
  inlineButtonLabel: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: "900", letterSpacing: 1.6 }
});
