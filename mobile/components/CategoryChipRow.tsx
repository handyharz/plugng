import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  categories: string[];
  onSelect?: (category: string) => void;
};

export function CategoryChipRow({ categories, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category}
          style={[styles.chip, index === 0 && styles.chipActive]}
          activeOpacity={0.8}
          onPress={() => onSelect?.(category)}
        >
          <Text style={[styles.label, index === 0 && styles.labelActive]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  chipActive: {
    backgroundColor: theme.colors.brandSoft,
    borderColor: theme.colors.brand
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700"
  },
  labelActive: {
    color: theme.colors.textPrimary
  }
});
