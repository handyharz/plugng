import { CartProvider } from "@/context/CartContext";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Navbar } from "@/components/Navbar";
import { CartSidebar } from "@/components/CartSidebar";
import { Footer } from "@/components/Footer";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NotificationProvider>
            <WishlistProvider>
                <CartProvider>
                    <CheckoutProvider>
                        <Navbar />
                        <CartSidebar />
                        <main className="pt-32 min-h-screen">
                            {children}
                        </main>
                        <Footer />
                    </CheckoutProvider>
                </CartProvider>
            </WishlistProvider>
        </NotificationProvider>
    );
}
