// File: backend/src/controllers/adminController.js

import express from 'express';
import { checkout } from '../controllers/orderController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// POST /orders/checkout
router.post('/checkout', authUser, checkout);

export default router;