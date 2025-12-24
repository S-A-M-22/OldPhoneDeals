// File: backend/src/controllers/adminController.js

import express from 'express';
import { getCart, addToCart, updateCart, removeFromCart } from '../controllers/cartController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// GET /cart → returns { items: [...], totalQuantity, totalPrice }
router.get('/', authUser, getCart);

// POST /cart (add to cart)
router.post('/', authUser, addToCart);

// PUT /cart (update item quantity)
router.put('/', authUser, updateCart);

// DELETE /cart (remove item)
router.delete('/', authUser, removeFromCart);

export default router;