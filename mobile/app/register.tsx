import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);
      await register({
        ...form,
        phone: form.phone.startsWith("0") ? form.phone : `0${form.phone}`
      });
      router.replace("/verify-otp");
    } catch (error) {
      Alert.alert("Registration failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppHeader showBack />

      <View style={styles.card}>
        <View style={styles.hero}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Join Nigeria&apos;s premium gear hub</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Tosin"
              placeholderTextColor={theme.colors.textTertiary}
              value={form.firstName}
              onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Adewale"
              placeholderTextColor={theme.colors.textTertiary}
              value={form.lastName}
              onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.textTertiary}
            value={form.email}
            onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PHONE NUMBER</Text>
          <View style={styles.phoneWrap}>
            <Text style={styles.prefix}>+234</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="800 000 0000"
              placeholderTextColor={theme.colors.textTertiary}
              value={form.phone}
              onChangeText={(value) => setForm((current) => ({ ...current, phone: value.replace(/\D/g, "") }))}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Create password"
            placeholderTextColor={theme.colors.textTertiary}
            value={form.password}
            onChangeText={(value) => setForm((current) => ({ ...current, password: value }))}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.primary} activeOpacity={0.9} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryLabel}>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { flexGrow: 1, padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 80, justifyContent: "center" },
  card: {
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.hero,
    paddingHorizontal: 24,
    paddingVertical: 28
  },
  hero: {
    alignItems: "center",
    marginBottom: 24
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -0.6
  },
  subheading: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    gap: theme.spacing.md
  },
  fieldHalf: {
    flex: 1,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  fieldGroup: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  label: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8
  },
  input: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 15
  },
  phoneWrap: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg
  },
  prefix: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    marginRight: theme.spacing.md
  },
  phoneInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15
  },
  primary: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md
  },
  primaryLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.8
  },
  link: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 24,
    textAlign: "center"
  },
  linkAccent: {
    color: theme.colors.brand,
    fontWeight: "800"
  }
});
