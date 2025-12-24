// File: backend/src/controllers/listingController.js

import Listing from '../models/Listing.js';
import User from '../models/User.js';

// Add new function to get all brands
export async function getAllBrands(req, res) {
  try {
    const brands = await Listing.distinct('brand', { disabled: false });
    return res.json({ brands });
  } catch (err) {
    console.error('Error in getAllBrands:', err);
    return res.status(500).json({ message: 'Error fetching brands.' });
  }
}

export async function searchListings(req, res) {
  try {
    const {
      q = '',                   // text search
      brand,                    // exact match
      maxPrice,                 // numeric upper bound
      sortBy = 'price',         // field to sort on
      sortOrder = 'asc',        // 'asc' or 'desc'
    } = req.query;

    const filter = {
      title:    { $regex: q, $options: 'i' },   // case-insensitive partial match
      disabled: false                           // hide disabled listings
    };
    if (brand)    filter.brand = brand;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get all listings without pagination
    const listings = await Listing.find(filter).sort(sort);

    return res.json({ listings });
  } catch (err) {
    console.error('Error in searchListings:', err);
    return res.status(500).json({ message: 'Error fetching listings.' });
  }
}

// GET /listings/:id?reviews=N
export async function getListingById(req, res) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.reviews, 10) || 3;

    // 1) Fetch listing, added populating for reviewer
    const listing = await Listing.findById(id)
          .populate('reviews.reviewer', 'firstname lastname')
          .exec();
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // 2) Optionally enrich seller name
    const seller = await User.findById(listing.seller).exec();
    const sellerName = seller ? `${seller.firstname} ${seller.lastname}` : null;

    // 3) Slice reviews, use terna
    const totalReviews = listing.reviews.length;
    const reviews = listing.reviews.slice(0, limit).map(review => {
      let reviewerName = 'Unknown';
      if (review.reviewer && review.reviewer.firstname && review.reviewer.lastname) {
        reviewerName = `${review.reviewer.firstname} ${review.reviewer.lastname}`;
      }

      return {
        reviewer: reviewerName,
        rating:   review.rating,
        comment:  review.comment,
        hidden:   review.hidden,
      };
    });

    // 4) Respond with minimal payload
    return res.json({
      _id: listing._id,
      title: listing.title,
      brand: listing.brand,
      image: listing.image,
      stock: listing.stock,
      price: listing.price,
      seller: sellerName,
      disabled: listing.disabled,
      reviews,
      totalReviews
    });
  } catch (err) {
    console.error('Error in getListingById:', err);
    return res.status(500).json({ message: 'Error fetching listing.' });
  }
}