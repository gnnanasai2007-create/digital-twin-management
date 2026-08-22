const prisma = require('../config/prisma');
const { calculateHealthScore } = require('./healthScoreService');
const { calculateFailureRisk } = require('./predictiveService');

/**
 * Digital Twin Engine Service
 * Manages virtual representation, state synchronization, and historical telemetry
 */

async function getDigitalTwinByAssetId(assetId) {
  return await prisma.digitalTwin.findUnique({
    where: { assetId },
    include: {
      asset: {
        include: {
          location: true,
          components: true,
          sensors: true,
          maintenances: {
            orderBy: { scheduledDate: 'desc' },
            take: 5,
          },
          alerts: {
            where: { resolved: false },
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
        },
      },
    },
  });
}

async function getAllDigitalTwins() {
  return await prisma.digitalTwin.findMany({
    include: {
      asset: {
        include: {
          location: true,
          sensors: true,
        },
      },
    },
    orderBy: { healthScore: 'asc' },
  });
}

async function syncDigitalTwin(assetId, latestSensors = null) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      sensors: true,
      maintenances: true,
      alerts: { where: { resolved: false } },
      components: true,
    },
  });

  if (!asset) {
    throw new Error(`Asset not found with ID: ${assetId}`);
  }

  const sensorsToUse = latestSensors || asset.sensors;

  // Build sensor values map snapshot
  const sensorMap = {};
  for (const s of sensorsToUse) {
    sensorMap[s.type] = {
      sensorId: s.id,
      code: s.sensorCode,
      value: s.currentReading,
      unit: s.unit,
      status: s.status,
      warningThreshold: s.warningThreshold,
      criticalThreshold: s.criticalThreshold,
    };
  }

  // Count recent anomalies (alerts in last 24h)
  const recentAnomalyCount = asset.alerts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'WARNING'
  ).length;

  // 1. Calculate Predictive Failure Risk
  const failureRiskObj = calculateFailureRisk({
    healthScore: asset.healthScore,
    operatingHours: asset.operatingHours,
    sensors: sensorsToUse,
    maintenances: asset.maintenances,
    installationDate: asset.installationDate,
    anomalyCount: recentAnomalyCount,
  });

  // 2. Calculate Comprehensive Health Score
  const { healthScore, status: calculatedStatus, breakdown } = calculateHealthScore({
    sensors: sensorsToUse,
    operatingHours: asset.operatingHours,
    maintenances: asset.maintenances,
    failureProbability: failureRiskObj.failureProbability,
  });

  // 3. Determine Maintenance Status
  let maintenanceStatus = 'UP_TO_DATE';
  const hasOverdue = asset.maintenances.some((m) => m.status === 'OVERDUE');
  const hasInProgress = asset.maintenances.some((m) => m.status === 'IN_PROGRESS');
  if (hasOverdue) {
    maintenanceStatus = 'OVERDUE';
  } else if (hasInProgress) {
    maintenanceStatus = 'UNDER_MAINTENANCE';
  } else if (failureRiskObj.riskLevel === 'HIGH' || failureRiskObj.riskLevel === 'CRITICAL') {
    maintenanceStatus = 'DUE_SOON';
  }

  // 4. Update Digital Twin Record in DB
  const updatedTwin = await prisma.digitalTwin.upsert({
    where: { assetId },
    create: {
      assetId,
      currentState: calculatedStatus === 'CRITICAL' ? 'FAULT' : calculatedStatus === 'WARNING' ? 'DEGRADED' : 'OPERATIONAL',
      sensorValues: JSON.stringify(sensorMap),
      healthScore,
      operatingHours: asset.operatingHours,
      maintenanceStatus,
      failureRisk: JSON.stringify(failureRiskObj),
      anomalyStatus: calculatedStatus === 'CRITICAL' ? 'ANOMALY_DETECTED' : calculatedStatus === 'WARNING' ? 'WARNING' : 'NORMAL',
      lastSync: new Date(),
    },
    update: {
      currentState: calculatedStatus === 'CRITICAL' ? 'FAULT' : calculatedStatus === 'WARNING' ? 'DEGRADED' : 'OPERATIONAL',
      sensorValues: JSON.stringify(sensorMap),
      healthScore,
      operatingHours: asset.operatingHours,
      maintenanceStatus,
      failureRisk: JSON.stringify(failureRiskObj),
      anomalyStatus: calculatedStatus === 'CRITICAL' ? 'ANOMALY_DETECTED' : calculatedStatus === 'WARNING' ? 'WARNING' : 'NORMAL',
      lastSync: new Date(),
    },
  });

  // 5. Also update Asset status and healthScore
  await prisma.asset.update({
    where: { id: assetId },
    data: {
      healthScore,
      status: calculatedStatus,
    },
  });

  return {
    twin: updatedTwin,
    healthScore,
    status: calculatedStatus,
    breakdown,
    failureRisk: failureRiskObj,
    sensorValues: sensorMap,
  };
}

async function getTwinHistory(assetId, { timeRange = '24h' } = {}) {
  let startDate = new Date();
  if (timeRange === '1h') startDate.setHours(startDate.getHours() - 1);
  else if (timeRange === '24h') startDate.setHours(startDate.getHours() - 24);
  else if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);
  else startDate.setHours(startDate.getHours() - 24);

  const readings = await prisma.sensorReading.findMany({
    where: {
      assetId,
      timestamp: { gte: startDate },
    },
    include: {
      sensor: {
        select: { type: true, unit: true, sensorCode: true },
      },
    },
    orderBy: { timestamp: 'asc' },
    take: 500,
  });

  return readings;
}

module.exports = {
  getDigitalTwinByAssetId,
  getAllDigitalTwins,
  syncDigitalTwin,
  getTwinHistory,
};
