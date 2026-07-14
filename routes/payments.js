const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createPayment, getPayments, getPayment, updatePayment, deletePayment } = require('../controllers/paymentController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin', 'Coach'));

router.post(
  '/',
  [
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Valid amount is required'),
    body('method').notEmpty().withMessage('Payment method is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('status').notEmpty().withMessage('Payment status is required'),
    body('reference').notEmpty().withMessage('Reference is required')
  ],
  createPayment
);

router.get('/', getPayments);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getPayment);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], updatePayment);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deletePayment);

module.exports = router;
