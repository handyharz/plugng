import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  title?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  brand?: boolean;
};

export function AppHeader({ title, showBack, rightSlot, brand }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        {brand ? (
          <View>
            <Text style={styles.brand}>Plug<Text style={styles.brandAccent}>NG</Text></Text>
            <Text style={styles.meta}>YOUR PLUG</Text>
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>
      <View style={styles.right}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  brand: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic"
  },
  brandAccent: {
    color: theme.colors.brand
  },
  meta: {
    marginTop: 2,
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic"
  }
});

