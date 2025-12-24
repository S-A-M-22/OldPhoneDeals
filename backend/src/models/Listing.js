// File: backend/src/models/Listing.js

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating:   Number,
  comment:  String,
  hidden:   { type: Boolean, default: false },
});

const ListingSchema = new mongoose.Schema({
  title:    String,
  brand:    String,
  image:    String,
  stock:    Number,
  seller:   String,
  price:    Number,
  disabled: Boolean,
  reviews:  [ReviewSchema],
});
export default mongoose.model('Listing', ListingSchema);