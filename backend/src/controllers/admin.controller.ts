import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Ticket from '../models/Ticket';
import Coupon from '../models/Coupon';
import Review from '../models/Review';
import Setting from '../models/Setting';
import Notification from '../models/Notification';
import AdminActivity from '../models/AdminActivity';
import Category from '../models/Category';
import { optimizeAndUploadImage } from '../services/storageService';

/**
 * Get dashboard statistics
 * GET /api/v1/admin/dashboard/stats
 */
export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

        // Get all orders for this month
        const thisMonthOrders = await Order.find({ createdAt: { $gte: thisMonthStart } });
        const lastMonthOrders = await Order.find({
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });

        // Revenue by payment status (this month)
        const paidRevenue = thisMonthOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, order) => sum + order.total, 0);

        const pendingRevenue = thisMonthOrders
            .filter(o => o.paymentStatus === 'pending')
            .reduce((sum, order) => sum + order.total, 0);

        const failedRevenue = thisMonthOrders
            .filter(o => o.paymentStatus === 'failed')
            .reduce((sum, order) => sum + order.total, 0);

        // Calculate growth vs last month
        const lastMonthPaidRevenue = lastMonthOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, order) => sum + order.total, 0);

        const revenueGrowth = lastMonthPaidRevenue > 0
            ? ((paidRevenue - lastMonthPaidRevenue) / lastMonthPaidRevenue) * 100
            : 0;

        // Revenue by payment method (this month, paid only)
        const revenueByMethod = thisMonthOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((acc, order) => {
                const method = order.paymentMethod;
                if (!acc[method]) {
                    acc[method] = { revenue: 0, count: 0 };
                }
                acc[method].revenue += order.total;
                acc[method].count += 1;
                return acc;
            }, {} as Record<string, { revenue: number; count: number }>);

        // Revenue by delivery status (this month, paid only)
        const revenueByDeliveryStatus = thisMonthOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((acc, order) => {
                const status = order.deliveryStatus;
                if (!acc[status]) {
                    acc[status] = { revenue: 0, count: 0 };
                }
                acc[status].revenue += order.total;
                acc[status].count += 1;
                return acc;
            }, {} as Record<string, { revenue: number; count: number }>);

        // Get total orders by delivery status (all payment statuses)
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$deliveryStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const ordersByStatus = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orderStats.forEach(stat => {
            ordersByStatus[stat._id as keyof typeof ordersByStatus] = stat.count;
        });

        // Get product stats
        const totalProducts = await Product.countDocuments({ status: { $ne: 'deleted' } });
        const activeProducts = await Product.countDocuments({ status: 'active' });
        const outOfStockProducts = await Product.countDocuments({ status: 'out_of_stock' });

        // Get customer stats
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const newCustomersThisMonth = await User.countDocuments({
            role: 'customer',
            createdAt: { $gte: thisMonthStart }
        });

        // Calculate KPIs
        const totalOrders = thisMonthOrders.length;
        const paidOrdersCount = thisMonthOrders.filter(o => o.paymentStatus === 'paid').length;
        const deliveredOrdersCount = thisMonthOrders.filter(o => o.deliveryStatus === 'delivered').length;

        const conversionRate = totalOrders > 0 ? (paidOrdersCount / totalOrders) * 100 : 0;
        const deliveryCompletionRate = paidOrdersCount > 0 ? (deliveredOrdersCount / paidOrdersCount) * 100 : 0;
        const avgOrderValue = paidOrdersCount > 0 ? paidRevenue / paidOrdersCount : 0;

        res.status(200).json({
            success: true,
            data: {
                revenue: {
                    paid: paidRevenue,
                    pending: pendingRevenue,
                    failed: failedRevenue,
                    growth: revenueGrowth,
                    byMethod: revenueByMethod,
                    byDeliveryStatus: revenueByDeliveryStatus
                },
                orders: {
                    total: ordersByStatus.pending + ordersByStatus.processing + ordersByStatus.shipped + ordersByStatus.delivered,
                    byStatus: ordersByStatus,
                    avgValue: Math.round(avgOrderValue)
                },
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    outOfStock: outOfStockProducts
                },
                customers: {
                    total: totalCustomers,
                    newThisMonth: newCustomersThisMonth
                },
                kpis: {
                    conversionRate: Math.round(conversionRate * 10) / 10,
                    deliveryCompletionRate: Math.round(deliveryCompletionRate * 10) / 10,
                    avgOrderValue: Math.round(avgOrderValue),
                    totalOrders: totalOrders,
                    paidOrders: paidOrdersCount
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DASHBOARD_STATS_ERROR',
                message: 'Failed to fetch dashboard statistics'
            }
        });
    }
};

/**
 * Get revenue chart data (last 30 days)
 * GET /api/v1/admin/dashboard/revenue-chart
 */
export const getRevenueChart = async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Fill in missing dates with zero revenue
        const chartData = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dayData = revenueData.find(d => d._id === dateStr);

            chartData.push({
                date: dateStr,
                revenue: dayData ? dayData.revenue : 0,
                orders: dayData ? dayData.orders : 0
            });
        }

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching revenue chart:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REVENUE_CHART_ERROR',
                message: 'Failed to fetch revenue chart data'
            }
        });
    }
};

/**
 * Get recent orders
 * GET /api/v1/admin/dashboard/recent-orders
 */
export const getRecentOrders = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'RECENT_ORDERS_ERROR',
                message: 'Failed to fetch recent orders'
            }
        });
    }
};

/**
 * Get low stock alerts
 * GET /api/v1/admin/dashboard/low-stock
 */
export const getLowStockAlerts = async (_req: Request, res: Response) => {
    try {
        // Find products where any variant has low stock
        const products = await Product.find({
            status: { $in: ['active', 'out_of_stock'] }
        }).lean();

        const lowStockProducts = products.filter(product => {
            if (product.variants && product.variants.length > 0) {
                // Check if any variant has low stock
                return product.variants.some(variant =>
                    variant.stock <= (product.lowStockThreshold || 10)
                );
            }
            return false;
        }).map(product => {
            // Calculate total stock across all variants
            const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            return {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                totalStock,
                lowStockThreshold: product.lowStockThreshold || 10,
                variants: product.variants?.filter(v => v.stock <= (product.lowStockThreshold || 10))
            };
        });

        res.status(200).json({
            success: true,
            data: lowStockProducts
        });
    } catch (error) {
        console.error('Error fetching low stock alerts:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOW_STOCK_ERROR',
                message: 'Failed to fetch low stock alerts'
            }
        });
    }
};

/**
 * Get admin activity log
 * GET /api/v1/admin/activity
 */
export const getAdminActivity = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { resource, action, search, adminId, startDate, endDate } = req.query;

        const query: any = {};

        if (resource && resource !== 'all') query.resource = resource;
        if (action && action !== 'all') query.action = action;
        if (adminId && adminId !== 'all') query.admin = adminId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        if (search) {
            query.$or = [
                { details: { $regex: search, $options: 'i' } },
                { resourceId: { $regex: search, $options: 'i' } }
            ];
        }

        // Parallel execution for data and stats
        const [activities, total, statsResult] = await Promise.all([
            AdminActivity.find(query)
                .populate('admin', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AdminActivity.countDocuments(query),
            AdminActivity.aggregate([
                { $match: query },
                {
                    $facet: {
                        byType: [
                            { $group: { _id: "$action", count: { $sum: 1 } } }
                        ],
                        byDate: [
                            {
                                $group: {
                                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { _id: 1 } as any }
                        ]
                    }
                }
            ])
        ]);

        const chartStats = statsResult[0] || { byType: [], byDate: [] };



        res.status(200).json({
            success: true,
            data: activities,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            stats: chartStats
        });
    } catch (error) {
        console.error('Error fetching admin activity:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ACTIVITY_LOG_ERROR',
                message: 'Failed to fetch admin activity log'
            }
        });
    }
};

/**
 * Get all orders with pagination and filtering
 * GET /api/v1/admin/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { status, deliveryStatus, paymentStatus, startDate, endDate, search } = req.query;

        const query: any = {};

        const dStatus = (status || deliveryStatus) as string;
        if (dStatus && dStatus !== 'all') {
            query.deliveryStatus = dStatus;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.email': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ORDERS_ERROR',
                message: 'Failed to fetch orders'
            }
        });
    }
};

/**
 * Get single order by ID
 * GET /api/v1/admin/orders/:id
 */
export const getOrderById = async (req: Request, res: Response): Promise<any> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'name price images')
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ORDER_ERROR',
                message: 'Failed to fetch order details'
            }
        });
    }
};

/**
 * Update order status
 * PATCH /api/v1/admin/orders/:id/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, adminNote, trackingNumber } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: `Status must be one of: ${validStatuses.join(', ')}`
                }
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        const initialStatus = order.deliveryStatus;
        const initialTracking = order.trackingNumber;
        let eventPushedCount = 0;

        console.log(`[LOGISTICS] Updating order ${order.orderNumber}. State: ${initialStatus} -> ?`);

        // 1. Handle Tracking Number Update (May trigger auto-ship)
        if (trackingNumber && trackingNumber !== initialTracking) {
            order.trackingNumber = trackingNumber;

            // Auto-ship if current status is processing or pending
            if (initialStatus === 'processing' || initialStatus === 'pending') {
                order.deliveryStatus = 'shipped';
                order.shippedAt = new Date();

                order.trackingEvents.push({
                    status: 'shipped',
                    location: 'Fulfillment Center',
                    message: `Package processed and shipped. Tracking #: ${trackingNumber}`,
                    timestamp: new Date()
                });
                eventPushedCount++;
            } else {
                // Just record the tracking update info
                order.trackingEvents.push({
                    status: order.deliveryStatus,
                    location: 'Fulfillment Center',
                    message: `Tracking info updated: ${trackingNumber}`,
                    timestamp: new Date()
                });
                eventPushedCount++;
            }
        }

        // 2. Handle Manual Status Change
        // Only proceed if a status was explicitly provided in the request
        if (status) {
            // Priority Check: If we already auto-shipped but the admin also selected a status...
            // We should respect the admin's manual selection if it's 'delivered' or 'cancelled',
            // OR if they manually chose 'shipped'.

            // We only push a transition event if the NEW status is different from the CURRENT state of the object
            if (status !== order.deliveryStatus) {
                console.log(`[LOGISTICS] Manual status update detected: ${order.deliveryStatus} -> ${status}`);
                order.deliveryStatus = status;

                let message = `Order moved to ${status.toUpperCase()}.`;
                let location = 'Central Hub';

                if (status === 'shipped') {
                    message = 'Package is in transit and on its way to you.';
                    location = 'Logistics Center';
                    order.shippedAt = new Date();
                } else if (status === 'delivered') {
                    message = 'Delivery confirmed. Thank you for shopping with PlugNG!';
                    location = 'Final Destination';
                    order.deliveredAt = new Date();
                } else if (status === 'cancelled') {
                    message = 'Order has been cancelled.';
                    location = 'Admin Terminal';
                }

                order.trackingEvents.push({
                    status: status,
                    location: location,
                    message: message,
                    timestamp: new Date()
                });
                eventPushedCount++;
            }
        }

        if (adminNote) {
            order.adminNote = adminNote;
        }

        // CRITICAL: Ensure persistence
        if (eventPushedCount > 0) {
            console.log(`[LOGISTICS] Finalizing ${eventPushedCount} new events for ${order.orderNumber}.`);
            order.markModified('trackingEvents');
        }
        await order.save();
        // Log admin activity
        await AdminActivity.create({
            admin: req.user?._id,
            action: 'status_change',
            resource: 'order',
            resourceId: order._id,
            changes: {
                before: { status: initialStatus },
                after: { status: status || order.deliveryStatus, note: adminNote }
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        return res.status(200).json({
            success: true,
            data: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'UPDATE_ORDER_ERROR',
                message: 'Failed to update order status'
            }
        });
    }
};

/**
 * Update order tracking information
 * PATCH /api/v1/admin/orders/:id/tracking
 */
export const updateOrderTracking = async (req: Request, res: Response) => {
    try {
        const { trackingNumber, carrier, message } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
            });
        }

        order.trackingNumber = trackingNumber;
        if (trackingNumber && order.deliveryStatus === 'processing') {
            order.deliveryStatus = 'shipped';
            order.shippedAt = new Date();
        }

        // Add tracking event
        order.trackingEvents.push({
            status: trackingNumber ? 'shipped' : order.deliveryStatus,
            location: 'Warehouse',
            message: message || `Tracking information updated. Carrier: ${carrier || 'Standard'}`,
            timestamp: new Date()
        });

        await order.save();

        // Log activity
        await AdminActivity.create({
            admin: req.user?._id,
            action: 'update_tracking',
            resource: 'order',
            resourceId: order._id,
            changes: { trackingNumber, status: order.deliveryStatus },
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            data: order,
            message: 'Tracking information updated successfully'
        });
    } catch (error) {
        console.error('Error updating tracking:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Bulk update order statuses
 * PATCH /api/v1/admin/orders/bulk-status
 */
export const bulkUpdateOrderStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { orderIds, status, adminNote } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'orderIds must be a non-empty array' }
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_STATUS', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }
            });
        }

        const result = await Order.updateMany(
            { _id: { $in: orderIds } },
            {
                $set: {
                    deliveryStatus: status,
                    adminNote: adminNote || `Bulk update to ${status}`
                },
                $push: {
                    trackingEvents: {
                        status: status,
                        location: 'Central Hub',
                        message: `Order status updated to ${status} via bulk action.`,
                        timestamp: new Date()
                    }
                }
            }
        );

        // Log general bulk activity
        await AdminActivity.create({
            admin: req.user?._id,
            action: 'bulk_status_change',
            resource: 'order',
            details: `Bulk updated ${result.modifiedCount} orders to ${status}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            data: { modifiedCount: result.modifiedCount },
            message: `Successfully updated ${result.modifiedCount} orders`
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * GET all products with admin filters
 * GET /api/v1/admin/products
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { status, category, search } = req.query;
        const query: any = {};

        if (status && status !== 'all') query.status = status;

        if (category && category !== 'all') {
            // Fetch the category and all its descendants to show products from subcategories
            const descendantCategories = await Category.find({
                $or: [
                    { _id: category },
                    { parent: category }
                ]
            }).select('_id');

            const categoryIds = descendantCategories.map((c: any) => c._id);

            // Go one level deeper for 3-level hierarchy
            const subDescendants = await Category.find({
                parent: { $in: categoryIds }
            }).select('_id');

            const allCategoryIds = [...new Set([...categoryIds, ...subDescendants.map((c: any) => c._id)])];

            query.category = { $in: allCategoryIds };
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * GET single product by ID (for admin editing)
 * GET /api/v1/admin/products/:id
 */
export const getProductById = async (req: Request, res: Response): Promise<any> => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name fullName')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_PRODUCT_ERROR',
                message: 'Failed to fetch product details'
            }
        });
    }
};


/**
 * Create a new product
 * POST /api/v1/admin/products
 */
export const createProduct = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, data: rawData } = req.body;

        let productData = req.body;
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                productData = { ...productData, ...parsed };
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON in "data" field' });
            }
        }

        // Handle images if uploaded
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files && files['images']) {
            const uploadPromises = files['images'].map(file => optimizeAndUploadImage(file.buffer));
            const results = await Promise.all(uploadPromises);
            productData.images = results.map((r, index) => ({
                url: r.url,
                key: r.key,
                alt: productData.name || name,
                isPrimary: index === 0
            }));
        }

        // Ensure slug exists
        if (!productData.slug && name) {
            productData.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const product = await Product.create(productData);

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'create',
            resource: 'product',
            resourceId: product._id,
            details: `Created product: ${product.name}`,
            ipAddress: req.ip
        });

        return res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create product'
        });
    }
};

/**
 * Update a product
 * PATCH /api/v1/admin/products/:id
 */
export const updateProduct = async (req: Request, res: Response): Promise<any> => {
    try {
        const { data: rawData } = req.body;
        let updateData = req.body;

        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                updateData = { ...updateData, ...parsed };
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON in "data" field' });
            }
        }

        // Handle new images if uploaded
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files && files['images']) {
            const uploadPromises = files['images'].map(file => optimizeAndUploadImage(file.buffer));
            const results = await Promise.all(uploadPromises);
            const newImages = results.map((r, index) => ({
                url: r.url,
                key: r.key,
                alt: updateData.name,
                isPrimary: index === 0
            }));

            // If we want to append or replace, this depends on the logic.
            // Let's assume replace if images are provided, or we can use a separate field for appending.
            updateData.images = newImages;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'update',
            resource: 'product',
            resourceId: product._id,
            details: `Updated product: ${product.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update product'
        });
    }
};

/**
 * Upload Media (Generic)
 * POST /api/v1/admin/media/upload
 */
export const uploadMedia = async (req: Request, res: Response): Promise<any> => {
    try {
        const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
        let filesToProcess: Express.Multer.File[] = [];

        if (Array.isArray(files)) {
            filesToProcess = files;
        } else if (files && typeof files === 'object') {
            // Handle multiple fields if necessary, though usually we'll just use one
            Object.values(files).forEach(fileArray => {
                filesToProcess = filesToProcess.concat(fileArray);
            });
        }

        if (filesToProcess.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const uploadPromises = filesToProcess.map(file => optimizeAndUploadImage(file.buffer, req.body.folder || 'misc'));
        const results = await Promise.all(uploadPromises);

        return res.status(200).json({
            success: true,
            data: results.map(r => r.url),
            message: 'Files uploaded successfully'
        });
    } catch (error) {
        console.error('Media upload error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Delete a product
 * DELETE /api/v1/admin/products/:id
 */
export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Instead of hard delete, maybe just mark as deleted or keep as is for now
        // For this implementation, we will actually delete
        await Product.findByIdAndDelete(req.params.id);

        await AdminActivity.create({
            admin: req.user?._id,
            action: 'delete',
            resource: 'product',
            resourceId: product._id,
            details: `Deleted product: ${product.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Bulk update products (e.g. status)
 * PATCH /api/v1/admin/products/bulk-update
 */
export const bulkUpdateProducts = async (req: Request, res: Response): Promise<any> => {
    try {
        const { productIds, updates } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ success: false, message: 'productIds must be a non-empty array' });
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updates }
        );

        // Log activity
        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'bulk_update_products',
            resource: 'product',
            details: `Bulk updated ${result.modifiedCount} products. Updates: ${JSON.stringify(updates)}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            data: { modifiedCount: result.modifiedCount },
            message: `Successfully updated ${result.modifiedCount} products`
        });
    } catch (error) {
        console.error('Error in bulk update products:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get inventory overview
 * GET /api/v1/admin/inventory/overview
 */
export const getInventoryOverview = async (_req: Request, res: Response): Promise<any> => {
    try {
        const products = await Product.find({ status: { $ne: 'deleted' } }).lean();

        let totalStock = 0;
        let totalValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        const inventory = products.map(product => {
            const productStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            const productValue = product.variants?.reduce((sum, v) => sum + (v.stock * v.costPrice), 0) || 0;
            const isLow = productStock <= (product.lowStockThreshold || 10) && productStock > 0;
            const isOut = productStock === 0;

            totalStock += productStock;
            totalValue += productValue;
            if (isLow) lowStockCount++;
            if (isOut) outOfStockCount++;

            return {
                _id: product._id,
                name: product.name,
                sku: product.variants?.[0]?.sku || 'N/A',
                stock: productStock,
                value: productValue,
                status: product.status,
                lowStock: isLow,
                outOfStock: isOut,
                variants: product.variants?.map(v => ({
                    sku: v.sku,
                    attributeValues: v.attributeValues instanceof Map
                        ? Object.fromEntries(v.attributeValues)
                        : (v.attributeValues || {}),
                    stock: v.stock,
                    costPrice: v.costPrice,
                    sellingPrice: v.sellingPrice,
                    compareAtPrice: v.compareAtPrice,
                    image: v.image,
                    isLowStock: v.stock <= (product.lowStockThreshold || 10) && v.stock > 0,
                    isOutOfStock: v.stock === 0
                })) || []
            };
        });

        // Fetch recent inventory activities
        const recentActivities = await AdminActivity.find({
            action: 'inventory_adjust'
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('admin', 'firstName lastName')
            .lean();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Calculate reason-based stats (last 30 days) based on string patterns in details
        const activitiesForStats = await AdminActivity.find({
            action: 'inventory_adjust',
            createdAt: { $gte: thirtyDaysAgo }
        }).lean();

        const statsByReason = {
            restock: 0,
            return: 0,
            damaged: 0,
            correction: 0
        };

        activitiesForStats.forEach(activity => {
            const details = activity.details?.toLowerCase() || '';
            if (details.includes('reason: restock')) statsByReason.restock++;
            else if (details.includes('reason: return')) statsByReason.return++;
            else if (details.includes('reason: damaged')) statsByReason.damaged++;
            else if (details.includes('reason: correction')) statsByReason.correction++;
        });

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalItems: totalStock,
                    totalValue,
                    lowStockItems: lowStockCount,
                    outOfStockItems: outOfStockCount,
                    totalProducts: products.length,
                    recentStats: statsByReason
                },
                inventory,
                recentActivities
            }
        });
    } catch (error) {
        console.error('Error fetching inventory overview:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Adjust stock for a product/variant
 * POST /api/v1/admin/inventory/adjust
 */
export const adjustStock = async (req: Request, res: Response): Promise<any> => {
    try {
        const { productId, variantSku, quantity, type, reason } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Find relevant variant or use first if no SKU provided
        const variantIndex = variantSku
            ? product.variants.findIndex(v => v.sku === variantSku)
            : 0;

        if (variantIndex === -1 || !product.variants[variantIndex]) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }

        const oldStock = product.variants[variantIndex]!.stock;
        let newStock = oldStock;

        if (type === 'restock' || type === 'return') newStock += quantity;
        else if (type === 'deduct' || type === 'damaged') newStock -= quantity;
        else if (type === 'correction') newStock = quantity;

        product.variants[variantIndex]!.stock = Math.max(0, newStock);

        // Update product status if all variants are out of stock
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        if (totalStock === 0 && product.status === 'active') {
            product.status = 'out_of_stock';
        } else if (totalStock > 0 && product.status === 'out_of_stock') {
            product.status = 'active';
        }

        await product.save();

        // Log activity
        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'inventory_adjust',
            resource: 'product',
            resourceId: product._id,
            details: `Adjusted stock for ${product.name} (${variantSku || 'Default'}): ${oldStock} -> ${product.variants[variantIndex]!.stock}. Reason: ${reason || type}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            data: product,
            message: 'Stock adjusted successfully'
        });
    } catch (error) {
        console.error('Error adjusting stock:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get all customers
 * GET /api/v1/admin/customers
 */
export const getAllCustomers = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        const query: any = { role: 'customer' };
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching all customers:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get customer by ID with history
 * GET /api/v1/admin/customers/:id
 */
export const getCustomerById = async (req: Request, res: Response): Promise<any> => {
    try {
        const customer = await User.findById(req.params.id).lean();
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Get customer's orders
        const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 }).lean();

        // Calculate total spent (only delivered orders)
        const totalSpent = orders
            .filter(o => o.deliveryStatus === 'delivered' && o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.total, 0);

        return res.status(200).json({
            success: true,
            data: {
                ...customer,
                orderHistory: orders,
                totalSpent,
                orderCount: orders.length
            }
        });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Adjust customer wallet balance
 * PATCH /api/v1/admin/customers/:id/wallet
 */
export const adjustCustomerWallet = async (req: Request, res: Response): Promise<any> => {
    try {
        const { amount, type, reason } = req.body;
        const customer = await User.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const transaction = {
            type,
            amount,
            description: reason || `Admin ${type === 'credit' ? 'refund' : 'adjustment'}`,
            date: new Date()
        };

        if (type === 'credit') {
            customer.wallet.balance += amount;
        } else {
            customer.wallet.balance = Math.max(0, customer.wallet.balance - amount);
        }

        customer.wallet.transactions.push(transaction as any);
        await customer.save({ validateBeforeSave: false });

        // Log activity
        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'wallet_adjust',
            resource: 'user',
            resourceId: customer._id,
            details: `Adjusted wallet for ${customer.firstName} ${customer.lastName}: ${type} ${amount}. Reason: ${reason}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            success: true,
            data: { balance: customer.wallet.balance },
            message: 'Wallet balanced adjusted successfully'
        });
    } catch (error) {
        console.error('Error adjusting wallet:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get wallet statistics and economics
 * GET /api/v1/admin/wallet/stats
 */
export const getWalletStats = async (_req: Request, res: Response) => {
    try {
        const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        // Calculate total wallet liability (sum of all customer balances)
        const liabilityResult = await User.aggregate([
            { $match: { role: 'customer' } },
            { $group: { _id: null, totalLiability: { $sum: '$wallet.balance' } } }
        ]);
        const totalLiability = liabilityResult[0]?.totalLiability || 0;

        // Get top-ups this month
        const topUpsResult = await User.aggregate([
            { $unwind: '$wallet.transactions' },
            {
                $match: {
                    'wallet.transactions.type': 'credit',
                    'wallet.transactions.date': { $gte: thisMonthStart },
                    'wallet.transactions.description': { $regex: /Top-up/i }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$wallet.transactions.amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const topUps = topUpsResult[0] || { total: 0, count: 0 };

        // Get wallet spending this month (orders paid with wallet)
        const spendingResult = await Order.aggregate([
            {
                $match: {
                    paymentMethod: 'wallet',
                    paymentStatus: 'paid',
                    createdAt: { $gte: thisMonthStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const spending = spendingResult[0] || { total: 0, count: 0 };

        // Calculate utilization rate
        const utilizationRate = totalLiability > 0 ? (spending.total / totalLiability) * 100 : 0;

        // Calculate net wallet growth
        const netGrowth = topUps.total - spending.total;
        const growthPercentage = spending.total > 0 ? (netGrowth / spending.total) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalLiability,
                utilizationRate: Math.round(utilizationRate * 10) / 10,
                topUps: {
                    total: topUps.total,
                    count: topUps.count,
                    average: topUps.count > 0 ? Math.round(topUps.total / topUps.count) : 0
                },
                spending: {
                    total: spending.total,
                    count: spending.count,
                    average: spending.count > 0 ? Math.round(spending.total / spending.count) : 0
                },
                netGrowth,
                growthPercentage: Math.round(growthPercentage * 10) / 10
            }
        });
    } catch (error) {
        console.error('Error fetching wallet stats:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'WALLET_STATS_ERROR',
                message: 'Failed to fetch wallet statistics'
            }
        });
    }
};

/**
 * Get payment method comparison
 * GET /api/v1/admin/wallet/payment-comparison
 */
export const getWalletPaymentComparison = async (_req: Request, res: Response) => {
    try {
        const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const comparison = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: thisMonthStart }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: '$total' }
                }
            }
        ]);

        const result: Record<string, any> = {
            wallet: { orders: 0, revenue: 0, avgValue: 0 },
            card: { orders: 0, revenue: 0, avgValue: 0 },
            bank_transfer: { orders: 0, revenue: 0, avgValue: 0 },
            cash_on_delivery: { orders: 0, revenue: 0, avgValue: 0 }
        };

        comparison.forEach(item => {
            const method = item._id;
            if (result[method]) {
                result[method].orders = item.orderCount;
                result[method].revenue = item.totalRevenue;
                result[method].avgValue = Math.round(item.totalRevenue / item.orderCount);
            }
        });

        // Calculate percentages
        const totalOrders = Object.values(result).reduce((sum: number, m: any) => sum + m.orders, 0);
        Object.keys(result).forEach(method => {
            result[method].percentage = totalOrders > 0
                ? Math.round((result[method].orders / totalOrders) * 1000) / 10
                : 0;
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching payment comparison:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PAYMENT_COMPARISON_ERROR',
                message: 'Failed to fetch payment method comparison'
            }
        });
    }
};

/**
 * Get top wallet holders
 * GET /api/v1/admin/wallet/top-holders
 */
export const getTopWalletHolders = async (_req: Request, res: Response) => {
    try {
        const topHolders = await User.find({
            role: 'customer',
            'wallet.balance': { $gt: 0 }
        })
            .sort({ 'wallet.balance': -1 })
            .limit(20)
            .select('firstName lastName email wallet.balance totalSpent lastLogin')
            .lean();

        const result = topHolders.map((user: any) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            balance: user.wallet.balance,
            totalSpent: user.totalSpent || 0,
            lastActivity: user.lastLogin || null
        }));

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching top wallet holders:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TOP_HOLDERS_ERROR',
                message: 'Failed to fetch top wallet holders'
            }
        });
    }
};

/**
 * Get wallet transactions (all users, admin view)
 * GET /api/v1/admin/wallet/transactions
 */
export const getWalletTransactions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const type = req.query.type as string; // 'credit' | 'debit' | undefined
        const skip = (page - 1) * limit;

        const matchStage: any = {};
        if (type === 'credit' || type === 'debit') {
            matchStage['wallet.transactions.type'] = type;
        }

        const transactions = await User.aggregate([
            { $match: { role: 'customer' } },
            { $unwind: '$wallet.transactions' },
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
            { $sort: { 'wallet.transactions.date': -1 } },
            {
                $project: {
                    userId: '$_id',
                    userName: { $concat: ['$firstName', ' ', '$lastName'] },
                    userEmail: '$email',
                    type: '$wallet.transactions.type',
                    amount: '$wallet.transactions.amount',
                    description: '$wallet.transactions.description',
                    date: '$wallet.transactions.date'
                }
            },
            {
                $facet: {
                    transactions: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const result = transactions[0];
        const total = result.totalCount[0]?.count || 0;

        res.status(200).json({
            success: true,
            data: {
                transactions: result.transactions,
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'WALLET_TRANSACTIONS_ERROR',
                message: 'Failed to fetch wallet transactions'
            }
        });
    }
};


/**
 * Get all support tickets
 * GET /api/v1/admin/tickets
 */
export const getAllTickets = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const { status, priority } = req.query;

        const query: any = {};
        if (status && status !== 'all') query.status = status;
        if (priority && priority !== 'all') query.priority = priority;

        const tickets = await Ticket.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Ticket.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: tickets,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get ticket by ID
 * GET /api/v1/admin/tickets/:id
 */
export const getTicketById = async (req: Request, res: Response): Promise<any> => {
    try {
        let ticket = await Ticket.findById(req.params.id)
            .populate('user', 'firstName lastName email phone')
            .populate('order', 'orderNumber total deliveryStatus')
            .populate('comments.user', 'firstName lastName role');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Just-In-Time Auto-Closure Check
        if (ticket.status === 'resolved') {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (ticket.updatedAt < fiveMinutesAgo) {
                ticket.status = 'closed';
                await (ticket as any).save();
            }
        }

        return res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update ticket status/priority
 * PATCH /api/v1/admin/tickets/:id
 */
export const updateTicket = async (req: Request, res: Response): Promise<any> => {
    try {
        const { status, priority } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(req.params.id,
            { status, priority },
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Launch auto-close timer if resolved
        if (status === 'resolved') {
            startAutoCloseTimer(ticket._id.toString());
        }

        // Log activity
        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'update_ticket',
            resource: 'ticket',
            resourceId: ticket._id,
            details: `Updated ticket #${ticket._id}: status=${status}, priority=${priority}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        console.error('Error updating ticket:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Background Timer for Auto-Closure
const startAutoCloseTimer = (ticketId: string) => {
    setTimeout(async () => {
        try {
            const ticket = await Ticket.findById(ticketId);
            if (ticket && ticket.status === 'resolved') {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (ticket.updatedAt < fiveMinutesAgo) {
                    ticket.status = 'closed';
                    await ticket.save();
                    console.log(`Ticket #${ticketId} auto-closed after 5 minutes.`);
                }
            }
        } catch (err) {
            console.error('Error in auto-close timer:', err);
        }
    }, 5 * 60 * 1000 + 1000); // 5 mins + 1sec cushion
};

/**
 * Reply to ticket
 * POST /api/v1/admin/tickets/:id/reply
 */
export const replyToTicket = async (req: Request, res: Response): Promise<any> => {
    try {
        const { message, isInternal } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.comments.push({
            user: (req as any).user?._id,
            message,
            isAdmin: true,
            isInternal: !!isInternal,
            date: new Date()
        } as any);

        // Automatically move to in-progress if currently open
        if (ticket.status === 'open') {
            ticket.status = 'in-progress';
        }

        await ticket.save();

        // If not internal, notify the user
        if (!isInternal) {
            const notificationService = require('../services/notificationService').default;
            await notificationService.sendInApp(
                ticket.user.toString(),
                'ticket_reply',
                'New Support Reply',
                `A support agent has replied to your ticket: "${ticket.subject}"`,
                `/profile/support/${ticket._id}`
            );
        }

        return res.status(200).json({ success: true, data: ticket, message: 'Reply sent' });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get all coupons
 * GET /api/v1/admin/coupons
 */
export const getAllCoupons = async (_req: Request, res: Response): Promise<any> => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        console.error('Error fetching all coupons:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create a new coupon
 * POST /api/v1/admin/coupons
 */
export const createCoupon = async (req: Request, res: Response): Promise<any> => {
    try {
        const coupon = await Coupon.create(req.body);

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'create_coupon',
            resource: 'coupon',
            resourceId: coupon._id,
            details: `Created coupon code: ${coupon.code}`,
            ipAddress: req.ip
        });

        return res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create coupon'
        });
    }
};

/**
 * Update a coupon
 * PATCH /api/v1/admin/coupons/:id
 */
export const updateCoupon = async (req: Request, res: Response): Promise<any> => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'update_coupon',
            resource: 'coupon',
            resourceId: coupon._id,
            details: `Updated coupon code: ${coupon.code}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        console.error('Error updating coupon:', error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update coupon'
        });
    }
};

/**
 * Delete a coupon
 * DELETE /api/v1/admin/coupons/:id
 */
export const deleteCoupon = async (req: Request, res: Response): Promise<any> => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'delete_coupon',
            resource: 'coupon',
            resourceId: coupon._id,
            details: `Deleted coupon code: ${coupon.code}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get all reviews with filters
 * GET /api/v1/admin/reviews
 */
export const getAllReviews = async (req: Request, res: Response): Promise<any> => {
    try {
        const { status, rating, page = 1, limit = 20 } = req.query;
        const query: any = {};

        if (status) query.status = status;
        if (rating) query.rating = rating;

        const reviews = await Review.find(query)
            .populate('user', 'firstName lastName email')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .lean();

        const total = await Review.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: reviews,
            meta: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update review status (approve/reject)
 * PATCH /api/v1/admin/reviews/:id/status
 */
export const updateReviewStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'update_review_status',
            resource: 'review',
            resourceId: review._id,
            details: `Updated review status to: ${status}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, data: review });
    } catch (error) {
        console.error('Error updating review status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Delete a review
 * DELETE /api/v1/admin/reviews/:id
 */
export const deleteReview = async (req: Request, res: Response): Promise<any> => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'delete_review',
            resource: 'review',
            resourceId: review._id,
            details: `Deleted review from user ${review.user}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get all admins
 * GET /api/v1/admin/admins
 */
export const getAllAdmins = async (_req: Request, res: Response): Promise<any> => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password').lean();
        return res.status(200).json({ success: true, data: admins });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create a new admin user
 * POST /api/v1/admin/admins
 */
export const createAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;

        const allowedRoles = ['admin', 'super_admin', 'manager', 'support', 'editor'];
        const targetRole = role && allowedRoles.includes(role) ? role : 'admin';

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
        }

        const admin = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: targetRole,
            emailVerified: true
        });

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'create_admin',
            resource: 'user',
            resourceId: admin._id,
            details: `Created new admin: ${admin.email}`,
            ipAddress: req.ip
        });

        const adminData = admin.toObject();
        delete adminData.password;

        return res.status(201).json({ success: true, data: adminData });
    } catch (error) {
        console.error('Error creating admin:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update admin status (suspend/activate)
 * PATCH /api/v1/admin/admins/:id/status
 */
export const updateAdminStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const admin = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'admin' },
            { status },
            { new: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'update_admin_status',
            resource: 'user',
            resourceId: admin._id,
            details: `Updated admin status to: ${status} for ${admin.email}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error('Error updating admin status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get all store settings
 * GET /api/v1/admin/settings
 */
export const getSettings = async (_req: Request, res: Response): Promise<any> => {
    try {
        const settings = await Setting.find().lean();
        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update multiple store settings
 * PATCH /api/v1/admin/settings
 */
export const updateSettings = async (req: Request, res: Response): Promise<any> => {
    try {
        const { settings } = req.body; // Array of { category, key, value }

        if (!Array.isArray(settings)) {
            return res.status(400).json({ success: false, message: 'Settings must be an array' });
        }

        const updatedSettings = [];
        for (const item of settings) {
            const setting = await Setting.findOneAndUpdate(
                { category: item.category, key: item.key },
                {
                    value: item.value,
                    updatedBy: (req as any).user?._id
                },
                { upsert: true, new: true }
            );
            updatedSettings.push(setting);
        }

        await AdminActivity.create({
            admin: (req as any).user?._id,
            action: 'update_settings',
            resource: 'system',
            details: `Updated ${settings.length} store settings`,
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get advanced analytics
 * GET /api/v1/admin/analytics
 */
export const getAdvancedAnalytics = async (req: Request, res: Response): Promise<any> => {
    try {
        const { period = '30days' } = req.query;
        let startDate = new Date();

        if (period === '30days') startDate.setDate(startDate.getDate() - 30);
        else if (period === '90days') startDate.setDate(startDate.getDate() - 90);
        else if (period === '1year') startDate.setFullYear(startDate.getFullYear() - 1);

        startDate.setHours(0, 0, 0, 0);

        // 1. Sales by Category
        const salesByCategory = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productInfo.category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo.name',
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    units: { $sum: '$items.quantity' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // 2. Top Selling Products (only include products that still exist)
        const topProducts = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productExists'
                }
            },
            // Only include items where the product still exists
            { $match: { 'productExists.0': { $exists: true } } },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    units: { $sum: '$items.quantity' }
                }
            },
            { $sort: { units: -1 } },
            { $limit: 10 }
        ]);

        // 3. Customer Retention (Basic: Repeat vs New)
        const totalPaidOrders = await Order.find({ createdAt: { $gte: startDate }, paymentStatus: 'paid' }).select('user');
        const userOrderCounts: Record<string, number> = {};
        totalPaidOrders.forEach(o => {
            const uid = o.user.toString();
            userOrderCounts[uid] = (userOrderCounts[uid] || 0) + 1;
        });

        const repeatCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;
        const oneTimeCustomers = Object.values(userOrderCounts).filter(count => count === 1).length;

        return res.status(200).json({
            success: true,
            data: {
                salesByCategory,
                topProducts,
                customerRetention: {
                    repeat: repeatCustomers,
                    new: oneTimeCustomers
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get admin notifications
 * GET /api/v1/admin/notifications
 */
export const getAdminNotifications = async (req: Request, res: Response): Promise<any> => {
    try {
        const notifications = await Notification.find({ recipient: (req as any).user?._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({
            recipient: (req as any).user?._id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Mark notification as read
 * PATCH /api/v1/admin/notifications/:id/read
 */
export const markNotificationRead = async (req: Request, res: Response): Promise<any> => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: (req as any).user?._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get coupon analytics and summary stats
 * GET /api/v1/admin/coupons/stats
 */
export const getCouponStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        const coupons = await Coupon.find().lean();
        const activeCoupons = coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date()).length;
        const totalRedemptions = coupons.reduce((sum, c) => sum + c.usageCount, 0);

        const orders = await Order.find({ paymentStatus: 'paid' }).select('couponDiscount');
        const totalSaved = orders.reduce((sum, o) => sum + (o.couponDiscount || 0), 0);

        const expiringSoon = coupons.filter(c => {
            const expiry = new Date(c.expiryDate);
            const now = new Date();
            const diff = expiry.getTime() - now.getTime();
            return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 days
        }).length;

        return res.status(200).json({
            success: true,
            data: {
                totalCoupons: coupons.length,
                activeCoupons,
                totalRedemptions,
                totalSaved,
                expiringSoon
            }
        });
    } catch (error) {
        console.error('Error fetching coupon stats:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
