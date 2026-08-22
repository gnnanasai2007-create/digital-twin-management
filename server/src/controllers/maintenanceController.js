const { z } = require('zod');
const prisma = require('../config/prisma');
const { syncDigitalTwin } = require('../services/digitalTwinService');
const { logAudit } = require('../middleware/auditLogger');

const maintenanceCreateSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(2, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  scheduledDate: z.string().or(z.date()),
  assignedToId: z.string().optional().nullable(),
  cost: z.number().optional(),
  notes: z.string().optional().nullable(),
  replacedComponents: z.array(z.string()).optional(),
});

const maintenanceUpdateSchema = maintenanceCreateSchema.partial();

const getMaintenances = async (req, res, next) => {
  try {
    const { status, priority, assetId, assignedToId } = req.query;

    // Auto-update overdue status for items in past
    const now = new Date();
    await prisma.maintenance.updateMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;
    if (assetId && assetId !== 'ALL') where.assetId = assetId;
    if (assignedToId && assignedToId !== 'ALL') where.assignedToId = assignedToId;

    const maintenances = await prisma.maintenance.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetCode: true,
            type: true,
            status: true,
            healthScore: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    return res.json({
      success: true,
      count: maintenances.length,
      maintenances,
    });
  } catch (err) {
    next(err);
  }
};

const getMaintenanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            location: true,
            components: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, department: true },
        },
      },
    });

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    return res.json({ success: true, maintenance });
  } catch (err) {
    next(err);
  }
};

const createMaintenance = async (req, res, next) => {
  try {
    const data = maintenanceCreateSchema.parse(req.body);

    const created = await prisma.maintenance.create({
      data: {
        assetId: data.assetId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'SCHEDULED',
        scheduledDate: new Date(data.scheduledDate),
        assignedToId: data.assignedToId || null,
        cost: data.cost || 0,
        notes: data.notes || null,
        replacedComponents: data.replacedComponents ? JSON.stringify(data.replacedComponents) : null,
      },
      include: {
        asset: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await syncDigitalTwin(data.assetId);

    await logAudit('MAINTENANCE_CREATED', {
      userId: req.user?.id,
      entityType: 'Maintenance',
      entityId: created.id,
      details: { title: created.title, assetId: data.assetId },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Maintenance task created successfully',
      maintenance: created,
    });
  } catch (err) {
    next(err);
  }
};

const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = maintenanceUpdateSchema.parse(req.body);

    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const updateData = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.priority && { priority: data.priority }),
      ...(data.status && { status: data.status }),
      ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
      ...(data.cost !== undefined && { cost: data.cost }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.replacedComponents && { replacedComponents: JSON.stringify(data.replacedComponents) }),
    };

    if (data.status === 'COMPLETED' && !existing.completedDate) {
      updateData.completedDate = new Date();
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await syncDigitalTwin(existing.assetId);

    return res.json({
      success: true,
      message: 'Maintenance task updated successfully',
      maintenance: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    await prisma.maintenance.delete({ where: { id } });
    await syncDigitalTwin(existing.assetId);

    return res.json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};
