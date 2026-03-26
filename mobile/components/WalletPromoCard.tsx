import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  balance?: string;
  onTopUpPress?: () => void;
  onUseWalletPress?: () => void;
};

export function WalletPromoCard({ balance = "₦18,500", onTopUpPress, onUseWalletPress }: Props) {
  return (
    <LinearGradient
      colors={["rgba(59,130,246,0.22)", "rgba(16,185,129,0.12)", "rgba(255,255,255,0.04)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.kicker}>WALLET BALANCE</Text>
      <Text style={styles.balance}>{balance}</Text>
      <Text style={styles.body}>Use wallet for faster checkout and smoother payment confirmation.</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primary} activeOpacity={0.85} onPress={onTopUpPress}>
          <Text style={styles.primaryLabel}>Top Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} activeOpacity={0.85} onPress={onUseWalletPress}>
          <Text style={styles.secondaryLabel}>Use Wallet</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.hero,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
    marginBottom: theme.spacing.xxl
  },
  kicker: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8
  },
  balance: {
    color: theme.colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    marginTop: theme.spacing.sm,
    fontStyle: "italic"
  },
  body: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: theme.spacing.md
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl
  },
  primary: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryLabel: {
    color: theme.colors.black,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1
  },
  secondary: {
    flex: 1,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center"
  },
  secondaryLabel: {
    color: theme.colors.textPrimary,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1
  }
});
