const prisma = require('../config/prisma');

const getAuditLogs = async (req, res, next) => {
  try {
    const { action, userId, limit = 100 } = req.query;

    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (userId && userId !== 'ALL') where.userId = userId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: Math.min(300, parseInt(limit, 10)),
    });

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
};
