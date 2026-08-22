const iotSimulator = require('../simulator/iotSimulator');

function setupSocketIO(io) {
  iotSimulator.setSocketIO(io);

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send initial simulator status
    socket.emit('simulation:status', {
      isRunning: iotSimulator.isRunning,
      intervalMs: iotSimulator.intervalMs,
      activeFailures: Array.from(iotSimulator.failureSimulations.keys()),
    });

    // Handle simulation start
    socket.on('simulation:start', (data) => {
      const interval = data?.intervalMs || 3000;
      iotSimulator.start(interval);
    });

    // Handle simulation stop
    socket.on('simulation:stop', () => {
      iotSimulator.stop();
    });

    // Handle failure injection
    socket.on('simulation:trigger_failure', ({ assetId }) => {
      if (assetId) {
        iotSimulator.triggerFailureSimulation(assetId);
      }
    });

    // Handle failure reset
    socket.on('simulation:reset_asset', ({ assetId }) => {
      if (assetId) {
        iotSimulator.resetAssetSimulation(assetId);
      }
    });

    // Subscribe to single asset updates
    socket.on('subscribe:asset', (assetId) => {
      socket.join(`asset:${assetId}`);
    });

    socket.on('unsubscribe:asset', (assetId) => {
      socket.leave(`asset:${assetId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = {
  setupSocketIO,
};
