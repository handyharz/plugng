import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  placeholder: string;
  initialQuery?: string;
};

export function SearchEntryBar({ placeholder, initialQuery }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={() =>
        router.push(
          initialQuery?.trim()
            ? { pathname: "/search", params: { q: initialQuery.trim() } }
            : "/search"
        )
      }
    >
      <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
      <Text style={styles.text}>{placeholder}</Text>
      <Ionicons name="arrow-forward" size={18} color={theme.colors.brand} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginBottom: theme.spacing.lg
  },
  text: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "500"
  }
});
