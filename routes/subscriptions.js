const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createSubscription, getSubscriptions, getSubscription, updateSubscription, deleteSubscription } = require('../controllers/subscriptionController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin', 'Coach', 'Member'));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Valid price is required'),
    body('durationDays').isInt({ gt: 0 }).withMessage('Valid duration is required'),
    body('benefits').notEmpty().withMessage('Benefits are required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required')
  ],
  createSubscription
);

router.get('/', getSubscriptions);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getSubscription);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], updateSubscription);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteSubscription);

module.exports = router;
