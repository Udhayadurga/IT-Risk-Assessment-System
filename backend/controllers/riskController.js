const Risk = require('../models/Risk');
const Notification = require('../models/Notification');

const createNotification = async (title, message, type, riskId, userId) => {
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
// @desc    Get all risks with filtering
// @route   GET /api/risks
exports.getRisks = async (req, res) => {
  try {
    const { category, status, riskLevel, search, sortBy = '-createdAt' } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } }
      ];
    }
    const risks = await Risk.find(query).sort(sortBy).populate('createdBy', 'name email');
    res.json({ success: true, count: risks.length, risks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single risk
// @route   GET /api/risks/:id
exports.getRisk = async (req, res) => {
  try {
    const risk = await Risk.findById(req.params.id).populate('createdBy', 'name email');
    if (!risk) return res.status(404).json({ success: false, message: 'Risk not found' });
    res.json({ success: true, risk });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create risk — triggers notification for Critical/High
// @route   POST /api/risks
exports.createRisk = async (req, res) => {
  try {
    const risk = await Risk.create({ ...req.body, createdBy: req.user._id });

    // ── Trigger notification for Critical and High risks ──
    if (risk.riskLevel === 'Critical' || risk.riskLevel === 'High') {
      const emoji = risk.riskLevel === 'Critical' ? '🔴' : '🟠';
      await createNotification(
        `${emoji} ${risk.riskLevel} Risk Reported`,
        `"${risk.title}" was reported by ${req.user.name} in ${risk.department}. Score: ${risk.riskScore}. Immediate attention required.`,
        risk.riskLevel,
        risk._id,
        req.user._id
      );
    }

    // ── Also notify for Medium risks ──
    if (risk.riskLevel === 'Medium') {
      await createNotification(
        `🟡 Medium Risk Reported`,
        `"${risk.title}" was reported by ${req.user.name}. Score: ${risk.riskScore}.`,
        'Medium',
        risk._id,
        req.user._id
      );
    }

    res.status(201).json({ success: true, risk });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update risk — triggers notification on status change
// @route   PUT /api/risks/:id
exports.updateRisk = async (req, res) => {
  try {
    const oldRisk = await Risk.findById(req.params.id);
    const risk = await Risk.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!risk) return res.status(404).json({ success: false, message: 'Risk not found' });

    // ── Notify if status changed ──
    if (oldRisk.status !== risk.status) {
      await createNotification(
        `📋 Risk Status Updated`,
        `"${risk.title}" status changed from "${oldRisk.status}" to "${risk.status}" by ${req.user.name}.`,
        'Status',
        risk._id,
        req.user._id
      );
    }

    res.json({ success: true, risk });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete risk
// @route   DELETE /api/risks/:id
exports.deleteRisk = async (req, res) => {
  try {
    const risk = await Risk.findByIdAndDelete(req.params.id);
    if (!risk) return res.status(404).json({ success: false, message: 'Risk not found' });
    res.json({ success: true, message: 'Risk deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get risk statistics
// @route   GET /api/risks/stats
exports.getRiskStats = async (req, res) => {
  try {
    const totalRisks = await Risk.countDocuments();
    const byLevel = await Risk.aggregate([{ $group: { _id: '$riskLevel', count: { $sum: 1 } } }]);
    const byStatus = await Risk.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCategory = await Risk.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const avgScore = await Risk.aggregate([{ $group: { _id: null, avg: { $avg: '$riskScore' } } }]);
    const heatmapData = await Risk.aggregate([
      { $group: { _id: { likelihood: '$likelihood', impact: '$impact' }, count: { $sum: 1 } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalRisks,
        byLevel: byLevel.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        avgScore: avgScore[0]?.avg?.toFixed(1) || 0,
        heatmapData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};