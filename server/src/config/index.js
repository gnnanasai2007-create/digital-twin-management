const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from all possible locations
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${defaultDbPath}`;
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_dtam_2026_industrial_platform',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  simulation: {
    enabled: process.env.SIMULATION_ENABLED !== 'false',
    intervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS, 10) || 3000,
    anomalyProbability: parseFloat(process.env.ANOMALY_PROBABILITY) || 0.03,
  },
  roles: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    TECHNICIAN: 'TECHNICIAN',
    VIEWER: 'VIEWER',
  },
  assetStatuses: {
    HEALTHY: 'HEALTHY',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
    OFFLINE: 'OFFLINE',
    MAINTENANCE: 'MAINTENANCE',
  },
  sensorTypes: {
    TEMPERATURE: 'TEMPERATURE',
    VIBRATION: 'VIBRATION',
    PRESSURE: 'PRESSURE',
    HUMIDITY: 'HUMIDITY',
    ENERGY: 'ENERGY',
    RPM: 'RPM',
    FLOW: 'FLOW',
  },
  alertSeverities: {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
  },
  maintenanceStatuses: {
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    OVERDUE: 'OVERDUE',
  },
};
