/**
 * DTAM Backend Automated Test Suite
 * Validates Core Algorithms, Authentication, Database Integrity, and Digital Twin Logic
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const { calculateHealthScore, calculateSensorSubScore } = require('../services/healthScoreService');
const { calculateFailureRisk } = require('../services/predictiveService');
const { syncDigitalTwin } = require('../services/digitalTwinService');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 Starting DTAM Automated Test Suite');
  console.log('========================================================\n');

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: Health Score Algorithm
    // ----------------------------------------------------
    console.log('📦 [1/6] Testing Health Score Calculations...');

    const subScoreNominal = calculateSensorSubScore(50, 20, 100, 75, 90);
    assert(subScoreNominal >= 85, `Nominal subscore should be high (Got: ${subScoreNominal})`);

    const subScoreWarning = calculateSensorSubScore(80, 20, 100, 75, 90);
    assert(subScoreWarning >= 40 && subScoreWarning <= 80, `Warning subscore should be between 40-80 (Got: ${subScoreWarning})`);

    const subScoreCritical = calculateSensorSubScore(95, 20, 100, 75, 90);
    assert(subScoreCritical <= 35, `Critical subscore should be <= 35 (Got: ${subScoreCritical})`);

    const healthResultNominal = calculateHealthScore({
      sensors: [
        { type: 'TEMPERATURE', currentReading: 50, minThreshold: 20, maxThreshold: 100, warningThreshold: 75, criticalThreshold: 90 },
        { type: 'VIBRATION', currentReading: 2, minThreshold: 0, maxThreshold: 15, warningThreshold: 5, criticalThreshold: 8 },
        { type: 'PRESSURE', currentReading: 5, minThreshold: 1, maxThreshold: 12, warningThreshold: 8, criticalThreshold: 10 },
        { type: 'ENERGY', currentReading: 20, minThreshold: 0, maxThreshold: 50, warningThreshold: 35, criticalThreshold: 45 },
      ],
      operatingHours: 1000,
      maintenances: [{ status: 'COMPLETED', completedDate: new Date() }],
      failureProbability: 5,
    });

    assert(healthResultNominal.healthScore >= 80, `Nominal asset health score should be >= 80 (Got: ${healthResultNominal.healthScore})`);
    assert(healthResultNominal.status === 'HEALTHY', `Nominal asset status should be HEALTHY (Got: ${healthResultNominal.status})`);

    // ----------------------------------------------------
    // TEST SUITE 2: Predictive Failure Risk Engine
    // ----------------------------------------------------
    console.log('\n📦 [2/6] Testing Predictive Maintenance & Failure Risk Engine...');

    const lowRisk = calculateFailureRisk({
      healthScore: 95,
      operatingHours: 1200,
      sensors: [
        { type: 'TEMPERATURE', currentReading: 45, warningThreshold: 75, criticalThreshold: 90, unit: '°C' },
        { type: 'VIBRATION', currentReading: 1.5, warningThreshold: 5.0, criticalThreshold: 8.0, unit: 'mm/s' },
      ],
      maintenances: [{ status: 'COMPLETED', completedDate: new Date() }],
      installationDate: new Date(),
      anomalyCount: 0,
    });

    assert(lowRisk.riskLevel === 'LOW', `Healthy asset should have LOW risk level (Got: ${lowRisk.riskLevel})`);
    assert(lowRisk.failureProbability < 25, `Healthy asset should have failure probability < 25% (Got: ${lowRisk.failureProbability}%)`);

    const highRisk = calculateFailureRisk({
      healthScore: 35,
      operatingHours: 14000,
      sensors: [
        { type: 'TEMPERATURE', currentReading: 95, warningThreshold: 75, criticalThreshold: 90, unit: '°C' },
        { type: 'VIBRATION', currentReading: 12.5, warningThreshold: 5.0, criticalThreshold: 8.0, unit: 'mm/s' },
      ],
      maintenances: [{ status: 'OVERDUE' }],
      installationDate: new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000),
      anomalyCount: 8,
    });

    assert(highRisk.riskLevel === 'CRITICAL', `Degraded asset should have CRITICAL risk level (Got: ${highRisk.riskLevel})`);
    assert(highRisk.failureProbability >= 75, `Degraded asset failure probability should be >= 75% (Got: ${highRisk.failureProbability}%)`);
    assert(highRisk.recommendation.length > 10, 'Recommendation message should be generated');

    // ----------------------------------------------------
    // TEST SUITE 3: Authentication & Password Hashing
    // ----------------------------------------------------
    console.log('\n📦 [3/6] Testing User Authentication & Passwords...');

    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    assert(!!adminUser, 'Admin user should exist in seeded database');

    const isMatch = await bcrypt.compare('Admin@123', adminUser.password);
    assert(isMatch === true, 'Admin password Admin@123 should match bcrypt hash');

    const token = jwt.sign({ id: adminUser.id, role: adminUser.role }, config.jwtSecret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, config.jwtSecret);
    assert(decoded.id === adminUser.id && decoded.role === 'ADMIN', 'JWT token should sign and decode correctly with ADMIN role');

    // ----------------------------------------------------
    // TEST SUITE 4: Asset Inventory & Relations
    // ----------------------------------------------------
    console.log('\n📦 [4/6] Testing Asset Models & Database Integrity...');

    const assets = await prisma.asset.findMany({
      include: { sensors: true, digitalTwin: true, components: true, location: true },
    });

    assert(assets.length >= 10, `Database should contain at least 10 assets (Found: ${assets.length})`);

    const pump = assets.find((a) => a.assetCode === 'PUMP-001');
    assert(!!pump, 'Pump PUMP-001 should exist');
    assert(pump.sensors.length >= 4, `Pump should have at least 4 sensors attached (Found: ${pump.sensors.length})`);
    assert(!!pump.digitalTwin, 'Pump should have linked Digital Twin');
    assert(pump.components.length >= 2, 'Pump should have physical components attached');

    // ----------------------------------------------------
    // TEST SUITE 5: Digital Twin Synchronization
    // ----------------------------------------------------
    console.log('\n📦 [5/6] Testing Digital Twin Synchronization Engine...');

    const syncResult = await syncDigitalTwin(pump.id);
    assert(syncResult.healthScore > 0, `Sync result should produce valid health score (Got: ${syncResult.healthScore})`);
    assert(typeof syncResult.sensorValues === 'object', 'Sensor values map should be present in sync result');
    assert(syncResult.failureRisk.failureProbability !== undefined, 'Failure risk probability should be calculated');

    // ----------------------------------------------------
    // TEST SUITE 6: Maintenance & Work Orders
    // ----------------------------------------------------
    console.log('\n📦 [6/6] Testing Maintenance Work Order Management...');

    const maintenances = await prisma.maintenance.findMany();
    assert(maintenances.length >= 3, `Database should contain maintenance records (Found: ${maintenances.length})`);

    const hasOverdue = maintenances.some((m) => m.status === 'OVERDUE' || m.status === 'SCHEDULED');
    assert(hasOverdue, 'Maintenance should contain scheduled or overdue work orders');
  } catch (err) {
    console.error('❌ Test execution error:', err);
    failedTests++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n========================================================');
  console.log(`📊 Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
