import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  primaryLabel: string;
  secondaryLabel?: string;
  priceLabel?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

export function StickyBottomBar({ primaryLabel, secondaryLabel, priceLabel, onPrimaryPress, onSecondaryPress }: Props) {
  return (
    <View style={styles.container}>
      {priceLabel ? (
        <View style={styles.priceWrap}>
          <Text style={styles.meta}>TOTAL</Text>
          <Text style={styles.price}>{priceLabel}</Text>
        </View>
      ) : null}
      {secondaryLabel ? (
        <TouchableOpacity style={styles.secondary} activeOpacity={0.85} onPress={onSecondaryPress}>
          <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.primary} activeOpacity={0.85} onPress={onPrimaryPress}>
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  priceWrap: {
    marginRight: "auto"
  },
  meta: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  price: {
    color: theme.colors.brand,
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: 2
  },
  secondary: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  secondaryLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1
  },
  primary: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand
  },
  primaryLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1
  }
});
