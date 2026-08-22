const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupSocketIO } = require('./sockets/socketHandler');
const iotSimulator = require('./simulator/iotSimulator');

// Import routes
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const twinRoutes = require('./routes/twinRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const alertRoutes = require('./routes/alertRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', config.clientUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize Socket.IO handlers
setupSocketIO(io);

// Global Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', config.clientUrl],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    simulatorRunning: iotSimulator.isRunning,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/digital-twins', twinRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/locations', locationRoutes);

// Serve static client assets in production
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server & Background Simulator
const PORT = config.port;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 DTAM Server listening on port ${PORT}`);
    console.log(`📡 WebSocket endpoint ready for real-time telemetry`);
    console.log(`🏭 Environment: ${config.nodeEnv}`);
    console.log(`====================================================`);

    // Start IoT Simulator automatically if enabled
    if (config.simulation.enabled) {
      iotSimulator.start(config.simulation.intervalMs);
    }
  });
}

module.exports = { app, server, io };
