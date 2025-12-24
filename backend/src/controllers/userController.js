// File: backend/src/controllers/adminController.js

import User from '../models/User.js';
import Listing from '../models/Listing.js';
import bcrypt from 'bcrypt';
import {sendEmail} from '../middleware/mail.js';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
// GET /user/profile
export async function getProfile(req, res) {
  const user = await User.findById(req.user.userId).select('firstname lastname email');
  res.json(user);
}

//PUT /user/profile
export async function updateProfile(req, res) {
    const {firstname, lastname, email, password} = req.body;
    const user = await User.findById(req.user.userId);


    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
        return res.status(401).json({message: 'Incorrect password.'});
    }

    user.firstname = firstname
    user.lastname = lastname
    if (user.email !== email) {
        //token for email verification, sent with the link
        const verificationToken = jwt.sign(
            { userId: user._id },
            process.env.EMAIL_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        user.verificationToken = verificationToken;
        user.isVerified = false;
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const subject = 'Verify your email address';
        const text = `Hi ${user.firstname},\nYou have recently changed your registered email address. Please verify your email again: ${verificationLink}`;
        const html = `
                <p>Hi ${user.firstname},</p>
                <p>You have recently changed your registered email address. Please verify your email again:</p>
                <a href="${verificationLink}">Verify Email</a>`;
        
        await sendEmail(email, subject, text, html);  
    }
    user.email = email;
    await user.save();
    res.json({ message: 'Profile updated' });
}

//POST /user/profile
export async function changePassword(req, res) {
    const { currentpassword, newpassword } = req.body;
    const user = await User.findById(req.user.userId);
    console.log(currentpassword);
    const passMatch = await bcrypt.compare(currentpassword, user.password);
    if (!passMatch) {
        return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newpassword, 10);
    await user.save();

    const subject = 'Verify your email address';
        const text = `Hi ${user.firstname},\nThis is a notification for your recent password change. If you have not initiated this change, please contact an admin as soon as possible.`;
        const html = `
                <p>Hi ${user.firstname},</p>
                <p>This is a notification for your recent password change. If you have not initiated this change, please contact an admin as soon as possible.</p>`;
    
    try {
        await sendEmail(user.email, subject, text, html);              
        res.status(201).json({ message: 'Password change notification sent.' });
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Password change error.' });
    }
}


//GET /user/listings
export async function getUserListings(req, res) {
    const listings = await Listing.find({seller:req.user.userId});
    res.json(listings);
}

//POST /user/listings
export async function createListing(req, res) {
  try {
    const { title, brand, stock, price } = req.body;
    const seller = req.user.userId;

    let imageUrl = '';
    if (req.file) {
      // relative path to uploads folder
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newListing = new Listing({
      title,
      brand,
      image: imageUrl, //relative path in db
      stock,
      seller,
      price,
      disabled: false,
      reviews: []
    });

    await newListing.save();
    res.status(201).json({ message: 'Listing created', listing: newListing });
  } catch (err) {
    res.status(500).json({ error: 'Error creating listing', details: err.message });
  }
}

//PATCH /user/listings/:listingid/toggle
export async function toggleListingStatus(req, res) {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing || listing.seller != req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    listing.disabled = !listing.disabled;
    await listing.save();
    res.json({ message: 'Listing status updated' });
}

//DELETE /user/listings/:listingId
export async function deleteListing(req, res) {
    try {
        const { listingId } = req.params;
        const listing = await Listing.findById(listingId);
        if (!listing || listing.seller != req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (listing.image && listing.image.startsWith('/uploads/')) {
            const imgpath = path.join(process.cwd(), 'public', listing.image); //cwd is current node process directory (root of node)
            fs.unlink(imgpath, (err) => {
                if (err) {
                    console.error('Failed to delete image file:', err.message);
                } else {
                    console.log('Image file deleted:', listing.image);
                }
            });
        }
        await listing.deleteOne();
        res.json({ message: 'Listing deleted' });
    } catch(error) {
        console.log(error);
        res.status(401).json({message: "error"});
    }
    
}

//GET /user/comments
export async function getOwnedComments(req, res) {
    const listings = await Listing.find({ 'reviews.reviewer': req.user.userId }).select('_id title reviews');
    const result = listings.map(listing => ({
        _id: listing._id,
        title: listing.title,
        reviews: listing.reviews.filter(r => r.reviewer === req.user.userId) //filter returned reviews to show only those by current user
    }));
    res.json(result);
}

//PATCH /comments/:listingId/:reviewID/toggle
export async function toggleCommentVisibility(req, res) {
    const { listingId, reviewId } = req.params;
    try {
        const listing = await Listing.findById(listingId);

        //seller identity check
        if (!listing || listing.seller.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
        }

        const review = listing.reviews.id(reviewId);
        if (!review) {
        return res.status(404).json({ message: 'Review not found' });
        }
        review.hidden = !review.hidden;
        await listing.save();

        res.json({ message: 'Comment visibility toggled', hidden: review.hidden });
  } catch (err) {
        res.status(500).json({ message: 'Error toggling comment visibility', error: err.message });
  }
}

//GET /comments/get-listing-comments
export async function getListingComments(req,res) {
    try {
        const listings = await Listing.find({seller: req.user.userId}).select('title reviews');
        const response = listings.map(listing => ({
        _id: listing._id,
        title: listing.title,
        reviews: listing.reviews.map(review => ({
            reviewId: review._id,
            reviewer: review.reviewer,
            rating: review.rating,
            comment: review.comment,
            hidden: review.hidden,
        }))
    }));

    res.json(response);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
    }
}