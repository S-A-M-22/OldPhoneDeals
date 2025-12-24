import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type:       { type: String, enum: ['order', 'review', 'message'], required: true },
  message:    { type: String, required: true },
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  createdAt:  { type: Date,    default: Date.now }
});

export default mongoose.model('Notification', NotificationSchema);
