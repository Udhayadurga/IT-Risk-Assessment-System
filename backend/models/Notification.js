const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low', 'Status', 'System'],
    default: 'System'
  },
  riskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Risk'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isGlobal: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);