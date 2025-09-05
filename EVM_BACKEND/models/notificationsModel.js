import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['booking', 'cancellation', 'reminder', 'success', 'info', 'warning', 'error', 'default', 'welcome', 'feedback', 'contact'],
    required: true,
  },
  link: {
    type: String,
  },
});

notificationSchema.index({ "timestamp": 1 }, { expireAfterSeconds: 259200 });

export const Notification=mongoose.model('Notification', notificationSchema);