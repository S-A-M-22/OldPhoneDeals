// backend/src/routes/adminReviewRoutes.js
import express from 'express';
import {
  getAllReviews,
  updateReviewVisibility,
  searchReviews
} from '../controllers/adminReviewController.js';
import { authAdmin } from '../middleware/authAdmin.js';
import { authUser } from '../middleware/authUser.js';

const router = express.Router();

// Protect every admin/reviews route
router.use(authUser);
router.use(authAdmin());

/**
 * GET    /admin/reviews            → list all reviews
 * GET    /admin/reviews/search     → search reviews
 * PATCH  /admin/reviews/:id/visibility → override hidden flag
 */
router.get('/search', searchReviews);
router.get('/', getAllReviews);
router.patch('/:id/visibility', updateReviewVisibility);

export default router;