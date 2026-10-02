/**
 * ============================================================================
 * SYSTEM SETTINGS MODEL (SystemSettings.js)
 * ============================================================================
 * Persists clinic-wide theme, branding, typography, and accessibility configs.
 */

const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    themePalette: {
      type: String,
      enum: ['violet', 'indigo', 'teal'],
      default: 'violet',
      required: true
    },
    globalFont: {
      type: String,
      enum: ['Inter', 'Poppins', 'Segoe UI', 'system-ui'],
      default: 'Inter',
      required: true
    },
    globalFontSize: {
      type: String,
      enum: ['13px', '14px', '16px'],
      default: '14px',
      required: true
    },
    updatedBy: {
      type: String,
      default: 'System Admin'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
