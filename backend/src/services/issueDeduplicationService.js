'use strict';

const Issue = require('../models/Issue');

const checkForDuplicate = async ({ type, longitude, latitude, radiusMeters = 15 }) => {
  try {
    const duplicate = await Issue.findOne({
      type,
      status: { $nin: ['Resolved', 'Cancelled', 'Rejected'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: radiusMeters,
        },
      },
    }).sort({ detectedAt: -1 });
    return duplicate;
  } catch (error) {
    console.error('[UrbanVision] Deduplication check failed:', error.message);
    return null;
  }
};

module.exports = { checkForDuplicate };
