const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createNews, getNews, getNewsItem, updateNews, deleteNews } = require('../controllers/newsController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin', 'Coach'));

router.post(
  '/',
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required')
  ],
  createNews
);

router.get('/', getNews);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getNewsItem);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], upload.single('image'), updateNews);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteNews);

module.exports = router;
