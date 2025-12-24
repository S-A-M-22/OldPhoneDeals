// File: backend/src/controllers/listingController.js

import express from 'express';
import { getListingById, searchListings, getAllBrands } from '../controllers/listingController.js';
import { addReview } from '../controllers/reviewController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

router.get('/searchListings', searchListings);
router.get('/brands', getAllBrands);

// GET /listings
router.get('/', searchListings);

// GET /listings/:id
router.get('/:id', getListingById);

// POST /listings/:id/reviews
router.post('/:id/reviews', authUser, addReview);

export default router;