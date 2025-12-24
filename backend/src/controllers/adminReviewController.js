// File: backend/src/controllers/adminReviewController.js

import Listing from '../models/Listing.js';

/**
 * GET /admin/reviews
 * List all reviews (including hidden), with pagination.
 */
export async function getAllReviews(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip     = (pageNum - 1) * pageSize;

    // Count total reviews
    const countResult = await Listing.aggregate([
      { $unwind: '$reviews' },
      { $count: 'total' }
    ]);
    const totalReviews = countResult[0]?.total || 0;
    const totalPages   = Math.ceil(totalReviews / pageSize);

    // Fetch paginated reviews
    // added lookup to join Listing's reviewer (ObjectID) with its User counterpart
    const reviews = await Listing.aggregate([
      { $unwind: '$reviews' },
      {
        $lookup: {
          from: 'users',
          localField: 'reviews.reviewer',
          foreignField: '_id',
          as: 'reviewer'
        }
      },
      { $unwind: '$reviewer'},
      { $project: {
          _id:            '$reviews._id',
          listingId:      '$_id',
          listingTitle:   '$title',
          reviewer:        { $concat: ['$reviewer.firstname', ' ', '$reviewer.lastname'] },
          rating:         '$reviews.rating',
          comment:        '$reviews.comment',
          hidden:         '$reviews.hidden'
      }},
      { $sort: { _id: -1 } },             // newest first
      { $skip: skip },
      { $limit: pageSize }
    ]);

    return res.json({
      reviews,
      pagination: {
        totalReviews,
        totalPages,
        currentPage: pageNum,
        pageSize
      }
    });
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    return res.status(500).json({ message: 'Server error fetching reviews.' });
  }
}

/**
 * GET /admin/reviews/search
 * Search reviews by user, content, or listing title
 */
export async function searchReviews(req, res) {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Missing search query.' });
    }

    const parsePage = parseInt(page, 10);
    const parseLimit = parseInt(limit, 10);
    const skip = (parsePage - 1) * parseLimit;

    const regex = new RegExp(q, 'i'); // case insensitive

    // Search in reviews array and listing title
    // same lookup, but now add the full name as a field to regex by for the search
    const reviews = await Listing.aggregate([
      { $unwind: '$reviews' },
      {
        $lookup: {
          from: 'users',
          localField: 'reviews.reviewer',
          foreignField: '_id',
          as: 'reviewer'
        }
      },
      { $unwind: '$reviewer'},
      {
        $addFields: {                                          
          fullReviewerName: {
            $concat: ['$reviewer.firstname', ' ', '$reviewer.lastname']
          }
        }
      },
      { $match: {
        $or: [
          { fullReviewerName: regex },
          { 'reviews.comment': regex },
          { 'title': regex }
        ]
      }},
      { $project: {
          _id:            '$reviews._id',
          listingId:      '$_id',
          listingTitle:   '$title',
          reviewer:       '$fullReviewerName',
          rating:         '$reviews.rating',
          comment:        '$reviews.comment',
          hidden:         '$reviews.hidden'
      }},
      { $sort: { _id: -1 } },             // newest first
      { $skip: skip },
      { $limit: parseLimit }
    ]);

    // Count total matching reviews
    // added same lookup as above
    const countResult = await Listing.aggregate([
      { $unwind: '$reviews' },
      {
        $lookup: {
          from: 'users',
          localField: 'reviews.reviewer',
          foreignField: '_id',
          as: 'reviewer'
        }
      },
      { $unwind: '$reviewer'},
      {
        $addFields: {                                          
          fullReviewerName: {
            $concat: ['$reviewer.firstname', ' ', '$reviewer.lastname']
          }
        }
      },
      { $match: {
        $or: [
          { fullReviewerName: regex },
          { 'reviews.comment': regex },
          { 'title': regex }
        ]
      }},
      { $count: 'total' }
    ]);
    const totalReviews = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalReviews / parseLimit);

    return res.json({
      reviews,
      pagination: {
        totalReviews,
        totalPages,
        currentPage: parsePage,
        pageSize: parseLimit
      }
    });
  } catch (err) {
    console.error('Error searching reviews:', err);
    return res.status(500).json({ message: 'Error searching reviews.' });
  }
}

/**
 * PATCH /admin/reviews/:id/visibility
 * Override the hidden flag of a single review.
 */
export async function updateReviewVisibility(req, res) {
  try {
    const { id } = req.params;
    const { hidden } = req.body;
    if (typeof hidden !== 'boolean') {
      return res.status(400).json({ message: 'Hidden flag must be a boolean.' });
    }

    // Find the listing containing this review and update the subdocument
    const listing = await Listing.findOneAndUpdate(
      { 'reviews._id': id },
      { $set: { 'reviews.$.hidden': hidden } },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Extract the updated review
    const review = listing.reviews.id(id);
    return res.json(review);
  } catch (err) {
    console.error('Error updating review visibility:', err);
    return res.status(500).json({ message: 'Server error updating review.' });
  }
}