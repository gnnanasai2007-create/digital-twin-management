const {
  getDigitalTwinByAssetId,
  getAllDigitalTwins,
  syncDigitalTwin,
  getTwinHistory,
} = require('../services/digitalTwinService');
const iotSimulator = require('../simulator/iotSimulator');

const getTwins = async (req, res, next) => {
  try {
    const twins = await getAllDigitalTwins();
    return res.json({
      success: true,
      count: twins.length,
      twins,
    });
  } catch (err) {
    next(err);
  }
};

const getTwinByAsset = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const twin = await getDigitalTwinByAssetId(assetId);

    if (!twin) {
      return res.status(404).json({
        success: false,
        message: 'Digital Twin not found for this asset',
      });
    }

    return res.json({
      success: true,
      twin,
    });
  } catch (err) {
    next(err);
  }
};

const syncTwin = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const result = await syncDigitalTwin(assetId);

    return res.json({
      success: true,
      message: 'Digital Twin synchronized with latest sensor telemetry',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const getTwinTelemetryHistory = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const { range = '24h' } = req.query;

    const history = await getTwinHistory(assetId, { timeRange: range });

    return res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    next(err);
  }
};

const triggerFailure = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    iotSimulator.triggerFailureSimulation(assetId);

    return res.json({
      success: true,
      message: `Simulated failure sequence initiated for asset ${assetId}. Monitoring parameters are now escalating.`,
    });
  } catch (err) {
    next(err);
  }
};

const resetFailure = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    iotSimulator.resetAssetSimulation(assetId);
    await syncDigitalTwin(assetId);

    return res.json({
      success: true,
      message: `Simulation state reset to healthy baseline for asset ${assetId}.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTwins,
  getTwinByAsset,
  syncTwin,
  getTwinTelemetryHistory,
  triggerFailure,
  resetFailure,
};
