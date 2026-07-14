const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createSubscription = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { userId, name, price, durationDays, benefits, status, startDate, endDate, autoRenew } = req.body;
  const subscription = await prisma.subscription.create({
    data: {
      userId: userId ? parseInt(userId, 10) : req.user.id,
      name,
      price: parseFloat(price),
      durationDays: parseInt(durationDays, 10),
      benefits,
      status: status || 'active',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      autoRenew: autoRenew === true || autoRenew === 'true'
    }
  });

  res.status(201).json({ success: true, data: subscription });
});

exports.getSubscriptions = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role.name === 'Member') {
    where.userId = req.user.id;
  }
  const subscriptions = await prisma.subscription.findMany({ where, include: { user: true } });
  res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
});

exports.getSubscription = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const subscription = await prisma.subscription.findUnique({ where: { id }, include: { user: true } });
  if (!subscription) {
    return next(new ErrorResponse('Subscription not found', 404));
  }

  if (req.user.role.name === 'Member' && subscription.userId !== req.user.id) {
    return next(new ErrorResponse('Not authorized to view this subscription', 403));
  }

  res.status(200).json({ success: true, data: subscription });
});

exports.updateSubscription = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const subscription = await prisma.subscription.findUnique({ where: { id } });
  if (!subscription) {
    return next(new ErrorResponse('Subscription not found', 404));
  }

  const { name, price, durationDays, benefits, status, startDate, endDate, autoRenew } = req.body;
  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      name: name || subscription.name,
      price: price ? parseFloat(price) : subscription.price,
      durationDays: durationDays ? parseInt(durationDays, 10) : subscription.durationDays,
      benefits: benefits || subscription.benefits,
      status: status || subscription.status,
      startDate: startDate ? new Date(startDate) : subscription.startDate,
      endDate: endDate ? new Date(endDate) : subscription.endDate,
      autoRenew: autoRenew !== undefined ? autoRenew === true || autoRenew === 'true' : subscription.autoRenew
    }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.deleteSubscription = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const subscription = await prisma.subscription.findUnique({ where: { id } });
  if (!subscription) {
    return next(new ErrorResponse('Subscription not found', 404));
  }

  await prisma.subscription.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
});
