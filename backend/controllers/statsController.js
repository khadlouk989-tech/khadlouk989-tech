const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const [memberCount, coachCount, activeSubscriptions, paymentsThisMonth, coursesThisWeek, reservationsCount, revenueThisMonth] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'Member' } } }),
    prisma.user.count({ where: { role: { name: 'Coach' } } }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.payment.count({ where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.course.count({ where: { date: { gte: new Date(), lt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.reservation.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      numberOfMembers: memberCount,
      numberOfCoaches: coachCount,
      activeSubscriptions,
      paymentsThisMonth,
      coursesThisWeek,
      reservationsCount,
      revenueThisMonth: revenueThisMonth._sum.amount || 0
    }
  });
});
