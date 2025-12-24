// File: backend/src/routes/authRoutes.js

import express from 'express';
import { signup, login, resetPassword, verifyEmail, sendResetEmail } from '../controllers/authController.js';



const router = express.Router();

// Route: POST /auth/login
router.post('/login', login);

// Route: POST /auth/signup
router.post('/signup', signup);

// Route: GET /auth/verify-email?token=...
router.get('/verify-email', verifyEmail);

// Route: POST /auth/reset-password
router.post('/reset-password', sendResetEmail)

// Route: GET /auth/reset-password/:token
router.get('/reset-password/:token', resetPassword);

export default router;