const Settings = require('../models/Settings');

/**
 * Get current settings
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Initialize with defaults
      settings = new Settings();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const { maxActiveOrders, rushMode, shopStatus } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    if (maxActiveOrders !== undefined) settings.maxActiveOrders = maxActiveOrders;
    if (rushMode !== undefined) settings.rushMode = rushMode;
    if (shopStatus !== undefined) settings.shopStatus = shopStatus;

    await settings.save();

    // Emit socket event for real-time updates
    req.app.io.emit('settingsUpdated', settings);

    res.json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};