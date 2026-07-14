const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createActivity = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { name, description, image, durationMinutes, coachId, capacity } = req.body;
  const activity = await prisma.activity.create({
    data: { name, description, image, durationMinutes: parseInt(durationMinutes, 10), coachId: coachId || null, capacity: parseInt(capacity, 10) }
  });

  res.status(201).json({ success: true, data: activity });
});

exports.getActivities = asyncHandler(async (req, res) => {
  const activities = await prisma.activity.findMany({ include: { coach: true } });
  res.status(200).json({ success: true, count: activities.length, data: activities });
});

exports.getActivity = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const activity = await prisma.activity.findUnique({ where: { id }, include: { coach: true } });
  if (!activity) {
    return next(new ErrorResponse('Activity not found', 404));
  }
  res.status(200).json({ success: true, data: activity });
});

exports.updateActivity = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, image, durationMinutes, coachId, capacity } = req.body;
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) {
    return next(new ErrorResponse('Activity not found', 404));
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      name,
      description,
      image,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : activity.durationMinutes,
      coachId: coachId || null,
      capacity: capacity ? parseInt(capacity, 10) : activity.capacity
    }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.deleteActivity = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) {
    return next(new ErrorResponse('Activity not found', 404));
  }

  await prisma.activity.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Activity deleted successfully' });
});
