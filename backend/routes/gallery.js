const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createGalleryItem, getGalleryItems, getGalleryItem, updateGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin'));

router.post(
  '/',
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  createGalleryItem
);

router.get('/', getGalleryItems);
router.get('/:id', [param('id').isInt().withMessage('Valid ID is required')], getGalleryItem);
router.put('/:id', [param('id').isInt().withMessage('Valid ID is required')], upload.single('image'), updateGalleryItem);
router.delete('/:id', [param('id').isInt().withMessage('Valid ID is required')], deleteGalleryItem);

module.exports = router;
