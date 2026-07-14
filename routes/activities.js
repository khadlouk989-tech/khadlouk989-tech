const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createActivity, getActivities, getActivity, updateActivity, deleteActivity } = require('../controllers/activityController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin', 'Coach'));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
  ],
  createActivity
);

router.get('/', getActivities);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getActivity);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], updateActivity);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteActivity);

module.exports = router;
