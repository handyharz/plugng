import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

const items = ["Authentic Gear", "Secure Pay", "Fast Delivery"];

export function TrustBadgeRow() {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item} style={styles.badge}>
          <Text style={styles.label}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap"
  },
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5
  }
});

