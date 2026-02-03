import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import notificationService from '../services/notificationService';

/**
 * Create a new support ticket
 */
export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subject, description, order, priority } = req.body;

        const ticket = await Ticket.create({
            user: req.user!.id,
            subject,
            description,
            order,
            priority: priority || 'medium'
        });

        res.status(201).json({
            status: 'success',
            data: { ticket }
        });

        // Notify Admin
        await notificationService.notifyAdmin(
            'New Support Ticket',
            `A new ticket "${subject}" has been created by ${req.user!.email}.`
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get all tickets for the logged-in user
 */
export const getMyTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await Ticket.find({ user: req.user!.id }).sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: tickets.length,
            data: { tickets }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get ticket details by ID
 */
export const getTicketDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user!.id }).populate('comments.user', 'firstName lastName');

        if (!ticket) {
            res.status(404).json({ status: 'fail', message: 'Ticket not found' });
            return;
        }

        // Just-In-Time Auto-Closure Check
        if (ticket.status === 'resolved') {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (ticket.updatedAt < fiveMinutesAgo) {
                ticket.status = 'closed';
                await ticket.save();
            }
        }

        res.status(200).json({
            status: 'success',
            data: { ticket }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a comment to a ticket
 */
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user!.id });

        if (!ticket) {
            res.status(404).json({ status: 'fail', message: 'Ticket not found' });
            return;
        }

        ticket.comments.push({
            user: req.user!.id as any,
            message,
            isAdmin: req.user!.role === 'admin',
            isInternal: false,
            date: new Date()
        });

        await ticket.save();

        // If user is replying, notify the admin
        if (req.user!.role === 'customer') {
            await notificationService.notifyAdmin(
                'New Support Ticket Reply',
                `User ${req.user!.email} replied to ticket: "${ticket.subject}"`
            );
        }

        // If admin is replying via this endpoint, notify the user
        if (req.user!.role !== 'customer') {
            await notificationService.sendInApp(
                ticket.user.toString(),
                'ticket_reply',
                'New Support Reply',
                `A support agent has replied to your ticket: "${ticket.subject}"`,
                `/profile/support/${ticket._id}`
            );
        }

        res.status(200).json({
            status: 'success',
            data: { ticket }
        });
    } catch (error) {
        next(error);
    }
};
