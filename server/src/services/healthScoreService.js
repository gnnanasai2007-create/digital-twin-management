/**
 * Health Score Calculation Service
 * Multi-factor algorithmic calculation for physical asset Digital Twins
 *
 * Weightings:
 * - Temperature: 20%
 * - Vibration: 20%
 * - Pressure: 15%
 * - Energy: 15%
 * - Operating Hours: 10%
 * - Maintenance History: 10%
 * - Failure Risk Penalty: 10%
 */

/**
 * Calculates a sensor sub-score (0 - 100) based on thresholds
 * @param {number} value Current reading
 * @param {number} min Minimum expected
 * @param {number} max Maximum expected
 * @param {number} warning Warning threshold
 * @param {number} critical Critical threshold
 * @returns {number} Score from 0 to 100
 */
function calculateSensorSubScore(value, min, max, warning, critical) {
  if (value === undefined || value === null || isNaN(value)) return 100;

  // If within nominal range [min, warning] -> 90-100
  if (value <= warning) {
    // Distance from ideal midpoint
    const ideal = (min + warning) / 2;
    const deviation = Math.abs(value - ideal) / Math.max(1, (warning - min) / 2);
    return Math.max(85, 100 - deviation * 15);
  }

  // If between warning and critical -> 50-80
  if (value <= critical) {
    const range = critical - warning;
    const progress = (value - warning) / Math.max(1, range);
    return Math.max(40, 80 - progress * 40);
  }

  // Beyond critical threshold -> 0-35
  const excess = value - critical;
  const penalty = Math.min(35, (excess / Math.max(1, critical * 0.2)) * 35);
  return Math.max(0, 35 - penalty);
}

/**
 * Calculate operating hours degradation score (0 - 100)
 * Assumes maintenance cycle around 5,000 - 10,000 hours
 */
function calculateOperatingHoursScore(operatingHours) {
  if (!operatingHours || operatingHours <= 0) return 100;
  const cycle = 8000;
  const progressInCycle = (operatingHours % cycle) / cycle;
  // Score drops from 100 down to 65 as hours approach maintenance interval
  return Math.max(60, 100 - progressInCycle * 35);
}

/**
 * Calculate maintenance history score (0 - 100)
 * Looks at overdue status and recent maintenance records
 */
function calculateMaintenanceScore(maintenances = []) {
  if (!maintenances || maintenances.length === 0) return 85;

  const hasOverdue = maintenances.some((m) => m.status === 'OVERDUE');
  if (hasOverdue) return 40;

  const hasInProgress = maintenances.some((m) => m.status === 'IN_PROGRESS');
  if (hasInProgress) return 70;

  // Check last completed maintenance
  const completed = maintenances
    .filter((m) => m.status === 'COMPLETED' && m.completedDate)
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));

  if (completed.length > 0) {
    const daysSince = (Date.now() - new Date(completed[0].completedDate)) / (1000 * 60 * 60 * 24);
    if (daysSince <= 30) return 98;
    if (daysSince <= 90) return 90;
    if (daysSince <= 180) return 80;
    return 70;
  }

  return 85;
}

/**
 * Main Asset Health Score Calculation
 * @param {Object} params
 * @param {Array} params.sensors - Array of sensors with current readings & thresholds
 * @param {number} params.operatingHours - Total operating hours
 * @param {Array} params.maintenances - Array of maintenance records
 * @param {number} params.failureProbability - 0 to 100
 * @returns {Object} { healthScore, status, breakdown }
 */
function calculateHealthScore({ sensors = [], operatingHours = 0, maintenances = [], failureProbability = 0 }) {
  let tempScore = 100;
  let vibScore = 100;
  let pressScore = 100;
  let energyScore = 100;
  let otherScore = 100;

  const sensorMap = {};
  for (const s of sensors) {
    sensorMap[s.type] = s;
  }

  if (sensorMap.TEMPERATURE) {
    const s = sensorMap.TEMPERATURE;
    tempScore = calculateSensorSubScore(s.currentReading, s.minThreshold, s.maxThreshold, s.warningThreshold, s.criticalThreshold);
  }
  if (sensorMap.VIBRATION) {
    const s = sensorMap.VIBRATION;
    vibScore = calculateSensorSubScore(s.currentReading, s.minThreshold, s.maxThreshold, s.warningThreshold, s.criticalThreshold);
  }
  if (sensorMap.PRESSURE) {
    const s = sensorMap.PRESSURE;
    pressScore = calculateSensorSubScore(s.currentReading, s.minThreshold, s.maxThreshold, s.warningThreshold, s.criticalThreshold);
  }
  if (sensorMap.ENERGY || sensorMap.RPM || sensorMap.FLOW) {
    const s = sensorMap.ENERGY || sensorMap.RPM || sensorMap.FLOW;
    energyScore = calculateSensorSubScore(s.currentReading, s.minThreshold, s.maxThreshold, s.warningThreshold, s.criticalThreshold);
  }

  const opHoursScore = calculateOperatingHoursScore(operatingHours);
  const maintScore = calculateMaintenanceScore(maintenances);
  const failurePenalty = Math.max(0, 100 - failureProbability);

  // Weighted Combination:
  // Temp 20% + Vib 20% + Press 15% + Energy 15% + OpHours 10% + Maint 10% + FailureRisk 10% = 100%
  const totalScore = (
    tempScore * 0.20 +
    vibScore * 0.20 +
    pressScore * 0.15 +
    energyScore * 0.15 +
    opHoursScore * 0.10 +
    maintScore * 0.10 +
    failurePenalty * 0.10
  );

  const roundedScore = Math.min(100, Math.max(0, Math.round(totalScore * 10) / 10));

  let status = 'HEALTHY';
  if (roundedScore < 40 || tempScore < 35 || vibScore < 35) {
    status = 'CRITICAL';
  } else if (roundedScore < 80 || tempScore < 70 || vibScore < 70) {
    status = 'WARNING';
  }

  return {
    healthScore: roundedScore,
    status,
    breakdown: {
      temperature: Math.round(tempScore),
      vibration: Math.round(vibScore),
      pressure: Math.round(pressScore),
      energy: Math.round(energyScore),
      operatingHours: Math.round(opHoursScore),
      maintenance: Math.round(maintScore),
      failurePenalty: Math.round(failurePenalty),
    },
  };
}

module.exports = {
  calculateSensorSubScore,
  calculateHealthScore,
  calculateOperatingHoursScore,
  calculateMaintenanceScore,
};
