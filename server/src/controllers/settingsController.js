const prisma = require('../config/prisma');
const iotSimulator = require('../simulator/iotSimulator');
const { logAudit } = require('../middleware/auditLogger');

const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return res.json({
      success: true,
      settings: settingsMap,
      simulationStatus: {
        isRunning: iotSimulator.isRunning,
        intervalMs: iotSimulator.intervalMs,
        activeFailures: Array.from(iotSimulator.failureSimulations.keys()),
      },
      systemInfo: {
        version: '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.round(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { settings = {}, simulationIntervalMs, simulationEnabled } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }

    if (simulationIntervalMs) {
      if (iotSimulator.isRunning) {
        iotSimulator.stop();
        iotSimulator.start(parseInt(simulationIntervalMs, 10));
      } else {
        iotSimulator.intervalMs = parseInt(simulationIntervalMs, 10);
      }
    }

    if (simulationEnabled !== undefined) {
      if (simulationEnabled && !iotSimulator.isRunning) {
        iotSimulator.start(simulationIntervalMs || 3000);
      } else if (!simulationEnabled && iotSimulator.isRunning) {
        iotSimulator.stop();
      }
    }

    await logAudit('SETTINGS_CHANGED', {
      userId: req.user?.id,
      entityType: 'SystemSetting',
      details: { settings, simulationIntervalMs, simulationEnabled },
      req,
    });

    return res.json({
      success: true,
      message: 'System settings updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
