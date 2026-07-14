const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { createCourse, getCourses, getCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin', 'Coach'));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('coachId').isInt().withMessage('Valid coach ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('room').notEmpty().withMessage('Room is required'),
    body('availableSpots').isInt({ min: 1 }).withMessage('Available spots must be a positive integer')
  ],
  createCourse
);

router.get('/', getCourses);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getCourse);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], updateCourse);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteCourse);

module.exports = router;
