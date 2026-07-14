const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

const removeFile = filePath => {
  if (filePath) {
    const normalized = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const absolutePath = path.join(__dirname, '..', normalized);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }
};

exports.createGalleryItem = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) removeFile(`uploads/${req.file.filename}`);
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { title, description, category, order } = req.body;
  if (!req.file) {
    return next(new ErrorResponse('Image file is required', 400));
  }

  const item = await prisma.gallery.create({
    data: {
      title,
      description,
      category,
      image: `/uploads/${req.file.filename}`,
      order: order ? parseInt(order, 10) : 0
    }
  });

  res.status(201).json({ success: true, data: item });
});

exports.getGalleryItems = asyncHandler(async (req, res) => {
  const items = await prisma.gallery.findMany({ orderBy: { order: 'asc' } });
  res.status(200).json({ success: true, count: items.length, data: items });
});

exports.getGalleryItem = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const item = await prisma.gallery.findUnique({ where: { id } });
  if (!item) {
    return next(new ErrorResponse('Gallery item not found', 404));
  }
  res.status(200).json({ success: true, data: item });
});

exports.updateGalleryItem = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { title, description, category, order } = req.body;
  const item = await prisma.gallery.findUnique({ where: { id } });
  if (!item) {
    if (req.file) removeFile(`uploads/${req.file.filename}`);
    return next(new ErrorResponse('Gallery item not found', 404));
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : item.image;
  if (req.file && item.image) {
    removeFile(item.image);
  }

  const updated = await prisma.gallery.update({
    where: { id },
    data: {
      title: title || item.title,
      description: description || item.description,
      category: category || item.category,
      image: imagePath,
      order: order !== undefined ? parseInt(order, 10) : item.order
    }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.deleteGalleryItem = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const item = await prisma.gallery.findUnique({ where: { id } });
  if (!item) {
    return next(new ErrorResponse('Gallery item not found', 404));
  }

  if (item.image) removeFile(item.image);
  await prisma.gallery.delete({ where: { id } });

  res.status(200).json({ success: true, message: 'Gallery item deleted successfully' });
});
