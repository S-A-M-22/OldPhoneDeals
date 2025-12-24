// File: backend/src/controllers/adminController.js

import express from 'express';
import { authUser } from '../middleware/authUser.js';
import {
    getProfile, updateProfile, changePassword,
    getUserListings, toggleListingStatus, deleteListing, createListing,
    toggleCommentVisibility,
    getListingComments,
} from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

//view, edit
router.get('/profile', authUser, getProfile);
router.put('/profile', authUser, updateProfile);

//change password
router.post('/change-password', authUser, changePassword);

//manage
router.get('/listings', authUser, getUserListings);
router.post('/create-listing', authUser, upload.single('image'), createListing);
router.patch('/listings/:listingId/toggle', authUser, toggleListingStatus);
router.delete('/listings/:listingId', authUser, deleteListing);
router.patch('/comments/:listingId/:reviewId/toggle', authUser, toggleCommentVisibility);
router.get('/comments/get-listing-comments', authUser, getListingComments)

export default router;
