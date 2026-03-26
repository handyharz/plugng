import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WishlistProvider } from "@/context/WishlistContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#090909" } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="verify-otp" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="cart" />
                <Stack.Screen name="wallet" />
                <Stack.Screen name="track-order" />
                <Stack.Screen name="support" />
                <Stack.Screen name="support/[id]" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="account/profile" />
                <Stack.Screen name="account/addresses" />
                <Stack.Screen name="account/security" />
                <Stack.Screen name="account/reviews" />
                <Stack.Screen name="checkout/index" />
                <Stack.Screen name="checkout/payment" />
                <Stack.Screen name="checkout/review" />
                <Stack.Screen name="checkout/success" />
                <Stack.Screen name="order/[id]" />
              </Stack>
            </>
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
