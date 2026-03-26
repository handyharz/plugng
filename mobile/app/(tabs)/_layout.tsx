import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { theme } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 88,
          paddingTop: 8
        },
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.textTertiary
      }}
    >
      {[
        ["index", "home", "Home"],
        ["search", "search", "Search"],
        ["wishlist", "heart", "Wishlist"],
        ["orders", "cube", "Orders"],
        ["account", "person", "Account"]
      ].map(([name, icon, label]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, size }) => <Ionicons name={icon as any} size={size} color={color} />
          }}
        />
      ))}
    </Tabs>
  );
}

