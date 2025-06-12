// src/constants.js
// This file contains common configuration values and constants used throughout the application

/**
 * Options for armor and structure modifications
 */
export const MODIFICATION_OPTIONS = [
  { value: 'stripped', label: 'Stripped' },
  { value: 'standard', label: 'Standard' },
  { value: 'reinforced', label: 'Reinforced' }
]

/**
 * Default values for various game mechanics
 */
export const DEFAULTS = {
  ARMOR_VALUE: 0,
  STRUCTURE_VALUE: 0,
  MOTIVE_SLOT_MODIFIER: 0,
  TONNAGE: {
    SUPPORT_ASSET: 10
  }
}

/**
 * Structure damage threshold percentages
 * These define at what percentage of structure damage different penalties apply
 */
export const STRUCTURE_THRESHOLDS = {
  DAMAGE_25_PERCENT: 0.25, // Move/Jump Orders -1
  DAMAGE_50_PERCENT: 0.5,  // Weapon Damage -1 (min 1)
  DAMAGE_75_PERCENT: 0.75  // Only 1 Order per activation
}

/**
 * UI related constants
 */
export const UI = {
  BUBBLE_SIZE: 9, // Size in pixels for defense/armor bubbles
  ROSTER_VERSION: '1.0'
}
