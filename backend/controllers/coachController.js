const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createCoach = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { firstName, lastName, email, phone, birthDate, gender, address, specialty, description, experience, socialLinks, availability } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return next(new ErrorResponse('Email already exists', 400));
  }

  const role = await prisma.role.findUnique({ where: { name: 'Coach' } });
  if (!role) {
    return next(new ErrorResponse('Coach role not found', 500));
  }

  const password = await bcrypt.hash('Coach1234!', 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      address,
      roleId: role.id,
      coach: {
        create: {
          specialty,
          description,
          experience,
          socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
          availability
        }
      }
    },
    include: { coach: true, role: true }
  });

  res.status(201).json({ success: true, data: user });
});

exports.getCoaches = asyncHandler(async (req, res) => {
  const coaches = await prisma.coach.findMany({ include: { user: { include: { role: true } } } });
  res.status(200).json({ success: true, count: coaches.length, data: coaches });
});

exports.getCoach = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const coach = await prisma.coach.findUnique({
    where: { id },
    include: { user: { include: { role: true } }, activities: true, courses: true }
  });
  if (!coach) {
    return next(new ErrorResponse('Coach not found', 404));
  }
  res.status(200).json({ success: true, data: coach });
});

exports.updateCoach = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const coach = await prisma.coach.findUnique({ where: { id }, include: { user: true } });
  if (!coach) {
    return next(new ErrorResponse('Coach not found', 404));
  }

  const { firstName, lastName, phone, birthDate, gender, address, specialty, description, experience, socialLinks, availability } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: coach.userId },
    data: {
      firstName,
      lastName,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      address
    }
  });

  const updatedCoach = await prisma.coach.update({
    where: { id },
    data: {
      specialty,
      description,
      experience,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
      availability
    }
  });

  res.status(200).json({ success: true, data: { user: updatedUser, coach: updatedCoach } });
});

exports.deleteCoach = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const coach = await prisma.coach.findUnique({ where: { id } });
  if (!coach) {
    return next(new ErrorResponse('Coach not found', 404));
  }

  await prisma.user.delete({ where: { id: coach.userId } });
  res.status(200).json({ success: true, message: 'Coach deleted successfully' });
});
