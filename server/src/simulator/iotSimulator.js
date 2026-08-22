const prisma = require('../config/prisma');
const { detectAndHandleAnomalies } = require('../services/anomalyService');
const { syncDigitalTwin } = require('../services/digitalTwinService');

class IoTSimulator {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.intervalMs = 3000;
    this.io = null;

    // Map of assetId -> failure simulation state
    // { isFailing: boolean, step: number, targetTemp: number, targetVib: number }
    this.failureSimulations = new Map();
  }

  setSocketIO(io) {
    this.io = io;
  }

  start(intervalMs = 3000) {
    if (this.isRunning) return;
    this.intervalMs = intervalMs;
    this.isRunning = true;
    console.log(`[IoT Simulator] Started simulation engine (Interval: ${this.intervalMs}ms)`);

    this.intervalId = setInterval(() => this.tick(), this.intervalMs);

    if (this.io) {
      this.io.emit('simulation:status', {
        isRunning: true,
        intervalMs: this.intervalMs,
        activeFailures: Array.from(this.failureSimulations.keys()),
      });
    }
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    console.log('[IoT Simulator] Stopped simulation engine');

    if (this.io) {
      this.io.emit('simulation:status', {
        isRunning: false,
        intervalMs: this.intervalMs,
        activeFailures: Array.from(this.failureSimulations.keys()),
      });
    }
  }

  triggerFailureSimulation(assetId) {
    console.log(`[IoT Simulator] Injecting simulated failure scenario for Asset: ${assetId}`);
    this.failureSimulations.set(assetId, {
      isFailing: true,
      step: 0,
      maxSteps: 10,
    });

    if (this.io) {
      this.io.emit('simulation:failure_started', {
        assetId,
        message: 'Progressive failure scenario initiated. Monitor temperature and vibration surge.',
      });
    }
  }

  resetAssetSimulation(assetId) {
    console.log(`[IoT Simulator] Resetting simulation state for Asset: ${assetId}`);
    this.failureSimulations.delete(assetId);

    if (this.io) {
      this.io.emit('simulation:failure_reset', {
        assetId,
        message: 'Asset simulation restored to nominal operational baseline.',
      });
    }
  }

  /**
   * Main simulation tick
   */
  async tick() {
    try {
      const assets = await prisma.asset.findMany({
        where: {
          status: { not: 'OFFLINE' },
        },
        include: {
          sensors: true,
        },
      });

      for (const asset of assets) {
        await this.simulateAssetTelemetry(asset);
      }
    } catch (err) {
      console.error('[IoT Simulator Tick Error]', err.message);
    }
  }

  async simulateAssetTelemetry(asset) {
    const isFailing = this.failureSimulations.has(asset.id);
    let failState = null;
    if (isFailing) {
      failState = this.failureSimulations.get(asset.id);
      failState.step = Math.min(failState.maxSteps, failState.step + 1);
    }

    const updatedSensors = [];
    const createdReadings = [];
    const newAlerts = [];

    for (const sensor of asset.sensors) {
      let nextValue = sensor.currentReading;
      const { minThreshold, maxThreshold, warningThreshold, criticalThreshold, type } = sensor;

      if (isFailing) {
        // Stepwise progressive failure escalation
        const progress = failState.step / failState.maxSteps; // 0.1 to 1.0
        if (type === 'TEMPERATURE') {
          const target = criticalThreshold + 12; // Exceed critical
          nextValue = warningThreshold + (target - warningThreshold) * progress + (Math.random() * 2 - 1);
        } else if (type === 'VIBRATION') {
          const target = criticalThreshold + 4.5;
          nextValue = warningThreshold + (target - warningThreshold) * progress + (Math.random() * 0.8 - 0.4);
        } else if (type === 'ENERGY') {
          // Surge in energy draw due to mechanical resistance
          nextValue = warningThreshold * (1 + progress * 0.45) + (Math.random() * 2 - 1);
        } else {
          // Add operational perturbation
          nextValue = this.calculateNormalVariation(sensor);
        }
      } else {
        // Realistic gradual random walk towards nominal center with small noise
        nextValue = this.calculateNormalVariation(sensor);
      }

      // Round value according to sensor type precision
      if (type === 'VIBRATION' || type === 'PRESSURE') {
        nextValue = Math.round(nextValue * 100) / 100;
      } else {
        nextValue = Math.round(nextValue * 10) / 10;
      }

      // Determine sensor status
      let sensorStatus = 'NORMAL';
      if (nextValue >= criticalThreshold) sensorStatus = 'CRITICAL';
      else if (nextValue >= warningThreshold) sensorStatus = 'WARNING';

      // Update sensor reading in DB
      await prisma.sensor.update({
        where: { id: sensor.id },
        data: {
          currentReading: nextValue,
          status: sensorStatus,
        },
      });

      // Insert reading into history
      const reading = await prisma.sensorReading.create({
        data: {
          sensorId: sensor.id,
          assetId: asset.id,
          value: nextValue,
          status: sensorStatus,
          isAnomaly: sensorStatus !== 'NORMAL',
          timestamp: new Date(),
        },
      });
      createdReadings.push(reading);

      const sensorUpdated = {
        ...sensor,
        currentReading: nextValue,
        status: sensorStatus,
      };
      updatedSensors.push(sensorUpdated);

      // Check anomalies & trigger alerts
      const anomalyResult = await detectAndHandleAnomalies({
        asset,
        sensor: sensorUpdated,
        readingValue: nextValue,
      });

      if (anomalyResult.newAlerts?.length > 0) {
        newAlerts.push(...anomalyResult.newAlerts);
      }
    }

    // Increment operating hours slightly (~0.01 hour per tick)
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        operatingHours: { increment: 0.01 },
      },
    });

    // Synchronize Digital Twin state and compute health score & failure probability
    const twinSyncResult = await syncDigitalTwin(asset.id, updatedSensors);

    // Broadcast live telemetry via Socket.IO
    if (this.io) {
      this.io.emit('telemetry:asset_update', {
        assetId: asset.id,
        assetCode: asset.assetCode,
        name: asset.name,
        healthScore: twinSyncResult.healthScore,
        status: twinSyncResult.status,
        failureRisk: twinSyncResult.failureRisk,
        sensors: updatedSensors.map((s) => ({
          id: s.id,
          code: s.sensorCode,
          type: s.type,
          unit: s.unit,
          value: s.currentReading,
          status: s.status,
          warningThreshold: s.warningThreshold,
          criticalThreshold: s.criticalThreshold,
        })),
        lastSync: new Date(),
      });

      for (const alert of newAlerts) {
        this.io.emit('alert:new', alert);
      }
    }
  }

  /**
   * Helper for realistic gradual drift around nominal baseline
   */
  calculateNormalVariation(sensor) {
    const { minThreshold, warningThreshold, currentReading, type } = sensor;
    const nominalTarget = (minThreshold + warningThreshold * 0.75) / 2;

    // Small drift towards nominal center (damping factor)
    const driftToCenter = (nominalTarget - currentReading) * 0.08;

    // Small stochastic noise
    let stepSize = 0.5;
    if (type === 'VIBRATION') stepSize = 0.15;
    if (type === 'PRESSURE') stepSize = 0.08;
    if (type === 'RPM') stepSize = 15;
    if (type === 'ENERGY') stepSize = 0.6;

    const noise = (Math.random() - 0.5) * stepSize;
    let next = currentReading + driftToCenter + noise;

    // Keep within reasonable operational bounds under normal mode
    next = Math.max(minThreshold * 0.9, Math.min(warningThreshold * 0.95, next));
    return next;
  }
}

// Singleton simulator instance
const iotSimulator = new IoTSimulator();

module.exports = iotSimulator;
