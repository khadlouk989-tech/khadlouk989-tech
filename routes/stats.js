const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats } = require('../controllers/statsController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin'));

router.get('/', getStats);

module.exports = router;
