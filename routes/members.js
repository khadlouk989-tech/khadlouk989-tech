const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createMember, getMembers, getMember, updateMember, deleteMember } = require('../controllers/memberController');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Coach'));

router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone('fr-FR').withMessage('Valid phone number is required'),
    body('birthDate').optional().isISO8601().toDate().withMessage('Valid birth date is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female or other')
  ],
  createMember
);

router.get('/', getMembers);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getMember);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], updateMember);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteMember);

module.exports = router;
