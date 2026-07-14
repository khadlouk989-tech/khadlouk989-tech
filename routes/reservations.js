const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createReservation, cancelReservation, getReservations, getReservation } = require('../controllers/reservationController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin', 'Coach', 'Member'));

router.post(
  '/',
  [
    body('courseId').isInt().withMessage('Valid course ID is required')
  ],
  createReservation
);

router.put('/:id/cancel', [param('id').isInt().withMessage('Valid reservation ID is required')], cancelReservation);
router.get('/', getReservations);
router.get('/:id', [param('id').isInt().withMessage('Valid reservation ID is required')], getReservation);

module.exports = router;
