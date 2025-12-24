import mongoose from 'mongoose';

const CheckoutLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  timestamp: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  items: [
    {
      listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
      quantity: Number,
      price: Number
    }
  ],
});

export default mongoose.model('CheckoutLog', CheckoutLogSchema);
