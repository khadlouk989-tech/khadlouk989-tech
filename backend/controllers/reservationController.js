const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createReservation = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { courseId } = req.body;
  const course = await prisma.course.findUnique({ where: { id: parseInt(courseId, 10) } });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (course.availableSpots <= 0) {
    return next(new ErrorResponse('Course is fully booked', 400));
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId: req.user.id,
      courseId: course.id
    }
  });

  await prisma.course.update({
    where: { id: course.id },
    data: { availableSpots: course.availableSpots - 1 }
  });

  res.status(201).json({ success: true, data: reservation });
});

exports.cancelReservation = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return next(new ErrorResponse('Reservation not found', 404));
  }

  const course = await prisma.course.findUnique({ where: { id: reservation.courseId } });
  await prisma.reservation.update({ where: { id }, data: { status: 'cancelled' } });

  if (course) {
    await prisma.course.update({
      where: { id: course.id },
      data: { availableSpots: course.availableSpots + 1 }
    });
  }

  res.status(200).json({ success: true, message: 'Reservation cancelled successfully' });
});

exports.getReservations = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role.name === 'Member') {
    where.userId = req.user.id;
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      user: true,
      course: { include: { coach: { include: { user: true } }, activity: true } }
    }
  });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

exports.getReservation = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: true,
      course: { include: { coach: { include: { user: true } }, activity: true } }
    }
  });
  if (!reservation) {
    return next(new ErrorResponse('Reservation not found', 404));
  }

  if (req.user.role.name === 'Member' && reservation.userId !== req.user.id) {
    return next(new ErrorResponse('Not authorized to view this reservation', 403));
  }

  res.status(200).json({ success: true, data: reservation });
});
