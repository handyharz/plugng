import express, { Router } from 'express';
import { getInstantResults, getTrendingSearchData } from '../controllers/search.controller';

const router: Router = express.Router();

router.get('/trending', getTrendingSearchData);
router.get('/instant', getInstantResults);

export default router;
