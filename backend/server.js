// File: backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import authRoutes from './src/routes/authRoutes.js';
import listingRoutes from './src/routes/listingRoutes.js';
import homeRoute from './src/routes/homeRoutes.js';
import reviewRoutes  from './src/routes/reviewRoutes.js';
import adminUserRoutes from './src/routes/adminUserRoutes.js';
import adminAuthRoutes from './src/routes/adminAuthRoutes.js';
import userRoutes from './src/routes/userRoutes.js'
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminListingRoutes from './src/routes/adminListingRoutes.js';
import adminNotificationRoutes from './src/routes/adminNotificationRoutes.js';
import adminReviewRoutes from './src/routes/adminReviewRoutes.js';
import adminLogRoutes from './src/routes/adminLogRoutes.js';
import wishlistRoutes from './src/routes/wishlistRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
})); 

// This line makes /images available at http://localhost:5001/images/...
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use(bodyParser.json());
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);
app.use('/reviews',  reviewRoutes);
app.use('/user', userRoutes);
app.use('/', homeRoute);
app.use('/user', userRoutes)
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin/user', adminUserRoutes);
app.use('/admin/login', adminAuthRoutes);
app.use('/admin/listings', adminListingRoutes);
app.use('/admin/reviews', adminReviewRoutes);
app.use('/admin/logs', adminLogRoutes);
app.use('/admin/notifications', adminNotificationRoutes);
app.use('/wishlist', wishlistRoutes);

const mongoURI = 'mongodb://127.0.0.1:27017';
// const mongoURI = 'mongodb://172.21.48.1:27017';
const dbName = 'oldphonedb';

mongoose.connect(`${mongoURI}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});