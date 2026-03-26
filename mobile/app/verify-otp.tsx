import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { theme } from "@/constants/theme";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpScreen() {
  const { refreshUser, user } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    try {
      setLoading(true);
      await authApi.verifyOTP(otp);
      await refreshUser();
      Alert.alert("Phone verified", "Your account is now ready for shopping.");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Verification failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setResending(true);
      await authApi.resendOTP();
      Alert.alert("Code sent", "A new verification code has been sent to your phone.");
    } catch (error) {
      Alert.alert("Could not resend code", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <AppHeader showBack />

        <View style={styles.card}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>PHONE SECURITY</Text>
          </View>
          <Text style={styles.heading}>Verify Your Number</Text>
          <Text style={styles.body}>
            Enter the 6-digit code sent to {user?.phone || "your phone"} so we can protect your orders and wallet activity.
          </Text>

          <Text style={styles.label}>VERIFICATION CODE</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={theme.colors.textTertiary}
            value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleVerify} disabled={loading || otp.length !== 6}>
            <Text style={styles.primaryLabel}>{loading ? "VERIFYING..." : "VERIFY PHONE"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleResend} disabled={resending}>
            <Text style={styles.secondaryLabel}>{resending ? "SENDING..." : "RESEND CODE"}</Text>
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
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand
  },
  kicker: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -0.7
  },
  body: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl
  },
  label: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: theme.spacing.sm
  },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 6
  },
  primaryButton: {
    marginTop: theme.spacing.xl,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center"
  },
  primaryLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.8
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center"
  },
  secondaryLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6
  }
});
