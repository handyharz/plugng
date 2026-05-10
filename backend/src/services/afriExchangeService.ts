import axios from 'axios';
import crypto from 'crypto';

type CreatePaymentRequestInput = {
    amount: number;
    tokenType: string;
    description: string;
    customerEmail: string;
    reference: string;
    returnUrl?: string;
};

type AfriExchangePaymentRequest = {
    transaction_id?: string;
    payment_url?: string;
    qr_code?: string;
    amount?: number;
    token_type?: string;
    expires_at?: string;
    [key: string]: any;
};

const getApiBaseUrl = () => {
    return (process.env.AFRIEXCHANGE_API_BASE_URL || 'https://afrix-iqvq.onrender.com/api/v1').replace(/\/+$/, '');
};

const normalizeReturnUrl = (value?: string) => {
    const candidate = String(value || '').trim();

    if (!candidate) {
        return undefined;
    }

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return undefined;
        }
        return parsed.toString();
    } catch (_) {
        return undefined;
    }
};

const getMerchantHeaders = () => {
    const apiKey = process.env.AFRIEXCHANGE_MERCHANT_API_KEY;

    if (!apiKey) {
        throw new Error('AFRIEXCHANGE_MERCHANT_API_KEY is not configured');
    }

    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
};

export const isAfriExchangeEnabled = () => {
    return process.env.AFRIEXCHANGE_ENABLED === 'true';
};

export const createAfriExchangePaymentRequest = async ({
    amount,
    tokenType,
    description,
    customerEmail,
    reference,
    returnUrl
}: CreatePaymentRequestInput): Promise<AfriExchangePaymentRequest> => {
    const normalizedReturnUrl = normalizeReturnUrl(returnUrl);

    const response = await axios.post(
        `${getApiBaseUrl()}/merchants/payment-request`,
        {
            amount,
            token_type: tokenType,
            description,
            customer_email: customerEmail,
            reference,
            return_url: normalizedReturnUrl
        },
        {
            headers: getMerchantHeaders(),
            timeout: 20000
        }
    );

    return response.data?.data || response.data;
};

export const verifyAfriExchangeWebhookSignature = ({
    rawBody,
    timestamp,
    signature
}: {
    rawBody: string;
    timestamp?: string;
    signature?: string;
}) => {
    const secret = process.env.AFRIEXCHANGE_WEBHOOK_SECRET;

    if (!secret || !timestamp || !signature) {
        return false;
    }

    const expected =
        'sha256=' +
        crypto
            .createHmac('sha256', secret)
            .update(`${timestamp}.${rawBody}`)
            .digest('hex');

    const provided = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (provided.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(provided, expectedBuffer);
};
