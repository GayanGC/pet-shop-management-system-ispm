/**
 * ============================================================================
 * SYSTEM SETTINGS ROUTES (settingsRoutes.js)
 * ============================================================================
 * Exposes GET /api/settings/theme and PUT /api/settings/theme with RBAC.
 */

const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get clinic system theme and typography settings
// @route   GET /api/settings/theme
// @access  Public (Staff & Clients need to fetch active branding)
router.get('/theme', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      settings = await SystemSettings.create({
        themePalette: 'violet',
        globalFont: 'Inter',
        globalFontSize: '14px',
        updatedBy: 'Default'
      });
    }
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('[Settings Route Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system settings',
      data: {
        themePalette: 'violet',
        globalFont: 'Inter',
        globalFontSize: '14px'
      }
    });
  }
});

// @desc    Update clinic system theme (Admin Only)
// @route   PUT /api/settings/theme
// @access  Private/Admin
router.put('/theme', protect, async (req, res) => {
  try {
    // Check if user is admin
    const userRole = (req.user && req.user.role) ? req.user.role.toLowerCase() : '';
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only clinic administrators can modify system branding & theme.'
      });
    }

    const { themePalette, globalFont, globalFontSize } = req.body;

    let settings = await SystemSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      settings = new SystemSettings();
    }

    if (themePalette) settings.themePalette = themePalette;
    if (globalFont) settings.globalFont = globalFont;
    if (globalFontSize) settings.globalFontSize = globalFontSize;
    settings.updatedBy = req.user.name || req.user.email || 'Admin';

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'System theme updated successfully across all clinic terminals',
      data: settings
    });
  } catch (error) {
    console.error('[Settings Update Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update system theme settings: ' + error.message
    });
  }
});

module.exports = router;
