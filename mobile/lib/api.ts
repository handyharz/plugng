import { getAuthToken } from "@/lib/auth";
import type { Address, AuthUser } from "@/context/AuthContext";

export type ApiProduct = {
  _id: string;
  slug?: string;
  name: string;
  description: string;
  brand?: string;
  category?: string | { _id?: string; name?: string; slug?: string };
  images?: { url: string; isPrimary?: boolean; alt?: string }[];
  searchAliases?: string[];
  options?: {
    name: string;
    values: {
      value: string;
      swatchUrl?: string;
      swatchKey?: string;
    }[];
  }[];
  variants?: {
    _id?: string;
    sku?: string;
    sellingPrice: number;
    compareAtPrice?: number;
    stock?: number;
    image?: string;
    attributeValues?: Record<string, string> | Map<string, string>;
  }[];
  specifications?: { key?: string; value?: string }[];
  compatibility?: {
    brands?: string[];
    models?: string[];
  };
  featured?: boolean;
  status?: string;
};

export type CartItem = {
  product: ApiProduct | string;
  variantId?: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
};

export type WishlistResponse = {
  _id?: string;
  items: { product: ApiProduct; addedAt?: string }[];
};

export type WalletTransaction = {
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8085/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const rawMessage = await response.text();
    let message = rawMessage;

    try {
      const parsed = JSON.parse(rawMessage);
      message = parsed?.message || parsed?.error?.message || parsed?.status || rawMessage;
    } catch {
      if (rawMessage.trim().startsWith("<!DOCTYPE html") || rawMessage.trim().startsWith("<html")) {
        message = `Request failed with status ${response.status}`;
      }
    }

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiConfig = {
  baseUrl: API_BASE_URL
};

export const authApi = {
  login: async (credentials: { email?: string; emailOrPhone?: string; password: string }) => {
    return request<{ status: string; token: string; data: { user: any } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },
  register: async (payload: Record<string, unknown>) => {
    return request<{ status: string; token: string; data: { user: any } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  verifyOTP: async (otp: string) => {
    return request<{ status: string; message: string }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ otp })
    });
  },
  resendOTP: async () => {
    return request<{ status: string; message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({})
    });
  },
  me: async () => {
    return request<{ status: string; data: { user: AuthUser } }>("/auth/me");
  }
};

export const userApi = {
  me: async () => request<{ status: string; data: { user: AuthUser } }>("/users/me"),
  updateProfile: async (payload: Pick<AuthUser, "firstName" | "lastName">) =>
    request<{ status: string; data: { user: AuthUser } }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  addAddress: async (address: Record<string, unknown>) =>
    request<{ status: string; data: { user: AuthUser } }>("/users/address", {
      method: "POST",
      body: JSON.stringify({ address, isDefault: true })
    }),
  updateAddress: async (addressId: string, address: Record<string, unknown>) =>
    request<{ status: string; data: { user: AuthUser } }>(`/users/address/${addressId}`, {
      method: "PATCH",
      body: JSON.stringify({ address })
    }),
  deleteAddress: async (addressId: string) =>
    request<{ status: string; data: { user: AuthUser } }>(`/users/address/${addressId}`, {
      method: "DELETE"
    }),
  setDefaultAddress: async (addressId: string) =>
    request<{ status: string; data: { user: AuthUser } }>(`/users/address/${addressId}/default`, {
      method: "PATCH"
    }),
  updatePassword: async (payload: { currentPassword: string; newPassword: string }) =>
    request<{ status: string; message: string }>("/users/password", {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteAccount: async (payload: { password: string; confirmation: string }) =>
    request<{ status: string; message: string }>("/users/me", {
      method: "DELETE",
      body: JSON.stringify(payload)
    })
};

export const productApi = {
  getAll: async (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<{ status: string; data: { products: ApiProduct[]; total: number; page: number; pages: number } }>(
      `/products${suffix}`
    );
  },
  getById: async (id: string) => {
    return request<{ status: string; data: { product: ApiProduct } }>(`/products/${id}`);
  }
};

export const searchApi = {
  instant: async (query: string) => {
    return request<{
      status: string;
      data: {
        products: ApiProduct[];
        categories: any[];
        brands: string[];
        suggestions: string[];
        trending: {
          terms: string[];
          categories: any[];
          brands: string[];
        };
        queryMeta: {
          normalizedQuery: string;
          expandedTerms: string[];
          personalized: boolean;
        };
      };
    }>(
      `/search/instant?q=${encodeURIComponent(query)}`
    );
  },
  trending: async () => {
    return request<{
      status: string;
      data: {
        terms: string[];
        categories: any[];
        brands: string[];
      };
    }>("/search/trending");
  }
};

export const wishlistApi = {
  get: async () => request<{ status: string; data: { wishlist: WishlistResponse } }>("/wishlist"),
  add: async (productId: string) =>
    request<{ status: string; data: { wishlist: WishlistResponse } }>("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId })
    }),
  remove: async (productId: string) =>
    request<{ status: string; data: { wishlist: WishlistResponse } }>(`/wishlist/${productId}`, {
      method: "DELETE"
    })
};

export const cartApi = {
  get: async () => request<{ status: string; data: { cart: CartItem[] } }>("/cart"),
  add: async (payload: { productId: string; quantity: number; variantId?: string; selectedOptions?: Record<string, string> }) =>
    request<{ status: string; data: { cart: CartItem[] } }>("/cart/add", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  update: async (payload: { productId: string; quantity: number; variantId?: string }) =>
    request<{ status: string; data: { cart: CartItem[] } }>("/cart/update", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  remove: async (payload: { productId: string; variantId?: string }) =>
    request<{ status: string; data: { cart: CartItem[] } }>("/cart/remove", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const orderApi = {
  create: async (payload: { shippingAddress: Address; paymentMethod: "wallet" | "card" | "bank_transfer"; couponCode?: string; callbackUrl?: string }) =>
    request<{ status: string; data: { order: any; paymentUrl?: string; accessCode?: string; reference?: string } }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  verify: async (reference: string) =>
    request<{ status: string; data: { order: any } }>(`/orders/verify?reference=${encodeURIComponent(reference)}`),
  getMyOrders: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<{ status: string; data: { orders: any[]; total: number; page: number; pages: number } }>(
      `/orders/my-orders${suffix}`
    );
  },
  getById: async (id: string) =>
    request<{ status: string; data: { order: any } }>(`/orders/${id}`)
};

export const walletApi = {
  initializeTopup: async (amount: number, callbackUrl?: string) =>
    request<{ status: string; data: { paymentUrl: string; reference: string } }>("/wallet/initialize", {
      method: "POST",
      body: JSON.stringify({ amount, callbackUrl })
    }),
  verifyTopup: async (reference: string) =>
    request<{ status: string; message?: string; data?: { balance: number; transaction: WalletTransaction } }>(
      `/wallet/verify?reference=${encodeURIComponent(reference)}`
    ),
  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<{ status: string; data: { transactions: WalletTransaction[]; total: number; page: number; pages: number } }>(
      `/wallet/transactions${suffix}`
    );
  }
};

export const ticketApi = {
  create: async (ticketData: { subject: string; description: string; priority?: string; order?: string }) =>
    request<{ status: string; data: { ticket: any } }>("/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData)
    }),
  getMyTickets: async () =>
    request<{ status: string; results: number; data: { tickets: any[] } }>("/tickets/my-tickets"),
  getDetails: async (id: string) =>
    request<{ status: string; data: { ticket: any } }>(`/tickets/${id}`),
  addComment: async (id: string, message: string) =>
    request<{ status: string; data: { ticket: any } }>(`/tickets/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ message })
    })
};

export const reviewApi = {
  getProductReviews: async (productId: string) =>
    request<{ status: string; data: { reviews: any[] } }>(`/reviews/product/${productId}`),
  getMyReviews: async () =>
    request<{ status: string; data: { reviews: any[] } }>("/reviews/my-reviews")
};

export const notificationApi = {
  getMyNotifications: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<{ success: boolean; data: any[]; meta: { total: number; page: number; limit: number; pages: number } }>(
      `/notifications${suffix}`
    );
  },
  getUnreadCount: async () =>
    request<{ success: boolean; data: { count: number } }>("/notifications/unread-count"),
  markAsRead: async (id: string) =>
    request<{ success: boolean; data: any }>(`/notifications/${id}/read`, {
      method: "PATCH"
    }),
  markAllAsRead: async () =>
    request<{ success: boolean; message: string }>("/notifications/read-all", {
      method: "PATCH"
    })
};

export const trackingApi = {
  getPublicTracking: async (orderNumber: string) =>
    request<{ status: string; data: any }>(`/track/${encodeURIComponent(orderNumber)}`),
  verifyAndTrack: async (orderNumber: string, credentials: { email?: string; phone?: string }) =>
    request<{ status: string; data: any }>(`/track/${encodeURIComponent(orderNumber)}/verify`, {
      method: "POST",
      body: JSON.stringify(credentials)
    })
};

export function toMobileProduct(product: ApiProduct) {
  const primaryImage = product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url;
  const firstVariant = product.variants?.[0];
  const categoryName = typeof product.category === "string" ? product.category : product.category?.name || "Product";
  const compatibilityLabel =
    product.compatibility?.models?.[0] ||
    product.compatibility?.brands?.[0] ||
    product.brand ||
    "Compatible devices";

  return {
    id: product._id,
    name: product.name,
    category: categoryName,
    price: firstVariant?.sellingPrice || 0,
    compareAtPrice: firstVariant?.compareAtPrice,
    imageColor: "#1D4ED8",
    compatibility: compatibilityLabel,
    description: product.description,
    walletPerk: firstVariant?.compareAtPrice ? "Wallet perks available" : undefined,
    imageUrl: primaryImage
  };
}

export function toMobileCartProduct(item: CartItem) {
  const product = typeof item.product === "string" ? null : item.product;
  return {
    id: product?._id || "",
    name: product?.name || "Product",
    category: typeof product?.category === "string" ? product.category : product?.category?.name || "Product",
    price: product?.variants?.[0]?.sellingPrice || 0,
    compareAtPrice: product?.variants?.[0]?.compareAtPrice,
    imageColor: "#1D4ED8",
    imageUrl: product?.images?.find((image) => image.isPrimary)?.url || product?.images?.[0]?.url,
    compatibility: product?.brand || "Compatible devices",
    description: product?.description || "",
    quantity: item.quantity,
    variantId: item.variantId
  };
}
