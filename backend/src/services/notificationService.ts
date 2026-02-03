import { Resend } from 'resend';
import axios from 'axios';
import Notification from '../models/Notification';
import { IUser } from '../models/User';

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

interface SMSOptions {
    to: string;
    message: string;
}

class NotificationService {
    /**
     * Send an in-app notification to a user
     */
    async sendInApp(
        userId: string,
        type: 'order_update' | 'payment_success' | 'payment_failed' | 'low_stock' | 'system' | 'wallet_update' | 'shipped' | 'delivered' | 'order_cancelled' | 'ticket_reply' | 'new_order' | 'new_ticket',
        title: string,
        message: string,
        link?: string,
        metadata?: Record<string, any>
    ) {
        try {
            if (!userId) {
                console.warn('NotificationService: No userId provided for in-app notification');
                return;
            }

            await Notification.create({
                recipient: userId,
                type,
                title,
                message,
                link,
                metadata,
                isRead: false,
            });
        } catch (error) {
            console.error('NotificationService Error (In-App):', error);
        }
    }

    /**
     * Send an email using Resend
     */
    async sendEmail({ to, subject, html }: EmailOptions) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('NotificationService: RESEND_API_KEY is missing');
            return;
        }

        try {
            const fromEmail = process.env.FROM_EMAIL || 'no-reply@plugng.shop';

            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to,
                subject,
                html,
            });

            if (error) {
                console.error('NotificationService Resend Error:', error);
                return;
            }
            return data;
        } catch (error) {
            console.error('NotificationService Error (Email):', error);
            return;
        }
    }

    /**
     * Send an SMS using Termii
     */
    async sendSMS({ to, message }: SMSOptions) {
        if (!process.env.TERMII_API_KEY) {
            console.log('\n' + '='.repeat(50));
            console.log('📱 [SMS FALLBACK] - NO API KEY DETECTED');
            console.log(`To: ${to}`);
            console.log(`Message: ${message}`);
            console.log('='.repeat(50) + '\n');
            return { status: 'mock_success', message: 'OTP logged to terminal' };
        }

        try {
            // Format phone number for international format if needed
            const payload = {
                to,
                from: process.env.TERMII_SENDER_ID || 'PlugNG',
                sms: message,
                type: 'plain',
                channel: 'generic',
                api_key: process.env.TERMII_API_KEY,
            };

            const response = await axios.post('https://api.ng.termii.com/api/sms/send', payload);

            return response.data;
        } catch (error: any) {
            console.error('NotificationService Error (SMS):', error?.response?.data || error.message);
        }
    }

    /**
     * Send an alert to the Admin
     */
    async notifyAdmin(subject: string, message: string) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) return;

        // Send Email
        await this.sendEmail({
            to: adminEmail,
            subject: `[Admin Alert] ${subject}`,
            html: `<p>${message}</p>`,
        });

        // We can also create a System Notification if we have an admin user ID, 
        // but for now email is sufficient.
    }

    /**
     * Standardized Alert: Order Placed
     */
    async notifyOrderPlaced(order: any, user: IUser) {
        // 1. In-App
        await this.sendInApp(
            (user._id as unknown) as string,
            'order_update',
            'Order Placed Successfully',
            `Your order #${order.orderNumber || order._id} has been placed.`,
            `/orders/${order._id}`
        );

        // 2. Email User
        await this.sendEmail({
            to: user.email,
            subject: `Order Confirmation #${order._id}`,
            html: `<h1>Thank you for your order!</h1><p>Order #${order._id} has been received.</p>`,
        });

        // 3. Email Admin
        await this.notifyAdmin('New Order Received', `Order #${order._id} was placed by ${user.email}.`);
    }

    /**
     * Standardized Alert: Low Stock
     */
    async notifyLowStock(productName: string, variantSku: string, currentStock: number) {
        await this.notifyAdmin(
            'Low Stock Alert',
            `Product <strong>${productName}</strong> (Variant: ${variantSku}) is running low on stock. Only ${currentStock} remaining.`
        );
    }
}

export default new NotificationService();
