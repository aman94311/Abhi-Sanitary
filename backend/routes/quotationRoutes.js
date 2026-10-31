import express from 'express';
import { createQuotation } from '../controllers/quotationController.js';

const router = express.Router();

router.post('/', createQuotation);

export default router;