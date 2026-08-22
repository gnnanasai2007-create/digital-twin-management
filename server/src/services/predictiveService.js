/**
 * Predictive Maintenance & Failure Risk Engine
 * Prototype simulation algorithm estimating MTBF degradation, failure probabilities,
 * and prescriptive maintenance windows based on multi-sensor telemetry & history.
 */

function calculateFailureRisk({
  healthScore = 100,
  operatingHours = 0,
  recentReadings = [],
  sensors = [],
  maintenances = [],
  installationDate = new Date(),
  anomalyCount = 0,
}) {
  let riskScore = 0; // 0 to 100
  const factors = [];

  // 1. Health Score Factor (up to 35 points)
  const healthDeficit = Math.max(0, 100 - healthScore);
  const healthRiskContribution = (healthDeficit / 100) * 35;
  riskScore += healthRiskContribution;
  if (healthScore < 70) {
    factors.push({
      factor: 'Low Asset Health Score',
      severity: healthScore < 50 ? 'CRITICAL' : 'WARNING',
      description: `Current health score is ${healthScore}%, contributing significantly to risk.`,
    });
  }

  // 2. Temperature & Vibration Trend Analysis (up to 25 points)
  const tempSensor = sensors.find((s) => s.type === 'TEMPERATURE');
  const vibSensor = sensors.find((s) => s.type === 'VIBRATION');

  if (tempSensor) {
    const isCritical = tempSensor.currentReading >= tempSensor.criticalThreshold;
    const isWarning = tempSensor.currentReading >= tempSensor.warningThreshold;
    if (isCritical) {
      riskScore += 15;
      factors.push({
        factor: 'Thermal Runaway Warning',
        severity: 'CRITICAL',
        description: `Temperature at ${tempSensor.currentReading.toFixed(1)}${tempSensor.unit} exceeds critical limit (${tempSensor.criticalThreshold}${tempSensor.unit}).`,
      });
    } else if (isWarning) {
      riskScore += 8;
      factors.push({
        factor: 'Elevated Temperature',
        severity: 'WARNING',
        description: `Temperature is approaching upper operational bounds (${tempSensor.currentReading.toFixed(1)}${tempSensor.unit}).`,
      });
    }
  }

  if (vibSensor) {
    const isCritical = vibSensor.currentReading >= vibSensor.criticalThreshold;
    const isWarning = vibSensor.currentReading >= vibSensor.warningThreshold;
    if (isCritical) {
      riskScore += 15;
      factors.push({
        factor: 'Mechanical Vibration Breakdown',
        severity: 'CRITICAL',
        description: `Vibration at ${vibSensor.currentReading.toFixed(2)}${vibSensor.unit} indicates bearing or misalignment fault.`,
      });
    } else if (isWarning) {
      riskScore += 8;
      factors.push({
        factor: 'High Harmonic Vibration',
        severity: 'WARNING',
        description: `Vibration elevated above warning threshold (${vibSensor.currentReading.toFixed(2)}${vibSensor.unit}).`,
      });
    }
  }

  // 3. Operating Hours & Age (up to 15 points)
  const ageInYears = (Date.now() - new Date(installationDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (operatingHours > 12000 || ageInYears > 5) {
    riskScore += 12;
    factors.push({
      factor: 'Extended Duty Cycle',
      severity: 'WARNING',
      description: `Asset has accumulated ${Math.round(operatingHours)} operating hours over ${ageInYears.toFixed(1)} years.`,
    });
  } else if (operatingHours > 6000) {
    riskScore += 6;
  }

  // 4. Anomaly Frequency (up to 15 points)
  if (anomalyCount > 5) {
    riskScore += 15;
    factors.push({
      factor: 'Frequent Sensor Anomalies',
      severity: 'HIGH',
      description: `${anomalyCount} anomalous sensor spikes detected in recent monitoring window.`,
    });
  } else if (anomalyCount > 0) {
    riskScore += anomalyCount * 2.5;
  }

  // 5. Maintenance History & Overdue Status (up to 10 points)
  const hasOverdueMaint = maintenances.some((m) => m.status === 'OVERDUE');
  if (hasOverdueMaint) {
    riskScore += 10;
    factors.push({
      factor: 'Overdue Maintenance Task',
      severity: 'CRITICAL',
      description: 'Scheduled preventive maintenance task is past due date.',
    });
  }

  // Bound failure probability between 2% (baseline minimum noise) and 98%
  const failureProbability = Math.min(98, Math.max(2, Math.round(riskScore * 10) / 10));

  let riskLevel = 'LOW';
  let estimatedMaintenanceWindow = 'Standard schedule (within 6 months)';
  let recommendation = 'Asset is operating within normal parametric boundaries. Continue regular inspection cycle.';

  if (failureProbability >= 75) {
    riskLevel = 'CRITICAL';
    estimatedMaintenanceWindow = 'Immediate action required (< 24 hours)';
    recommendation = 'Urgent: Dispatch technician immediately to isolate vibration/thermal anomalies and replace worn components.';
  } else if (failureProbability >= 50) {
    riskLevel = 'HIGH';
    estimatedMaintenanceWindow = 'Schedule maintenance within 48-72 hours';
    recommendation = 'High risk of component breakdown. Schedule inspection of bearings, lubrication, and cooling systems.';
  } else if (failureProbability >= 25) {
    riskLevel = 'MEDIUM';
    estimatedMaintenanceWindow = 'Schedule maintenance within 2-4 weeks';
    recommendation = 'Monitor sensor drift. Schedule routine calibration and check fluid/vibration levels on next shift.';
  }

  return {
    failureProbability,
    riskLevel,
    estimatedMaintenanceWindow,
    recommendation,
    factors,
    timestamp: new Date(),
  };
}

module.exports = {
  calculateFailureRisk,
};
