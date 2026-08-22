const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        _count: { select: { assets: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, count: locations.length, locations });
  } catch (err) {
    next(err);
  }
});

router.post('/', verifyToken, requireRole('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { name, building, floor, room, coordinates } = req.body;
    const location = await prisma.location.create({
      data: { name, building, floor, room, coordinates },
    });
    return res.status(201).json({ success: true, location });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
