import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(protect);

router.post('/', ticketController.createTicket);
router.get('/my-tickets', ticketController.getMyTickets);
router.get('/:id', ticketController.getTicketDetails);
router.post('/:id/comments', ticketController.addComment);

export default router;
