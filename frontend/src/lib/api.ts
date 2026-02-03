import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        // Don't log 401 errors for the /auth/me check - it's expected when not logged in
        if (error.response?.status === 401 && error.config?.url === '/auth/me') {
            return Promise.reject(error);
        }
        console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// Types
export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string;
    parent?: string;
    level: number;
    order: number;
    active: boolean;
    featured: boolean;
    productCount: number;
    children?: Category[];
    products?: { name: string; image: string }[];
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    category: string | Category;
    brand?: string;
    images: {
        url: string;
        key: string;
        alt?: string;
        isPrimary: boolean;
    }[];
    options?: {
        name: string;
        values: {
            value: string;
            swatchUrl?: string;
            swatchKey?: string;
        }[];
    }[];
    variants?: {
        _id: string;
        sku: string;
        attributeValues: Record<string, string>;
        costPrice: number;
        sellingPrice: number;
        compareAtPrice?: number;
        stock: number;
        image?: string;
    }[];
    specifications?: {
        key: string;
        value: string;
    }[];
    status: 'active' | 'draft' | 'out_of_stock';
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserAddress {
    _id?: string;
    isDefault: boolean;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'customer' | 'admin' | 'super_admin' | 'manager' | 'support' | 'editor';
    emailVerified: boolean;
    phoneVerified: boolean;
    addresses: UserAddress[];
    walletBalance?: number; // Legacy or calculated
    wallet: {
        balance: number;
        transactions: {
            type: 'credit' | 'debit';
            amount: number;
            description: string;
            date: string;
        }[];
    };
    totalSpent: number;
    loyaltyTier: 'Enthusiast' | 'Elite' | 'Master';
}

// API Functions
export const authApi = {
    register: async (userData: any) => {
        const { data } = await api.post<{ status: string; token: string; data: { user: User } }>('/auth/register', userData);
        return data;
    },

    login: async (credentials: any) => {
        const { data } = await api.post<{ status: string; token: string; data: { user: User } }>('/auth/login', credentials);
        return data;
    },

    verifyOTP: async (otpData: { otp: string }) => {
        const { data } = await api.post<{ status: string; message: string }>('/auth/verify', otpData);
        return data;
    },

    resendOTP: async (phone?: string) => {
        const { data } = await api.post<{ status: string; message: string }>('/auth/resend-otp', { phone });
        return data;
    },

    getMe: async () => {
        const { data } = await api.get<{ status: string; data: { user: User } }>('/auth/me');
        return data.data.user;
    },

    logout: async () => {
        const { data } = await api.get<{ status: string }>('/auth/logout');
        return data;
    },
};

export const categoryApi = {
    getAll: async (params?: { level?: number; featured?: boolean; active?: boolean }) => {
        const { data } = await api.get<{ status: string; results: number; data: { categories: Category[] } }>('/categories', { params });
        return data.data.categories;
    },

    getTree: async () => {
        const { data } = await api.get<{ status: string; data: { tree: Category[] } }>('/categories/tree');
        return data.data.tree;
    },

    getBySlug: async (slug: string) => {
        const { data } = await api.get<{ status: string; data: { category: Category } }>(`/categories/${slug}`);
        return data.data.category;
    },
};

export const productApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
        sort?: string;
        minPrice?: number;
        maxPrice?: number;
        inStock?: boolean;
        onSale?: boolean;
        featured?: boolean;
        trending?: boolean;
        brands?: string[];
        colors?: string[];
    }) => {
        const { data } = await api.get<{
            status: string;
            results: number;
            data: {
                products: Product[];
                total: number;
                page: number;
                pages: number;
            };
        }>('/products', { params });
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<{ status: string; data: { product: Product } }>(`/products/${id}`);
        return data.data.product;
    },

    getFilterOptions: async () => {
        const { data } = await api.get<{
            status: string;
            data: {
                brands: string[];
                colors: string[];
            };
        }>('/products/filters/options');
        return data.data;
    },
};

export const cartApi = {
    get: async () => {
        const { data } = await api.get<{ status: string; data: { cart: any[] } }>('/cart');
        return data.data.cart;
    },
    add: async (item: { productId: string; variantId?: string; quantity: number; selectedOptions?: Record<string, string> }) => {
        const { data } = await api.post<{ status: string; data: { cart: any[] } }>('/cart/add', item);
        return data.data.cart;
    },
    remove: async (item: { productId: string; variantId?: string }) => {
        const { data } = await api.post<{ status: string; data: { cart: any[] } }>('/cart/remove', item);
        return data.data.cart;
    },
    update: async (item: { productId: string; variantId?: string; quantity: number }) => {
        const { data } = await api.put<{ status: string; data: { cart: any[] } }>('/cart/update', item);
        return data.data.cart;
    },
    sync: async (items: any[]) => {
        const { data } = await api.post<{ status: string; data: { cart: any[] } }>('/cart/sync', { items });
        return data.data.cart;
    }
};

export const orderApi = {
    create: async (orderData: { shippingAddress: any; paymentMethod: string; couponCode?: string }) => {
        const { data } = await api.post<{ status: string; data: { order: any; paymentUrl?: string; accessCode?: string; reference?: string } }>('/orders', orderData);
        return data.data;
    },
    verify: async (reference: string) => {
        const { data } = await api.get<{ status: string; data: { order: any } }>(`/orders/verify?reference=${reference}`);
        return data.data.order;
    },
    getMyOrders: async (params?: { page: number; limit: number }) => {
        const { data } = await api.get<{
            status: string;
            data: { orders: any[]; total: number; page: number; pages: number }
        }>('/orders/my-orders', { params });
        return data.data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<{ status: string; data: { order: any } }>(`/orders/${id}`);
        return data.data.order;
    }
};

export const walletApi = {
    initializeTopup: async (amount: number) => {
        const { data } = await api.post<{ status: string; data: { paymentUrl: string; reference: string } }>('/wallet/initialize', { amount });
        return data.data;
    },
    verifyTopup: async (reference: string) => {
        const { data } = await api.get<{ status: string; data: { balance: number; transaction: any } }>(`/wallet/verify?reference=${reference}`);
        return data.data;
    },
    getTransactionHistory: async (params?: { page: number; limit: number }) => {
        const { data } = await api.get<{
            status: string;
            data: { transactions: any[]; total: number; page: number; pages: number }
        }>('/wallet/transactions', { params });
        return data.data;
    }
};

export const userApi = {
    getProfile: async () => {
        const { data } = await api.get<{ status: string; data: { user: User } }>('/users/me');
        return data.data.user;
    },
    updateProfile: async (userData: Partial<User>) => {
        const { data } = await api.put<{ status: string; data: { user: User } }>('/users/me', userData);
        return data.data.user;
    },
    addAddress: async (address: any) => {
        const { data } = await api.post<{ status: string; data: { user: User } }>('/users/address', { address, isDefault: true });
        return data.data.user;
    },
    deleteAddress: async (addressId: string) => {
        const { data } = await api.delete<{ status: string; data: { user: User } }>(`/users/address/${addressId}`);
        return data.data.user;
    },
    setDefaultAddress: async (addressId: string) => {
        const { data } = await api.patch<{ status: string; data: { user: User } }>(`/users/address/${addressId}/default`);
        return data.data.user;
    },
    updatePassword: async (passwordData: any) => {
        const { data } = await api.patch<{ status: string; message: string }>('/users/password', passwordData);
        return data;
    }
};

export const wishlistApi = {
    get: async () => {
        const { data } = await api.get<{ status: string; data: { wishlist: any } }>('/wishlist');
        return data.data.wishlist;
    },
    add: async (productId: string) => {
        const { data } = await api.post<{ status: string; data: { wishlist: any } }>('/wishlist/add', { productId });
        return data.data.wishlist;
    },
    remove: async (productId: string) => {
        const { data } = await api.delete<{ status: string; data: { wishlist: any } }>(`/wishlist/${productId}`);
        return data.data.wishlist;
    },
    clear: async () => {
        const { data } = await api.delete<{ status: string; message: string }>('/wishlist');
        return data;
    }
};

export const ticketApi = {
    create: async (ticketData: { subject: string; description: string; priority?: string; order?: string }) => {
        const { data } = await api.post<{ status: string; data: { ticket: any } }>('/tickets', ticketData);
        return data.data.ticket;
    },
    getMyTickets: async () => {
        const { data } = await api.get<{ status: string; data: { tickets: any[] } }>('/tickets/my-tickets');
        return data.data.tickets;
    },
    getDetails: async (id: string) => {
        const { data } = await api.get<{ status: string; data: { ticket: any } }>(`/tickets/${id}`);
        return data.data.ticket;
    },
    addComment: async (id: string, message: string) => {
        const { data } = await api.post<{ status: string; data: { ticket: any } }>(`/tickets/${id}/comments`, { message });
        return data.data.ticket;
    }
};

export const reviewApi = {
    create: async (reviewData: { product: string; order: string; rating: number; comment: string; images?: { url: string; alt?: string }[] }) => {
        const { data } = await api.post<{ status: string; data: { review: any } }>('/reviews', reviewData);
        return data.data.review;
    },
    getMyReviews: async () => {
        const { data } = await api.get<{ status: string; data: { reviews: any[] } }>('/reviews/my-reviews');
        return data.data.reviews;
    },
    getProductReviews: async (productId: string) => {
        const { data } = await api.get<{ status: string; data: { reviews: any[] } }>(`/reviews/product/${productId}`);
        return data.data.reviews;
    }
};

export const searchApi = {
    getInstantResults: async (query: string) => {
        const { data } = await api.get<{ status: string; data: { products: any[]; categories: any[]; brands: string[] } }>(`/search/instant?q=${encodeURIComponent(query)}`);
        return data.data;
    }
};

export const notificationApi = {
    getMyNotifications: async (params?: { page?: number; limit?: number }) => {
        const { data } = await api.get<{ success: boolean; data: any[]; meta: any }>('/notifications', { params });
        return data;
    },
    getUnreadCount: async () => {
        const { data } = await api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
        return data.data.count;
    },
    markAsRead: async (id: string) => {
        const { data } = await api.patch<{ success: boolean; data: any }>(`/notifications/${id}/read`);
        return data.data;
    },
    markAllAsRead: async () => {
        const { data } = await api.patch<{ success: boolean; message: string }>('/notifications/read-all');
        return data;
    }
};

export const trackingApi = {
    getPublicTracking: async (orderNumber: string) => {
        const { data } = await api.get<{ status: string; data: any }>(`/track/${orderNumber}`);
        return data.data;
    },
    verifyAndTrack: async (orderNumber: string, credentials: { email?: string; phone?: string }) => {
        const { data } = await api.post<{ status: string; data: any }>(`/track/${orderNumber}/verify`, credentials);
        return data.data;
    }
};

export const couponApi = {
    validate: async (code: string, amount?: number) => {
        const { data } = await api.get<{ success: boolean; data: any; message?: string }>(`/coupons/validate/${code}${amount ? `?amount=${amount}` : ''}`);
        return data;
    }
};

export const newsletterApi = {
    subscribe: async (email: string) => {
        const { data } = await api.post<{ success: boolean; message: string; data?: any }>('/newsletter/subscribe', { email });
        return data;
    }
};
