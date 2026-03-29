const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort('-createdAt')
      .limit(20)
      .populate('createdBy', 'name');

    // Add isRead field for current user
    const notificationsWithRead = notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.includes(req.user._id)
    }));

    const unreadCount = notificationsWithRead.filter(n => !n.isRead).length;

    res.json({
      success: true,
      notifications: notificationsWithRead,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.find({
      readBy: { $ne: req.user._id }
    });

    await Promise.all(notifications.map(n => {
      n.readBy.push(req.user._id);
      return n.save();
    }));

    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create notification (internal use)
exports.createNotification = async (title, message, type, riskId, userId) => {
  try {
    await Notification.create({
      title,
      message,
      type,
      riskId,
      createdBy: userId,
      isGlobal: true
    });
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
};