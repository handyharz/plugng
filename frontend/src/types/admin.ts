export interface AdminOrder {
    _id: string;
    orderNumber: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    items: {
        product: {
            _id: string;
            name: string;
            price: number;
            images: string[];
        };
        name: string;
        sku: string;
        quantity: number;
        price: number;
        image: string;
        variant?: {
            color: string;
            size: string;
        };
    }[];
    total: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        landmark?: string;
    };
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: string;
    adminNote?: string;
    trackingEvents: {
        status: string;
        location: string;
        message: string;
        timestamp: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface AdminProduct {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    price?: number; // Main price if no variants or average
    status: 'active' | 'draft' | 'out_of_stock';
    category: {
        _id: string;
        name: string;
    } | string;
    images: {
        url: string;
        key: string;
        alt?: string;
        isPrimary: boolean;
    }[];
    variants: {
        sku: string;
        attributeValues: Record<string, string>;
        costPrice: number;
        sellingPrice: number;
        stock: number;
        image?: string;
    }[];
    lowStockThreshold: number;
    salesCount: number;
    createdAt: string;
    updatedAt: string;
}
