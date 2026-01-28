/**
 * Presets - Functions for accessing algorithm presets
 */

import { PRESETS } from './presetData.js';

export { PRESETS };

export function getPresetKeys() {
  return Object.keys(PRESETS);
}

export function getPreset(key) {
  return PRESETS[key] || null;
}

export function getPresetsByCategory(category) {
  return Object.entries(PRESETS)
    .filter(([, preset]) => preset.category === category)
    .map(([key, preset]) => ({ key, ...preset }));
}

export function getCategories() {
  return [...new Set(Object.values(PRESETS).map(p => p.category))];
}

export function isCustomPreset(key) {
  return key === 'custom';
}

export default PRESETS;
