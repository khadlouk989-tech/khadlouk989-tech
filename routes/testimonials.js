const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createTestimonial, getTestimonials, getTestimonial, updateTestimonial, deleteTestimonial, approveTestimonial } = require('../controllers/testimonialController');

const router = express.Router();
router.use(protect);

router.post(
  '/',
  authorize('Member'),
  [body('content').notEmpty().withMessage('Content is required')],
  createTestimonial
);

router.get('/', authorize('Admin', 'Coach'), getTestimonials);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], authorize('Admin', 'Coach'), getTestimonial);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], authorize('Admin', 'Coach'), updateTestimonial);
router.put('/:id/approve', [param('id').isInt().withMessage('Valid ID is required')], authorize('Admin'), approveTestimonial);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], authorize('Admin'), deleteTestimonial);

module.exports = router;
