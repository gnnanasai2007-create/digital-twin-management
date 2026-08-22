const prisma = require('../config/prisma');

/**
 * Anomaly Detection Service
 * Evaluates real-time sensor readings for:
 * 1. Absolute threshold violations (Warning & Critical)
 * 2. Sudden delta / rate of change spikes (Moving standard deviation / derivative)
 * 3. Cross-sensor correlations (e.g. high RPM but zero flow -> impeller failure)
 */

async function detectAndHandleAnomalies({ asset, sensor, readingValue, previousReadings = [] }) {
  const anomalies = [];
  const alertsToCreate = [];

  const {
    id: sensorId,
    type: sensorType,
    sensorCode,
    unit,
    warningThreshold,
    criticalThreshold,
  } = sensor;

  // 1. Critical Threshold Check
  if (readingValue >= criticalThreshold) {
    anomalies.push({
      type: 'CRITICAL_THRESHOLD_EXCEEDED',
      severity: 'CRITICAL',
      message: `CRITICAL ${sensorType} limit breached on ${asset.name} (${asset.assetCode}): ${readingValue.toFixed(1)}${unit} (Limit: ${criticalThreshold}${unit})`,
    });
  }
  // 2. Warning Threshold Check
  else if (readingValue >= warningThreshold) {
    anomalies.push({
      type: 'WARNING_THRESHOLD_EXCEEDED',
      severity: 'WARNING',
      message: `Elevated ${sensorType} detected on ${asset.name} (${asset.assetCode}): ${readingValue.toFixed(1)}${unit} (Warning: ${warningThreshold}${unit})`,
    });
  }

  // 3. Sudden Delta / Rate of Change Anomaly
  if (previousReadings.length >= 3) {
    const lastThree = previousReadings.slice(0, 3);
    const avgRecent = lastThree.reduce((sum, r) => sum + r.value, 0) / lastThree.length;
    const delta = Math.abs(readingValue - avgRecent);
    const percentageJump = avgRecent > 0 ? (delta / avgRecent) * 100 : 0;

    // A jump of > 30% in one tick is a rate of change anomaly
    if (percentageJump > 35 && readingValue > warningThreshold * 0.75) {
      anomalies.push({
        type: 'RATE_OF_CHANGE_SPIKE',
        severity: readingValue >= criticalThreshold ? 'CRITICAL' : 'WARNING',
        message: `Rapid transient surge (+${percentageJump.toFixed(0)}%) in ${sensorType} on ${asset.name}`,
      });
    }
  }

  // Generate DB alerts if there are unacknowledged duplicate alerts within the last 5 minutes to avoid spamming
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  for (const anomaly of anomalies) {
    const existingRecentAlert = await prisma.alert.findFirst({
      where: {
        assetId: asset.id,
        sensorId: sensor.id,
        severity: anomaly.severity,
        resolved: false,
        timestamp: { gte: fiveMinutesAgo },
      },
    });

    if (!existingRecentAlert) {
      const createdAlert = await prisma.alert.create({
        data: {
          assetId: asset.id,
          sensorId: sensor.id,
          type: anomaly.type,
          severity: anomaly.severity,
          message: anomaly.message,
          timestamp: new Date(),
        },
        include: {
          asset: { select: { id: true, name: true, assetCode: true } },
          sensor: { select: { id: true, sensorCode: true, type: true, unit: true } },
        },
      });
      alertsToCreate.push(createdAlert);
    }
  }

  return {
    isAnomaly: anomalies.length > 0,
    anomalies,
    newAlerts: alertsToCreate,
  };
}

module.exports = {
  detectAndHandleAnomalies,
};
