const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createCourse = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { name, coachId, activityId, date, duration, room, availableSpots } = req.body;

  const coach = await prisma.coach.findUnique({ where: { id: parseInt(coachId, 10) } });
  if (!coach) {
    return next(new ErrorResponse('Coach not found', 404));
  }

  const course = await prisma.course.create({
    data: {
      name,
      coachId: parseInt(coachId, 10),
      activityId: activityId ? parseInt(activityId, 10) : null,
      date: new Date(date),
      duration: parseInt(duration, 10),
      room,
      availableSpots: parseInt(availableSpots, 10)
    }
  });

  res.status(201).json({ success: true, data: course });
});

exports.getCourses = asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({ include: { coach: { include: { user: true } }, activity: true, participants: true } });
  res.status(200).json({ success: true, count: courses.length, data: courses });
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const course = await prisma.course.findUnique({
    where: { id },
    include: { coach: { include: { user: true } }, activity: true, participants: true }
  });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }
  res.status(200).json({ success: true, data: course });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { name, coachId, activityId, date, duration, room, availableSpots } = req.body;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      name,
      coachId: coachId ? parseInt(coachId, 10) : course.coachId,
      activityId: activityId ? parseInt(activityId, 10) : course.activityId,
      date: date ? new Date(date) : course.date,
      duration: duration ? parseInt(duration, 10) : course.duration,
      room,
      availableSpots: availableSpots ? parseInt(availableSpots, 10) : course.availableSpots
    }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  await prisma.course.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Course deleted successfully' });
});
