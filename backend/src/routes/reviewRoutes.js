// File: backend/src/routes/reviewRoutes.js

import express from 'express';
import { toggleReviewVisibility } from '../controllers/reviewController.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// PATCH visibility of a review (requires authentication)
router.patch('/:id/visibility', authUser, toggleReviewVisibility);

export default router;