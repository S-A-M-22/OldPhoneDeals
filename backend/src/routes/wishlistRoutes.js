// File: backend/src/routes/wishlistRoutes.js
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../controllers/wishlistController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// GET    /wishlist
router.get('/', authUser, getWishlist);

// POST   /wishlist/:listingId
router.post('/:listingId', authUser, addToWishlist);

// DELETE /wishlist/:listingId
router.delete('/:listingId', authUser, removeFromWishlist);

export default router;