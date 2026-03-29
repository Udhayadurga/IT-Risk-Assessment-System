const express = require('express');
const router = express.Router();
const {
  getRisks,
  getRisk,
  createRisk,
  updateRisk,
  deleteRisk,
  getRiskStats
} = require('../controllers/riskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All risk routes require auth

router.get('/stats', getRiskStats);
router.route('/')
  .get(getRisks)
  .post(createRisk);

router.route('/:id')
  .get(getRisk)
  .put(updateRisk)
  .delete(authorize('admin'), deleteRisk);

module.exports = router;