export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  imageColor: string;
  imageUrl?: string;
  compatibility: string;
  description: string;
  walletPerk?: string;
};

export const categories = [
  "Cases",
  "Chargers",
  "Audio",
  "Protectors",
  "Power Banks",
  "Adapters"
];

export const products: Product[] = [
  {
    id: "1",
    name: "AeroShield MagSafe Case",
    category: "Cases",
    price: 18500,
    compareAtPrice: 22000,
    imageColor: "#1D4ED8",
    compatibility: "iPhone 15 Pro",
    description: "Slim shockproof case with secure MagSafe alignment and premium matte finish.",
    walletPerk: "5% off with Wallet"
  },
  {
    id: "2",
    name: "Flux 30W Fast Charger",
    category: "Chargers",
    price: 14500,
    imageColor: "#7C3AED",
    compatibility: "USB-C devices",
    description: "Compact fast charger built for efficient daily charging with clean thermal control."
  },
  {
    id: "3",
    name: "Pulse ANC Earbuds",
    category: "Audio",
    price: 32500,
    compareAtPrice: 38000,
    imageColor: "#E11D48",
    compatibility: "iOS and Android",
    description: "Comfortable wireless earbuds with sharp audio tuning and deep bass response.",
    walletPerk: "Free delivery with Wallet"
  },
  {
    id: "4",
    name: "Crystal Screen Guard",
    category: "Protectors",
    price: 9500,
    imageColor: "#0F766E",
    compatibility: "Samsung S24",
    description: "Tempered protection with clean fit, edge sealing, and anti-smudge coating."
  }
];

export const trendingSearches = [
  "iPhone 15 case",
  "30W charger",
  "Type-C adapter",
  "Oraimo earbuds"
];

export const recentSearches = [
  "MagSafe case",
  "Power bank",
  "AirPods case"
];

export const orderTimeline = [
  { label: "Order Confirmed", time: "Today, 10:12 AM" },
  { label: "Packed for Shipment", time: "Today, 12:40 PM" },
  { label: "Out for Delivery", time: "Tomorrow, 9:00 AM" }
];
