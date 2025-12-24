// File: backend/src/controllers/adminListingController.js

import Listing from '../models/Listing.js';

/**
 * GET /admin/listings
 * List all listings (including disabled), with optional filtering.
 */
export async function getAllListings(req, res) {
  try {
    const {
      q,               // optional title search
      brand,           // optional brand filter
      disabled,        // optional disabled filter ("true"/"false")
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (q)      filter.title    = { $regex: q, $options: 'i' };
    if (brand)  filter.brand    = brand;
    if (disabled !== undefined) {
      filter.disabled = disabled === 'true';
    }

    // Build sort object
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Fetch all listings
    const listings = await Listing.find(filter).sort(sort);

    res.json({
      listings,
      pagination: {
        totalResults: listings.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: listings.length
      }
    });
  } catch (err) {
    console.error('Error in getAllListings:', err);
    res.status(500).json({ message: 'Server error fetching listings.' });
  }
}

/**
 * GET /admin/listings/:id
 * View a single listing, including all reviews.
 */
export async function getListingById(req, res) {
  try {
    const { id } = req.params;
    const listing = await Listing
      .findById(id)
      .populate('reviews.reviewer', 'firstname lastname email');  // optional reviewer details

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }
    res.json(listing);
  } catch (err) {
    console.error('Error in getListingById:', err);
    res.status(500).json({ message: 'Server error fetching listing.' });
  }
}

/**
 * PUT /admin/listings/:id
 * Edit title, brand, image, stock, price, and disabled flag.
 */
export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const updates = (({
      title, brand, image, stock, price, disabled
    }) => ({ title, brand, image, stock, price, disabled }))(req.body);

    const listing = await Listing.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }
    res.json({ message: 'Listing updated.', listing });
  } catch (err) {
    console.error('Error in updateListing:', err);
    res.status(500).json({ message: 'Server error updating listing.' });
  }
}

/**
 * DELETE /admin/listings/:id
 * Remove a listing entirely.
 */
export async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    console.error('Error in deleteListing:', err);
    res.status(500).json({ message: 'Server error deleting listing.' });
  }
}