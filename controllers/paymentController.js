const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.createPayment = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { userId, amount, method, date, status, reference, history } = req.body;
  const payment = await prisma.payment.create({
    data: {
      userId: parseInt(userId, 10),
      amount: parseFloat(amount),
      method,
      date: new Date(date),
      status,
      reference,
      history
    }
  });

  res.status(201).json({ success: true, data: payment });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({ include: { user: true } });
  res.status(200).json({ success: true, count: payments.length, data: payments });
});

exports.getPayment = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const payment = await prisma.payment.findUnique({ where: { id }, include: { user: true } });
  if (!payment) {
    return next(new ErrorResponse('Payment not found', 404));
  }
  res.status(200).json({ success: true, data: payment });
});

exports.updatePayment = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    return next(new ErrorResponse('Payment not found', 404));
  }

  const { amount, method, date, status, reference, history } = req.body;
  const updated = await prisma.payment.update({
    where: { id },
    data: {
      amount: amount ? parseFloat(amount) : payment.amount,
      method: method || payment.method,
      date: date ? new Date(date) : payment.date,
      status: status || payment.status,
      reference: reference || payment.reference,
      history
    }
  });

  res.status(200).json({ success: true, data: updated });
});

exports.deletePayment = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    return next(new ErrorResponse('Payment not found', 404));
  }

  await prisma.payment.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Payment deleted successfully' });
});
