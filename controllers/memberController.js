const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createMember = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { firstName, lastName, email, phone, birthDate, gender, address, history, status } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return next(new ErrorResponse('Email already exists', 400));
  }

  const role = await prisma.role.findUnique({ where: { name: 'Member' } });
  if (!role) {
    return next(new ErrorResponse('Member role not found', 500));
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      address,
      status: status || 'active',
      roleId: role.id,
      member: { create: { history } }
    },
    include: { member: true, role: true }
  });

  res.status(201).json({ success: true, data: user });
});

exports.getMembers = asyncHandler(async (req, res) => {
  const members = await prisma.member.findMany({
    include: { user: { include: { role: true } }, subscriptions: true, reservations: true }
  });
  res.status(200).json({ success: true, count: members.length, data: members });
});

exports.getMember = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const member = await prisma.member.findUnique({
    where: { id },
    include: { user: { include: { role: true } }, subscriptions: true, reservations: true }
  });
  if (!member) {
    return next(new ErrorResponse('Member not found', 404));
  }
  res.status(200).json({ success: true, data: member });
});

exports.updateMember = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const member = await prisma.member.findUnique({ where: { id }, include: { user: true } });
  if (!member) {
    return next(new ErrorResponse('Member not found', 404));
  }

  const { firstName, lastName, phone, birthDate, gender, address, history, status } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: member.userId },
    data: {
      firstName,
      lastName,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      address,
      status
    }
  });

  const updatedMember = await prisma.member.update({
    where: { id },
    data: { history }
  });

  res.status(200).json({ success: true, data: { user: updatedUser, member: updatedMember } });
});

exports.deleteMember = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) {
    return next(new ErrorResponse('Member not found', 404));
  }

  await prisma.user.delete({ where: { id: member.userId } });
  res.status(200).json({ success: true, message: 'Member deleted successfully' });
});
