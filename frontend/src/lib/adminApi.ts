import { api } from './api';

// Categories
export const getCategories = async (params?: { level?: number; parent?: string }) => {
    const response = await api.get('/categories', { params });
    return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
};

export const getRevenueChart = async (days: number = 30) => {
    const response = await api.get(`/admin/dashboard/revenue-chart?days=${days}`);
    return response.data;
};

export const getRecentOrders = async (limit: number = 10) => {
    const response = await api.get(`/admin/dashboard/recent-orders?limit=${limit}`);
    return response.data;
};

export const getLowStockAlerts = async () => {
    const response = await api.get('/admin/dashboard/low-stock');
    return response.data;
};

// Orders
export const getAllOrders = async (params?: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    deliveryStatus?: string;
    search?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.deliveryStatus) queryParams.append('deliveryStatus', params.deliveryStatus);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/admin/orders?${queryParams.toString()}`);
    return response.data;
};

export const getOrderById = async (id: string) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (orderId: string, data: {
    status?: string;
    trackingNumber?: string;
    adminNote?: string;
}) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, data);
    return response.data;
};

export const updateOrderTracking = async (orderId: string, trackingNumber: string) => {
    const response = await api.patch(`/admin/orders/${orderId}/tracking`, { trackingNumber });
    return response.data;
};

export const bulkUpdateOrderStatus = async (orderIds: string[], status: string) => {
    const response = await api.patch('/admin/orders/bulk-status', { orderIds, status });
    return response.data;
};

export const addAdminNote = async (orderId: string, note: string) => {
    const response = await api.patch(`/admin/orders/${orderId}/note`, { adminNote: note });
    return response.data;
};

// Products
export const getAllProducts = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/admin/products?${queryParams.toString()}`);
    return response.data;
};

export const getProductById = async (id: string) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
};


export const createProduct = async (data: any) => {
    const response = await api.post('/admin/products', data);
    return response.data;
};

export const updateProduct = async (id: string, data: any) => {
    const response = await api.patch(`/admin/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
};

export const bulkUpdateProducts = async (productIds: string[], updates: any) => {
    const response = await api.patch('/admin/products/bulk-update', { productIds, updates });
    return response.data;
};

// Inventory
export const getInventoryOverview = async () => {
    const response = await api.get('/admin/inventory/overview');
    return response.data;
};

export const adjustStock = async (data: {
    productId: string;
    variantSku?: string;
    quantity: number;
    type: 'restock' | 'deduct' | 'correction';
    reason: string;
}) => {
    const response = await api.post('/admin/inventory/adjust', data);
    return response.data;
};

// Customers
export const getAllCustomers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/admin/customers?${queryParams.toString()}`);
    return response.data;
};

export const getCustomerDetails = async (customerId: string) => {
    const response = await api.get(`/admin/customers/${customerId}`);
    return response.data;
};

export const adjustCustomerWallet = async (customerId: string, data: {
    amount: number;
    type: 'credit' | 'debit';
    reason: string;
}) => {
    const response = await api.patch(`/admin/customers/${customerId}/wallet`, data);
    return response.data;
};

// Activity Log
export const getAdminActivity = async (params: {
    page: number;
    limit: number;
    resource?: string;
    action?: string;
    search?: string;
    adminId?: string;
    startDate?: Date | null;
    endDate?: Date | null;
}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());

    if (params.resource && params.resource !== 'all') queryParams.append('resource', params.resource);
    if (params.action && params.action !== 'all') queryParams.append('action', params.action);
    if (params.search) queryParams.append('search', params.search);
    if (params.adminId && params.adminId !== 'all') queryParams.append('adminId', params.adminId);
    if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());

    const response = await api.get(`/admin/activity?${queryParams.toString()}`);
    return response.data;
};

// Coupons
export const getAllCoupons = async () => {
    const response = await api.get('/admin/coupons');
    return response.data;
};

export const getCouponStats = async () => {
    const response = await api.get('/admin/coupons/stats');
    return response.data;
};

export const createCoupon = async (data: any) => {
    const response = await api.post('/admin/coupons', data);
    return response.data;
};

export const updateCoupon = async (id: string, data: any) => {
    const response = await api.patch(`/admin/coupons/${id}`, data);
    return response.data;
};

export const deleteCoupon = async (id: string) => {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
};

// Reviews
export const getAllReviews = async (params?: { status?: string, page?: number, limit?: number }) => {
    const { data: response } = await api.get('/admin/reviews', { params });
    return response;
};

export const updateReviewStatus = async (id: string, status: string) => {
    const { data: response } = await api.patch(`/admin/reviews/${id}/status`, { status });
    return response;
};

export const deleteReview = async (id: string) => {
    const { data: response } = await api.delete(`/admin/reviews/${id}`);
    return response;
};

// Admins
export const getAllAdmins = async () => {
    const { data: response } = await api.get('/admin/admins');
    return response;
};

export const createAdmin = async (data: any) => {
    const { data: response } = await api.post('/admin/admins', data);
    return response;
};

export const updateAdminStatus = async (id: string, status: string) => {
    const { data: response } = await api.patch(`/admin/admins/${id}/status`, { status });
    return response;
};

// Settings
export const getSettings = async () => {
    const { data: response } = await api.get('/admin/settings');
    return response;
};

export const updateSettings = async (settings: any[]) => {
    const { data: response } = await api.patch('/admin/settings', { settings });
    return response;
};

// Analytics
export const getAdvancedAnalytics = async (params?: { period?: string }) => {
    const { data: response } = await api.get('/admin/analytics', { params });
    return response;
};

// Notifications
export const getAdminNotifications = async () => {
    const { data: response } = await api.get('/admin/notifications');
    return response;
};

export const markNotificationRead = async (id: string) => {
    const { data: response } = await api.patch(`/admin/notifications/${id}/read`);
    return response;
};

// Wallet Analytics
export const getWalletStats = async () => {
    const { data: response } = await api.get('/admin/wallet/stats');
    return response;
};

export const getWalletPaymentComparison = async () => {
    const { data: response } = await api.get('/admin/wallet/payment-comparison');
    return response;
};

export const getTopWalletHolders = async () => {
    const { data: response } = await api.get('/admin/wallet/top-holders');
    return response;
};

export const getWalletTransactions = async (params?: { page?: number; limit?: number; type?: string }) => {
    const { data: response } = await api.get('/admin/wallet/transactions', { params });
    return response;
};

const adminApi = {
    getDashboardStats,
    getRevenueChart,
    getRecentOrders,
    getLowStockAlerts,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderTracking,
    bulkUpdateOrderStatus,
    addAdminNote,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    getInventoryOverview,
    adjustStock,
    getAllCustomers,
    getCustomerDetails,
    adjustCustomerWallet,
    getAdminActivity,
    getAllCoupons,
    getCouponStats,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
    getAllAdmins,
    createAdmin,
    updateAdminStatus,
    getSettings,
    updateSettings,
    getAdvancedAnalytics,
    getAdminNotifications,
    markNotificationRead,
    getWalletStats,
    getWalletPaymentComparison,
    getTopWalletHolders,
    getWalletTransactions,
    getTickets: async (params?: { page?: number; limit?: number; status?: string; priority?: string }) => {
        const { data: response } = await api.get('/admin/tickets', { params });
        return response;
    },
    getTicketById: async (id: string) => {
        const { data: response } = await api.get(`/admin/tickets/${id}`);
        return response.data;
    },
    updateTicket: async (id: string, data: { status?: string; priority?: string }) => {
        const { data: response } = await api.patch(`/admin/tickets/${id}`, data);
        return response.data;
    },
    replyToTicket: async (id: string, message: string, isInternal: boolean = false) => {
        const { data: response } = await api.post(`/admin/tickets/${id}/reply`, { message, isInternal });
        return response.data;
    },

    // Media
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const { data: response } = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getCategories
};

export default adminApi;
