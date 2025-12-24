// File: backend/src/controllers/adminController.js

import express from 'express';
import { getHomeListings, logoutUser } from '../controllers/homeController.js';

const router = express.Router();

//add authUser for SPA
router.get('/', getHomeListings);
router.post('/logout', logoutUser);

export default router;