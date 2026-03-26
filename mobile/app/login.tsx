import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await login({ emailOrPhone, password });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <AppHeader showBack />

        <View style={styles.card}>
          <View style={styles.hero}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>Sign in to your premium hub</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL / PHONE</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textTertiary}
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.inlineLabelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <Pressable>
                  <Text style={styles.inlineLink}>FORGOT?</Text>
                </Pressable>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.primary} activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
              <Text style={styles.primaryLabel}>{loading ? "AUTHENTICATING..." : "SIGN IN"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>Don&apos;t have an account? <Text style={styles.linkAccent}>Register Now</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { flex: 1, padding: theme.spacing.xl, paddingTop: 64, justifyContent: "center" },
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
    marginBottom: 28
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -0.8
  },
  subheading: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: theme.spacing.sm
  },
  form: {
    gap: theme.spacing.xl
  },
  fieldGroup: {
    gap: theme.spacing.sm
  },
  label: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8
  },
  inlineLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  inlineLink: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4
  },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
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
    marginTop: theme.spacing.sm
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
