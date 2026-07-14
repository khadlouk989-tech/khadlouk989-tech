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

exports.createNews = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) removeFile(`uploads/${req.file.filename}`);
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { title, body, authorId } = req.body;
  if (authorId && isNaN(parseInt(authorId, 10))) {
    return next(new ErrorResponse('Valid author ID is required', 400));
  }

  const news = await prisma.news.create({
    data: {
      title,
      body,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      authorId: authorId ? parseInt(authorId, 10) : req.user.id
    }
  });

  res.status(201).json({ success: true, data: news });
});

exports.getNews = asyncHandler(async (req, res) => {
  const news = await prisma.news.findMany({ orderBy: { publishedAt: 'desc' }, include: { author: true } });
  res.status(200).json({ success: true, count: news.length, data: news });
});

exports.getNewsItem = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const item = await prisma.news.findUnique({ where: { id }, include: { author: true } });
  if (!item) {
    return next(new ErrorResponse('News item not found', 404));
  }
  res.status(200).json({ success: true, data: item });
});

exports.updateNews = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { title, body, authorId } = req.body;
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) {
    if (req.file) removeFile(`uploads/${req.file.filename}`);
    return next(new ErrorResponse('News item not found', 404));
  }

  const updated = await prisma.news.update({
    where: { id },
    data: {
      title: title || item.title,
      body: body || item.body,
      image: req.file ? `/uploads/${req.file.filename}` : item.image,
      authorId: authorId ? parseInt(authorId, 10) : item.authorId
    }
  });

  if (req.file && item.image) removeFile(item.image);
  res.status(200).json({ success: true, data: updated });
});

exports.deleteNews = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) {
    return next(new ErrorResponse('News item not found', 404));
  }

  if (item.image) removeFile(item.image);
  await prisma.news.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'News item deleted successfully' });
});
