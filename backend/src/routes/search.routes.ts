import express, { Router } from 'express';
import { getInstantResults } from '../controllers/search.controller';

const router: Router = express.Router();

router.get('/instant', getInstantResults);

export default router;
