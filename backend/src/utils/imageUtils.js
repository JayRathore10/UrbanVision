'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const readImageAsBase64 = (imagePath) => {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  return fs.readFileSync(imagePath).toString('base64');
};

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.bmp': 'image/bmp', '.gif': 'image/gif',
  };
  return mimeMap[ext] || 'image/jpeg';
};

const generateSafeFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const uniqueId = crypto.randomBytes(16).toString('hex');
  return `${Date.now()}-${uniqueId}${ext}`;
};

const validateImageFile = (filePath, maxSizeMB = 10) => {
  if (!fs.existsSync(filePath)) return { valid: false, error: 'File not found' };
  const stats = fs.statSync(filePath);
  if (stats.size > maxSizeMB * 1024 * 1024) return { valid: false, error: `File exceeds ${maxSizeMB}MB limit` };
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext)) return { valid: false, error: `Unsupported file type: ${ext}` };
  return { valid: true };
};

const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`[UrbanVision] Failed to cleanup file ${filePath}:`, err.message);
  }
};

module.exports = { readImageAsBase64, getMimeType, generateSafeFilename, validateImageFile, cleanupFile };
