import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketComment {
    user: mongoose.Types.ObjectId;
    message: string;
    isAdmin: boolean;
    isInternal: boolean;
    date: Date;
}

export interface ITicket extends Document {
    user: mongoose.Types.ObjectId;
    order?: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    comments: ITicketComment[];
    createdAt: Date;
    updatedAt: Date;
}

const TicketCommentSchema = new Schema<ITicketComment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isInternal: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

const TicketSchema = new Schema<ITicket>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    comments: [TicketCommentSchema]
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
