import { Product, SAMPLE_PRODUCTS } from './products';

export interface OrderItem {
    productId: string;
    quantity: number;
    priceAtTime: number;
}

export interface Order {
    id: string;
    customerEmail: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    items: OrderItem[];
    payunifyReference?: string;
    createdAt: Date;
}

// Simple in-memory store (Global singleton to persist across hot-reloads in dev)
const globalForStore = global as unknown as { orderStore: Order[] };

class OrderStore {
    private orders: Order[];

    constructor() {
        this.orders = globalForStore.orderStore || [];
        globalForStore.orderStore = this.orders;
    }

    createOrder(customerEmail: string, items: { productId: string; quantity: number }[]): Order {
        // Calculate total strictly from server-side product data avoids price manipulation
        let totalAmount = 0;
        const orderItems: OrderItem[] = items.map(item => {
            const product = SAMPLE_PRODUCTS.find(p => p.id === item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            totalAmount += product.price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: product.price
            };
        });

        const newOrder: Order = {
            id: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            customerEmail,
            amount: totalAmount,
            status: 'pending',
            items: orderItems,
            createdAt: new Date()
        };

        this.orders.unshift(newOrder); // Add to top
        return newOrder;
    }

    getOrder(id: string) {
        return this.orders.find(o => o.id === id);
    }

    updateStatus(id: string, status: 'pending' | 'paid' | 'failed', reference?: string) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            if (reference) order.payunifyReference = reference;
        }
        return order;
    }

    getAllOrders() {
        return this.orders;
    }
}

export const orderStore = new OrderStore();
