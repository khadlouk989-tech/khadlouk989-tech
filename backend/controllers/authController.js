const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
};

exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { firstName, lastName, email, password, phone, birthDate, gender, address, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const roleRecord = await prisma.role.findUnique({ where: { name: role } });
  if (!roleRecord) {
    return next(new ErrorResponse('Invalid role selected', 400));
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      address,
      roleId: roleRecord.id
    },
    include: { role: true }
  });

  res.status(201).json({
    success: true,
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
      token: generateToken(user.id)
    }
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role.name,
      token: generateToken(user.id)
    }
  });
});

exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { role: true }
  });

  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone, birthDate, gender, address } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      address
    },
    include: { role: true }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Current and new passwords are required', 400));
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const matched = await bcrypt.compare(currentPassword, user.password);
  if (!matched) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});
