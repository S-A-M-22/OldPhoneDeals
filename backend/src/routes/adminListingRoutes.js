// File: backend/src/routes/adminListingRoutes.js

import express from 'express';
import {
  getAllListings,
  getListingById,
  updateListing,
  deleteListing
} from '../controllers/adminListingController.js';
import { authAdmin } from '../middleware/authAdmin.js';
import { authUser }  from '../middleware/authUser.js';

const router = express.Router();

// Protect all admin/listings routes
router.use(authUser);
router.use(authAdmin());

/**
 * GET    /admin/listings           → list all listings
 * GET    /admin/listings/:id       → single listing + reviews
 * PUT    /admin/listings/:id       → update listing
 * DELETE /admin/listings/:id       → delete listing
 */
router.get('/',      getAllListings);
router.get('/:id',   getListingById);
router.put('/:id',   updateListing);
router.delete('/:id',deleteListing);

export default router;