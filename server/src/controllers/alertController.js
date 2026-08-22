const prisma = require('../config/prisma');
const { logAudit } = require('../middleware/auditLogger');

const getAlerts = async (req, res, next) => {
  try {
    const { severity, resolved, assetId, acknowledged } = req.query;

    const where = {};
    if (severity && severity !== 'ALL') where.severity = severity;
    if (resolved !== undefined && resolved !== 'ALL') where.resolved = resolved === 'true';
    if (acknowledged !== undefined && acknowledged !== 'ALL') where.acknowledged = acknowledged === 'true';
    if (assetId && assetId !== 'ALL') where.assetId = assetId;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetCode: true,
            type: true,
            status: true,
          },
        },
        sensor: {
          select: {
            id: true,
            sensorCode: true,
            type: true,
            unit: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 200,
    });

    return res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (err) {
    next(err);
  }
};

const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: req.user?.name || 'Authorized Operator',
      },
      include: { asset: true, sensor: true },
    });

    await logAudit('ALERT_ACKNOWLEDGED', {
      userId: req.user?.id,
      entityType: 'Alert',
      entityId: id,
      details: { message: updated.message },
      req,
    });

    return res.json({
      success: true,
      message: 'Alert acknowledged',
      alert: updated,
    });
  } catch (err) {
    next(err);
  }
};

const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user?.name || 'Authorized Operator',
      },
      include: { asset: true, sensor: true },
    });

    await logAudit('ALERT_RESOLVED', {
      userId: req.user?.id,
      entityType: 'Alert',
      entityId: id,
      details: { message: updated.message },
      req,
    });

    return res.json({
      success: true,
      message: 'Alert marked as resolved',
      alert: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
};
