import { describe, it, expect } from 'vitest'
import { validateHEV, validateSupportAsset, validateRoster } from '../unitValidation.js'

describe('Unit Validation Service', () => {
  describe('validateHEV', () => {
    it('returns valid for complete HEV data', () => {
      const hevData = {
        unitName: 'Test HEV',
        selectedClass: { name: 'Light', baseSlots: 3, baseTonnage: 20 },
        selectedMotiveType: { name: 'Legs', slotModifier: 1 },
        selectedWeapons: [{ name: 'Laser', slots: 1 }],
        selectedUpgrades: [{ name: 'Targeting System', slots: 1 }]
      };

      const result = validateHEV(hevData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('returns errors for missing required fields', () => {
      const hevData = {
        unitName: '',
        selectedWeapons: [],
        selectedUpgrades: []
      };

      const result = validateHEV(hevData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unit name is required');
      expect(result.errors).toContain('Chassis class is required');
      expect(result.errors).toContain('Motive system is required');
    });

    it('validates slot capacity', () => {
      const hevData = {
        unitName: 'Overslotted HEV',
        selectedClass: { name: 'Light', baseSlots: 3, baseTonnage: 20 },
        selectedMotiveType: { name: 'Legs', slotModifier: 1 },
        selectedWeapons: [
          { name: 'Laser', slots: 2 },
          { name: 'Missile', slots: 2 }
        ],
        selectedUpgrades: [{ name: 'Targeting System', slots: 1 }]
      };

      const result = validateHEV(hevData);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Exceeded maximum slot capacity');
    });
  });

  describe('validateSupportAsset', () => {
    it('returns valid for complete support asset data', () => {
      const assetData = {
        assetName: 'Infantry Squad',
        assetType: { id: 'infantry', name: 'Infantry' },
        infantryType: 'Rifle'
      };

      const result = validateSupportAsset(assetData);
      expect(result.isValid).toBe(true);
    });

    it('returns errors for missing required fields', () => {
      const assetData = {
        assetName: '',
        assetType: null
      };

      const result = validateSupportAsset(assetData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Asset name is required');
      expect(result.errors).toContain('Asset type is required');
    });

    it('validates infantry-specific requirements', () => {
      const assetData = {
        assetName: 'Infantry Squad',
        assetType: { id: 'infantry', name: 'Infantry' },
        infantryType: null
      };

      const result = validateSupportAsset(assetData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Infantry type is required for infantry assets');
    });
  });

  describe('validateRoster', () => {
    const rules = {
      minTonnage: 100,
      minHEVCount: 2
    };

    it('validates a legal roster', () => {
      const roster = [
        {
          selectedClass: { baseTonnage: 60 },
          isSupportAsset: false
        },
        {
          selectedClass: { baseTonnage: 40 },
          isSupportAsset: false
        },
        {
          isSupportAsset: true,
          totalUnitTonnage: 10
        }
      ];

      const result = validateRoster(roster, rules);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('warns about low tonnage', () => {
      const roster = [
        {
          selectedClass: { baseTonnage: 40 },
          isSupportAsset: false
        },
        {
          selectedClass: { baseTonnage: 40 },
          isSupportAsset: false
        }
      ];

      const result = validateRoster(roster, rules);
      expect(result.isValid).toBe(true);
      expect(result.warnings[0]).toContain('below minimum tonnage');
    });

    it('errors on insufficient HEV count', () => {
      const roster = [
        {
          selectedClass: { baseTonnage: 60 },
          isSupportAsset: false
        },
        {
          isSupportAsset: true,
          totalUnitTonnage: 50
        }
      ];

      const result = validateRoster(roster, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Not enough HE-V units');
    });

    it('errors on empty roster', () => {
      const result = validateRoster([], rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Roster is empty');
    });
  });
});
