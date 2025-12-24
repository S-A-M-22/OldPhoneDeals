// File: backend/src/controllers/cartController.js

import Cart from '../models/Cart.js';
import Listing from '../models/Listing.js';
import Order from '../models/Order.js';
import CheckoutLog from '../models/CheckoutLog.js';
import Notification from '../models/Notification.js';

// POST /orders/checkout (adjust stock, record order)
export async function checkout(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.listingId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const stockErrors = [];
    for (const item of cart.items) {
      const listing = await Listing.findById(item.listingId);
      if (listing.stock < item.quantity) {
        stockErrors.push(`${listing.title} has insufficient stock.`);
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ message: stockErrors.join(' ') });
    }

    const orderItems = [];
    for (const item of cart.items) {
      const listing = await Listing.findById(item.listingId);
      listing.stock -= item.quantity;
      await listing.save();

      orderItems.push({
        listing: listing._id,
        quantity: item.quantity,
        price: listing.price
      });
    }

    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    });

    await order.save();
    await Cart.findOneAndDelete({ user: req.user.userId });

    const log = new CheckoutLog({
      user: req.user.userId,
      order: order._id,
      total: order.total,
      items: order.items,
    });

    await log.save();

    const notification = new Notification({
      type: 'order',
      message: `New order ${order._id} placed ($${order.total.toFixed(2)})`,
      orderId: order._id
    });

    await notification.save();

    return res.status(201).json({ message: 'Order placed successfully.', order });
  } catch (err) {
    console.error('Error in checkout:', err);
    return res.status(500).json({ message: 'Error processing checkout.' });
  }
}