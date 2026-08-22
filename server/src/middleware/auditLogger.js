const prisma = require('../config/prisma');

const logAudit = async (action, { userId, entityType, entityId, details, req }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
      : '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        userId: userId || req?.user?.id || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: typeof details === 'object' ? JSON.stringify(details) : details || null,
        ipAddress: String(ipAddress),
      },
    });
  } catch (err) {
    console.error('[Audit Logger Error]', err.message);
  }
};

module.exports = {
  logAudit,
};
