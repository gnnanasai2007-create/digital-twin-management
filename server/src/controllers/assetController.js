const { z } = require('zod');
const prisma = require('../config/prisma');
const { syncDigitalTwin } = require('../services/digitalTwinService');
const { logAudit } = require('../middleware/auditLogger');

const assetSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  assetCode: z.string().min(2, 'Asset Code is required'),
  type: z.string().min(2, 'Type is required'),
  manufacturer: z.string().min(2, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial Number is required'),
  locationId: z.string().optional().nullable(),
  installationDate: z.string().or(z.date()).optional(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  operatingHours: z.number().optional(),
});

const getAssets = async (req, res, next) => {
  try {
    const {
      search,
      status,
      type,
      locationId,
      criticality,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetCode: { contains: search } },
        { manufacturer: { contains: search } },
        { model: { contains: search } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (locationId && locationId !== 'ALL') {
      where.locationId = locationId;
    }

    if (criticality && criticality !== 'ALL') {
      where.criticality = criticality;
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        location: true,
        sensors: true,
        digitalTwin: {
          select: {
            id: true,
            currentState: true,
            healthScore: true,
            failureRisk: true,
            maintenanceStatus: true,
            anomalyStatus: true,
            lastSync: true,
          },
        },
        _count: {
          select: {
            alerts: { where: { resolved: false } },
            maintenances: { where: { status: { in: ['SCHEDULED', 'IN_PROGRESS', 'OVERDUE'] } } },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    return res.json({
      success: true,
      count: assets.length,
      assets,
    });
  } catch (err) {
    next(err);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        location: true,
        components: true,
        sensors: {
          include: {
            readings: {
              orderBy: { timestamp: 'desc' },
              take: 20,
            },
          },
        },
        digitalTwin: true,
        maintenances: {
          include: { assignedTo: { select: { id: true, name: true, email: true } } },
          orderBy: { scheduledDate: 'desc' },
        },
        alerts: {
          where: { resolved: false },
          orderBy: { timestamp: 'desc' },
        },
        failurePredictions: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    return res.json({
      success: true,
      asset,
    });
  } catch (err) {
    next(err);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const data = assetSchema.parse(req.body);

    const createdAsset = await prisma.asset.create({
      data: {
        name: data.name,
        assetCode: data.assetCode.toUpperCase(),
        type: data.type,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        locationId: data.locationId || null,
        installationDate: data.installationDate ? new Date(data.installationDate) : new Date(),
        criticality: data.criticality || 'MEDIUM',
        description: data.description || null,
        image: data.image || null,
        operatingHours: data.operatingHours || 0,
        healthScore: 100,
        status: 'HEALTHY',
      },
    });

    // Create default sensor set based on asset type
    const defaultSensors = [
      {
        sensorCode: `${createdAsset.assetCode}-TEMP`,
        type: 'TEMPERATURE',
        unit: '°C',
        minThreshold: 20,
        maxThreshold: 100,
        warningThreshold: 75,
        criticalThreshold: 88,
        currentReading: 48.5,
      },
      {
        sensorCode: `${createdAsset.assetCode}-VIB`,
        type: 'VIBRATION',
        unit: 'mm/s',
        minThreshold: 0,
        maxThreshold: 15,
        warningThreshold: 5.2,
        criticalThreshold: 8.0,
        currentReading: 1.8,
      },
      {
        sensorCode: `${createdAsset.assetCode}-PRESS`,
        type: 'PRESSURE',
        unit: 'bar',
        minThreshold: 1,
        maxThreshold: 12,
        warningThreshold: 7.5,
        criticalThreshold: 9.5,
        currentReading: 4.2,
      },
      {
        sensorCode: `${createdAsset.assetCode}-PWR`,
        type: 'ENERGY',
        unit: 'kW',
        minThreshold: 0,
        maxThreshold: 75,
        warningThreshold: 52,
        criticalThreshold: 65,
        currentReading: 22.4,
      },
    ];

    for (const s of defaultSensors) {
      await prisma.sensor.create({
        data: {
          assetId: createdAsset.id,
          ...s,
        },
      });
    }

    // Initialize Digital Twin
    await syncDigitalTwin(createdAsset.id);

    await logAudit('ASSET_CREATED', {
      userId: req.user?.id,
      entityType: 'Asset',
      entityId: createdAsset.id,
      details: { name: createdAsset.name, code: createdAsset.assetCode },
      req,
    });

    const fullAsset = await prisma.asset.findUnique({
      where: { id: createdAsset.id },
      include: { location: true, sensors: true, digitalTwin: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Asset created successfully with digital twin initialized',
      asset: fullAsset,
    });
  } catch (err) {
    next(err);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = assetSchema.partial().parse(req.body);

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.assetCode && { assetCode: data.assetCode.toUpperCase() }),
        ...(data.type && { type: data.type }),
        ...(data.manufacturer && { manufacturer: data.manufacturer }),
        ...(data.model && { model: data.model }),
        ...(data.serialNumber && { serialNumber: data.serialNumber }),
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        ...(data.criticality && { criticality: data.criticality }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.operatingHours !== undefined && { operatingHours: data.operatingHours }),
      },
      include: { location: true, sensors: true, digitalTwin: true },
    });

    await syncDigitalTwin(id);

    await logAudit('ASSET_UPDATED', {
      userId: req.user?.id,
      entityType: 'Asset',
      entityId: id,
      details: { name: updated.name },
      req,
    });

    return res.json({
      success: true,
      message: 'Asset updated successfully',
      asset: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await prisma.asset.delete({ where: { id } });

    await logAudit('ASSET_DELETED', {
      userId: req.user?.id,
      entityType: 'Asset',
      entityId: id,
      details: { name: existing.name, assetCode: existing.assetCode },
      req,
    });

    return res.json({
      success: true,
      message: 'Asset and associated digital twin deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const getAssetStats = async (req, res, next) => {
  try {
    const totalAssets = await prisma.asset.count();
    const healthy = await prisma.asset.count({ where: { status: 'HEALTHY' } });
    const warning = await prisma.asset.count({ where: { status: 'WARNING' } });
    const critical = await prisma.asset.count({ where: { status: 'CRITICAL' } });
    const offline = await prisma.asset.count({ where: { status: 'OFFLINE' } });
    const maintenance = await prisma.asset.count({ where: { status: 'MAINTENANCE' } });

    const maintenanceDue = await prisma.maintenance.count({
      where: {
        status: { in: ['SCHEDULED', 'OVERDUE'] },
      },
    });

    const activeAlerts = await prisma.alert.count({
      where: { resolved: false },
    });

    const criticalAlerts = await prisma.alert.count({
      where: { resolved: false, severity: 'CRITICAL' },
    });

    const assetsWithHealth = await prisma.asset.findMany({
      select: { healthScore: true },
    });

    const avgHealth = assetsWithHealth.length > 0
      ? Math.round((assetsWithHealth.reduce((sum, a) => sum + a.healthScore, 0) / assetsWithHealth.length) * 10) / 10
      : 100;

    return res.json({
      success: true,
      stats: {
        totalAssets,
        healthy,
        warning,
        critical,
        offline,
        maintenance,
        maintenanceDue,
        activeAlerts,
        criticalAlerts,
        averageHealth: avgHealth,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
};
