const { z } = require('zod');
const prisma = require('../config/prisma');

const sensorUpdateSchema = z.object({
  warningThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  sampleRate: z.number().optional(),
});

const getSensorsByAsset = async (req, res, next) => {
  try {
    const { assetId } = req.params;

    const sensors = await prisma.sensor.findMany({
      where: { assetId },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 15,
        },
      },
    });

    return res.json({
      success: true,
      count: sensors.length,
      sensors,
    });
  } catch (err) {
    next(err);
  }
};

const getSensorHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const readings = await prisma.sensorReading.findMany({
      where: { sensorId: id },
      orderBy: { timestamp: 'desc' },
      take: Math.min(500, parseInt(limit, 10)),
    });

    return res.json({
      success: true,
      readings: readings.reverse(),
    });
  } catch (err) {
    next(err);
  }
};

const updateSensorThresholds = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = sensorUpdateSchema.parse(req.body);

    const updated = await prisma.sensor.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: 'Sensor thresholds updated successfully',
      sensor: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSensorsByAsset,
  getSensorHistory,
  updateSensorThresholds,
};
