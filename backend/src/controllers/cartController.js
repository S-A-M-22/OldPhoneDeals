// File: backend/src/controllers/cartController.js

import Cart from '../models/Cart.js';
import Listing from '../models/Listing.js';

// GET /cart (fetch user’s cart)
export async function getCart(req, res) {
  try {
    // 1) Load the cart and populate the listing details we need
    const cart = await Cart
      .findOne({ user: req.user.userId })
      .populate('items.listingId', 'title price image stock');

    // 2) If no cart or empty, return empty structure
    if (!cart || cart.items.length === 0) {
      return res.json({
        items: [],
        totalQuantity: 0,
        totalPrice: 0
      });
    }

    // 3) Map into a shape the frontend can use directly
    const items = cart.items.map(({ listingId, quantity }) => {
      const { _id, title, price, image, stock } = listingId;
      return {
        listingId: _id,
        title,
        price,
        image,
        stock,
        quantity,
        subtotal: price * quantity
      };
    });

    // 4) Compute totals
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice    = items.reduce((sum, i) => sum + i.subtotal, 0);

    // 5) Return it
    return res.json({ items, totalQuantity, totalPrice });
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({ message: 'Error fetching cart.' });
  }
}

// POST /cart (add item to cart)
export async function addToCart(req, res) {
  const { listingId, quantity } = req.body;

  try {

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }
    if (listing.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available.' });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.listingId.toString() === listingId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ listingId, quantity });
    }

    await cart.save();
    return res.status(201).json({ message: 'Item added to cart.' });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    return res.status(500).json({ message: 'Error adding item to cart.' });
  }
}

// PUT /cart (update item in cart)
export async function updateCart(req, res) {
  const { listingId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const item = cart.items.find(item => item.listingId.toString() === listingId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing || listing.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available.' });
    }

    item.quantity = quantity;
    await cart.save();
    return res.json({ message: 'Cart updated successfully.' });
  } catch (err) {
    console.error('Error updating cart:', err);
    return res.status(500).json({ message: 'Error updating cart.' });
  }
}

// DELETE /cart (remove item from cart)
export async function removeFromCart(req, res) {
  const { listingId } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex(item => item.listingId.toString() === listingId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    return res.status(500).json({ message: 'Error removing item from cart.' });
  }
}
