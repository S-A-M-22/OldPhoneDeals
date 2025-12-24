// File: backend/src/controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';
import Listing  from '../models/Listing.js';

export async function getWishlist(req, res) {
  try {
    let wishlist = await Wishlist
      .findOne({ user: req.user.userId })
      .populate('items', 'title price image stock');

    if (!wishlist) {
      // no document yet → behave as empty
      return res.json({ items: [] });
    }

    // format for frontend
    const items = wishlist.items.map(l => ({
      listingId: l._id,
      title:     l.title,
      price:     l.price,
      image:     l.image,
      stock:     l.stock
    }));

    res.json({ items });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Error fetching wishlist.' });
  }
}

export async function addToWishlist(req, res) {
  const { listingId } = req.params;
  try {
    // ensure listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    let wish = await Wishlist.findOne({ user: req.user.userId });
    if (!wish) {
      wish = new Wishlist({ user: req.user.userId, items: [] });
    }

    if (wish.items.includes(listingId)) {
      return res.status(400).json({ message: 'Already in wishlist.' });
    }

    wish.items.push(listingId);
    await wish.save();

    res.status(201).json({ message: 'Added to wishlist.' });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Error adding to wishlist.' });
  }
}

export async function removeFromWishlist(req, res) {
  const { listingId } = req.params;
  try {
    const wish = await Wishlist.findOne({ user: req.user.userId });
    if (!wish || !wish.items.includes(listingId)) {
      return res.status(404).json({ message: 'Not in wishlist.' });
    }

    wish.items = wish.items.filter(id => id.toString() !== listingId);
    await wish.save();

    res.json({ message: 'Removed from wishlist.' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Error removing from wishlist.' });
  }
}