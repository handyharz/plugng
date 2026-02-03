import { Request, Response } from 'express';

export const subscribe = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }

        // In a real app, you would save this to a database or Mailchimp/SendGrid
        console.log(`Newsletter subscription: ${email}`);

        // Return a success message and the coupon code
        // This is where "how it would work" comes in
        res.status(200).json({
            success: true,
            message: 'Success! Use code WELCOME500 for ₦500 off your first order.',
            data: {
                couponCode: 'WELCOME500'
            }
        });
        return;
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
        return;
    }
};
