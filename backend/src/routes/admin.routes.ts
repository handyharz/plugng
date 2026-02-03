import express, { Router } from 'express';
import {
    getDashboardStats,
    getRevenueChart,
    getRecentOrders,
    getLowStockAlerts,
    getAdminActivity,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    bulkUpdateOrderStatus,
    updateOrderTracking,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    uploadMedia,
    getInventoryOverview,
    adjustStock,
    getAllCustomers,
    getCustomerById,
    adjustCustomerWallet,
    getAllTickets,
    getTicketById,
    updateTicket,
    replyToTicket,
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
    getWalletTransactions
} from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

import { upload } from '../middleware/upload.middleware';

const router: Router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue-chart', getRevenueChart);
router.get('/dashboard/recent-orders', getRecentOrders);
router.get('/dashboard/low-stock', getLowStockAlerts);

// Activity log
router.get('/activity', getAdminActivity);

// Media Upload (R2)
router.post('/media/upload', upload.array('files', 10), uploadMedia);

// Order Management
router.get('/orders', getAllOrders);
router.patch('/orders/status', updateOrderStatus);
router.patch('/orders/bulk-status', bulkUpdateOrderStatus);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/tracking', updateOrderTracking);

// Product Management
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.patch('/products/bulk-update', bulkUpdateProducts);
router.post('/products', upload.fields([{ name: 'images', maxCount: 10 }]), createProduct);
router.patch('/products/:id', upload.fields([{ name: 'images', maxCount: 10 }]), updateProduct);
router.delete('/products/:id', deleteProduct);

// Inventory Management
router.get('/inventory/overview', getInventoryOverview);
router.post('/inventory/adjust', adjustStock);

// Customer Management
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);
router.patch('/customers/:id/wallet', adjustCustomerWallet);

// Support Management
router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketById);
router.patch('/tickets/:id', updateTicket);
router.post('/tickets/:id/reply', replyToTicket);

// Coupon Management
router.get('/coupons', getAllCoupons);
router.get('/coupons/stats', getCouponStats);
router.post('/coupons', createCoupon);
router.patch('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Review Moderation
router.get('/reviews', getAllReviews);
router.patch('/reviews/:id/status', updateReviewStatus);
router.delete('/reviews/:id', deleteReview);

// Admin Management
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.patch('/admins/:id/status', updateAdminStatus);

// System Settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

// Advanced Analytics
router.get('/analytics', getAdvancedAnalytics);

// Admin Notifications
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// Wallet Management
router.get('/wallet/stats', getWalletStats);
router.get('/wallet/payment-comparison', getWalletPaymentComparison);
router.get('/wallet/top-holders', getTopWalletHolders);
router.get('/wallet/transactions', getWalletTransactions);

export default router;
