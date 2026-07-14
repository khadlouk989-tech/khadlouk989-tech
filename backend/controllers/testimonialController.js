const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createTestimonial = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { content } = req.body;
  const testimonial = await prisma.testimonial.create({
    data: {
      userId: req.user.id,
      content,
      status: 'pending'
    }
  });

  res.status(201).json({ success: true, data: testimonial });
});

exports.getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({ include: { user: true } });
  res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
});

exports.getTestimonial = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const testimonial = await prisma.testimonial.findUnique({ where: { id }, include: { user: true } });
  if (!testimonial) {
    return next(new ErrorResponse('Testimonial not found', 404));
  }
  res.status(200).json({ success: true, data: testimonial });
});

exports.updateTestimonial = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) {
    return next(new ErrorResponse('Testimonial not found', 404));
  }

  const { content, status } = req.body;
  const updated = await prisma.testimonial.update({
    where: { id },
    data: {
      content: content || testimonial.content,
      status: status || testimonial.status
    }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.approveTestimonial = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) {
    return next(new ErrorResponse('Testimonial not found', 404));
  }

  const approved = await prisma.testimonial.update({ where: { id }, data: { status: 'approved', approvedBy: req.user.id, approvedAt: new Date() } });
  res.status(200).json({ success: true, data: approved });
});

exports.deleteTestimonial = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) {
    return next(new ErrorResponse('Testimonial not found', 404));
  }

  await prisma.testimonial.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
});
