const path = require('path');
const { PrismaClient } = require('@prisma/client');

const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
const dbUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
