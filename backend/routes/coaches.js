const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createCoach, getCoaches, getCoach, updateCoach, deleteCoach } = require('../controllers/coachController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin'));

router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('specialty').notEmpty().withMessage('Specialty is required')
  ],
  createCoach
);

router.get('/', getCoaches);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getCoach);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], updateCoach);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteCoach);

module.exports = router;
