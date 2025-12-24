// File: backend/src/controllers/reviewController.js

import Listing from '../models/Listing.js';

// POST /listings/:id/reviews
export async function addReview(req, res) {
  try {
    const { id } = req.params;            // listing ID
    const { rating, comment } = req.body; // review details
    const reviewer = req.user.userId;     // from authUser middleware

    // 1) Validate input
    if (typeof rating !== 'number' || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    // 2) Create subdocument
    const review = { reviewer, rating, comment, hidden: false };

    // 3) Push into listing
    const updated = await Listing.findByIdAndUpdate(
      id,
      { $push: { reviews: review } },
      { new: true }
    ).exec();

    if (!updated) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // 4) Return the newly added review (last element)
    const newReview = updated.reviews[updated.reviews.length - 1];
    return res.status(201).json(newReview);
  } catch (err) {
    console.error('Error in addReview:', err);
    return res.status(500).json({ message: 'Error adding review.' });
  }
}

// PATCH /reviews/:id/visibility
export async function toggleReviewVisibility(req, res) {
  try {
    const { id } = req.params;         // review ID
    const { hidden } = req.body;       // boolean true/false

    if (typeof hidden !== 'boolean') {
      return res.status(400).json({ message: 'Hidden flag must be boolean.' });
    }

    // Find the parent listing containing this review and update
    const updated = await Listing.findOneAndUpdate(
      { 'reviews._id': id },
      { $set: { 'reviews.$.hidden': hidden } },
      { new: true }
    ).exec();

    if (!updated) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Extract the modified review
    const review = updated.reviews.find(r => r._id.toString() === id);
    return res.json(review);
  } catch (err) {
    console.error('Error in toggleReviewVisibility:', err);
    return res.status(500).json({ message: 'Error updating review visibility.' });
  }
}