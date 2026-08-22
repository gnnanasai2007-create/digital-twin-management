const prisma = require('../config/prisma');

const getOverviewAnalytics = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;

    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;
    else if (range === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Health Distribution
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        healthScore: true,
        criticality: true,
        operatingHours: true,
      },
    });

    const healthDistribution = {
      healthy: assets.filter((a) => a.healthScore >= 80).length,
      warning: assets.filter((a) => a.healthScore >= 60 && a.healthScore < 80).length,
      highRisk: assets.filter((a) => a.healthScore >= 40 && a.healthScore < 60).length,
      critical: assets.filter((a) => a.healthScore < 40).length,
    };

    // 2. Alerts by Severity in time range
    const alerts = await prisma.alert.findMany({
      where: { timestamp: { gte: startDate } },
      select: { severity: true, resolved: true, timestamp: true },
    });

    const alertStats = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
      warning: alerts.filter((a) => a.severity === 'WARNING').length,
      info: alerts.filter((a) => a.severity === 'INFO').length,
      resolved: alerts.filter((a) => a.resolved).length,
      unresolved: alerts.filter((a) => !a.resolved).length,
    };

    // 3. Maintenance Cost & Completion Breakdown
    const maintenances = await prisma.maintenance.findMany({
      where: { scheduledDate: { gte: startDate } },
      select: {
        id: true,
        cost: true,
        status: true,
        priority: true,
        scheduledDate: true,
        completedDate: true,
      },
    });

    const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
    const completedTasks = maintenances.filter((m) => m.status === 'COMPLETED').length;
    const completionRate = maintenances.length > 0
      ? Math.round((completedTasks / maintenances.length) * 100)
      : 100;

    // 4. Energy & Sensor Telemetry Aggregates by Day
    const energySensors = await prisma.sensor.findMany({
      where: { type: 'ENERGY' },
      select: { id: true },
    });
    const energySensorIds = energySensors.map((s) => s.id);

    const readings = await prisma.sensorReading.findMany({
      where: {
        timestamp: { gte: startDate },
        sensorId: { in: energySensorIds },
      },
      select: { value: true, timestamp: true },
      orderBy: { timestamp: 'asc' },
      take: 300,
    });

    // Group energy consumption into time series buckets
    const energyTimeline = [];
    const bucketMap = new Map();
    for (const r of readings) {
      const dateKey = new Date(r.timestamp).toISOString().split('T')[0];
      if (!bucketMap.has(dateKey)) {
        bucketMap.set(dateKey, { date: dateKey, total: 0, count: 0 });
      }
      const b = bucketMap.get(dateKey);
      b.total += r.value;
      b.count += 1;
    }

    bucketMap.forEach((val) => {
      energyTimeline.push({
        date: val.date,
        avgEnergyKw: Math.round((val.total / val.count) * 10) / 10,
      });
    });

    // 5. Failure Probability Distribution by Asset
    const failureRankings = assets
      .map((a) => {
        const failureProb = Math.max(2, Math.min(98, Math.round((100 - a.healthScore) * 0.95 + (a.operatingHours / 15000) * 10)));
        return {
          id: a.id,
          name: a.name,
          type: a.type,
          healthScore: a.healthScore,
          failureProbability: failureProb,
          status: a.status,
        };
      })
      .sort((a, b) => b.failureProbability - a.failureProbability);

    return res.json({
      success: true,
      range,
      healthDistribution,
      alertStats,
      maintenance: {
        totalCost: totalMaintenanceCost,
        totalTasks: maintenances.length,
        completedTasks,
        completionRate,
      },
      energyTimeline,
      failureRankings,
    });
  } catch (err) {
    next(err);
  }
};

const getHealthTrends = async (req, res, next) => {
  try {
    const assets = await prisma.asset.findMany({
      select: { id: true, name: true, healthScore: true, status: true, type: true },
      orderBy: { healthScore: 'asc' },
    });

    return res.json({
      success: true,
      assets,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverviewAnalytics,
  getHealthTrends,
};
