const prisma = require('../config/prisma');

const getAssetHealthReport = async (req, res, next) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        location: true,
        digitalTwin: true,
        sensors: true,
        _count: {
          select: {
            alerts: { where: { resolved: false } },
            maintenances: true,
          },
        },
      },
      orderBy: { healthScore: 'asc' },
    });

    const reportData = assets.map((a) => {
      let riskLevel = 'LOW';
      let failureProb = 5;
      try {
        if (a.digitalTwin?.failureRisk) {
          const parsed = JSON.parse(a.digitalTwin.failureRisk);
          riskLevel = parsed.riskLevel || 'LOW';
          failureProb = parsed.failureProbability || 5;
        }
      } catch {}

      return {
        assetId: a.id,
        assetCode: a.assetCode,
        name: a.name,
        type: a.type,
        location: a.location ? `${a.location.building} - ${a.location.name}` : 'Unassigned',
        status: a.status,
        criticality: a.criticality,
        healthScore: a.healthScore,
        operatingHours: Math.round(a.operatingHours),
        failureRisk: riskLevel,
        failureProbability: `${failureProb}%`,
        activeAlerts: a._count.alerts,
        totalMaintenances: a._count.maintenances,
      };
    });

    return res.json({
      success: true,
      generatedAt: new Date(),
      title: 'Comprehensive Asset Health & Status Report',
      data: reportData,
    });
  } catch (err) {
    next(err);
  }
};

const getMaintenanceReport = async (req, res, next) => {
  try {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        asset: { select: { name: true, assetCode: true, type: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    const reportData = maintenances.map((m) => ({
      maintenanceId: m.id,
      assetName: m.asset.name,
      assetCode: m.asset.assetCode,
      title: m.title,
      priority: m.priority,
      status: m.status,
      scheduledDate: m.scheduledDate.toISOString().split('T')[0],
      completedDate: m.completedDate ? m.completedDate.toISOString().split('T')[0] : 'N/A',
      assignedTechnician: m.assignedTo?.name || 'Unassigned',
      costUsd: `$${m.cost.toFixed(2)}`,
      notes: m.notes || 'None',
    }));

    return res.json({
      success: true,
      generatedAt: new Date(),
      title: 'Asset Maintenance Work Orders & History Report',
      data: reportData,
    });
  } catch (err) {
    next(err);
  }
};

const getSensorReport = async (req, res, next) => {
  try {
    const sensors = await prisma.sensor.findMany({
      include: {
        asset: { select: { name: true, assetCode: true } },
      },
      orderBy: { asset: { name: 'asc' } },
    });

    const reportData = sensors.map((s) => ({
      sensorId: s.id,
      assetName: s.asset.name,
      assetCode: s.asset.assetCode,
      sensorCode: s.sensorCode,
      type: s.type,
      currentReading: `${s.currentReading} ${s.unit}`,
      warningThreshold: `${s.warningThreshold} ${s.unit}`,
      criticalThreshold: `${s.criticalThreshold} ${s.unit}`,
      status: s.status,
      sampleRateMs: s.sampleRate,
    }));

    return res.json({
      success: true,
      generatedAt: new Date(),
      title: 'IoT Sensor Calibration & Threshold Telemetry Report',
      data: reportData,
    });
  } catch (err) {
    next(err);
  }
};

const getAlertReport = async (req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        asset: { select: { name: true, assetCode: true } },
        sensor: { select: { sensorCode: true, type: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 500,
    });

    const reportData = alerts.map((a) => ({
      alertId: a.id,
      assetName: a.asset.name,
      assetCode: a.asset.assetCode,
      sensorCode: a.sensor?.sensorCode || 'SYSTEM',
      type: a.type,
      severity: a.severity,
      message: a.message,
      acknowledged: a.acknowledged ? 'YES' : 'NO',
      acknowledgedBy: a.acknowledgedBy || '-',
      resolved: a.resolved ? 'YES' : 'NO',
      resolvedBy: a.resolvedBy || '-',
      timestamp: a.timestamp.toISOString(),
    }));

    return res.json({
      success: true,
      generatedAt: new Date(),
      title: 'Historical Anomaly & Alert Log Report',
      data: reportData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssetHealthReport,
  getMaintenanceReport,
  getSensorReport,
  getAlertReport,
};
