import { describe, it, expect } from 'vitest';
import { generateHevHtml } from '../components/print/HevPrintable.js';
import { generateSupportAssetHtml } from '../components/print/SupportAssetPrintable.js';
import { generateUltraLightSquadronHtml } from '../components/print/UltraLightSquadronPrintable.js';
import { generateInfantryOutpostHtml } from '../components/print/InfantryOutpostPrintable.js';
import { generatePrintHtml } from '../services/printService.js';

// Minimal mock for generateBubbleHtml
function generateBubbleHtml(count, isStructure) {
  if (!count || count <= 0) return '<span class="placeholder-text-inline italic text-text-muted text-xs pl-1">N/A</span>';
  let html = '';
  for (let n = 1; n <= count; n++) {
    html += `<span class="bubble"${isStructure ? ' data-struct="1"' : ''}></span>`;
  }
  return html;
}

const mockGameRules = {
  traitDefinitions: {
    'AP1': 'Armor Piercing 1: Reduce the target\'s Armor by 1',
    'Infantry': 'Infantry can enter buildings and difficult terrain',
    'Limited': 'This weapon has limited ammunition',
    'Sustained Fire': 'Can fire multiple shots'
  },
  weapons: [],
  UL_HEV_WEAPONS: [
    {
      id: 'ul-melee',
      name: 'UL Melee Weapons',
      damage: '3',
      range: 'Melee',
      traits: ['Melee']
    },
    {
      id: 'ul-incinerator',
      name: 'UL Incinerators',
      damage: '2',
      range: '12"',
      traits: ['Blast(2")', 'Limited(2)']
    }
  ],
  UL_HEV_UPGRADE_PODS: [
    {
      id: 'pod1',
      name: 'Test Pod',
      damage: '3',
      range: '12"',
      traits: ['Limited(2)', 'Blast(3")'],
      description: 'Test pod description'
    }
  ]
};

const baseHevUnit = {
  unitName: 'Test HE-V',
  selectedClass: { name: 'Light', defenseRoll: '3+' },
  selectedMotiveType: { name: 'Biped' },
  selectedWeapons: [],
  selectedUpgrades: [],
  armorBaseValue: 6,
  structureBaseValue: 4,
};

describe('Print Components', () => {
  describe('HevPrintable', () => {
    it('renders HE-V unit correctly', () => {
      const html = generateHevHtml(
        baseHevUnit,
        'Test Roster',
        20,
        () => 20,
        generateBubbleHtml,
        () => '',
        mockGameRules
      );

      // Check basic structure
      expect(html).toContain('Test HE-V');
      expect(html).toContain('Light');
      expect(html).toContain('Biped');
      expect(html).toContain('Defense:');
      expect(html).toContain('3+');

      // Check for armor and structure
      expect(html).toContain('Armor:');
      expect(html).toContain('Structure:');

      // Count bubbles
      const armorBubbles = (html.match(/<span class="bubble"/g) || []).length;
      expect(armorBubbles).toBe(10); // 6 armor + 4 structure
    });

    it('displays jump value when jump jets are equipped', () => {
      const hevWithJumpJets = {
        ...baseHevUnit,
        selectedClass: { name: 'Light', defenseRoll: '3+', baseMovement: 8 },
        selectedUpgrades: [{ id: 'u6', name: 'Jump Jets' }]
      };

      const html = generateHevHtml(
        hevWithJumpJets,
        'Test Roster',
        20,
        () => 20,
        generateBubbleHtml,
        () => '',
        mockGameRules
      );

      // Check that jump value is displayed on the same line as movement
      expect(html).toContain('<strong>Movement:</strong> 8" / 6" (Jump)');
    });

    it('displays jump value when selectedUpgrades contains string id "u6"', () => {
      const hevWithStringUpgradeId = {
        ...baseHevUnit,
        selectedClass: { name: 'Light', defenseRoll: '3+', baseMovement: 8 },
        selectedUpgrades: ['u6']
      };

      const html = generateHevHtml(
        hevWithStringUpgradeId,
        'Test Roster',
        20,
        () => 20,
        generateBubbleHtml,
        () => '',
        mockGameRules
      );

      expect(html).toContain('<strong>Movement:</strong> 8" / 6" (Jump)');
    });

    it('does not display jump value when no jump jets equipped', () => {
      const html = generateHevHtml(
        baseHevUnit,
        'Test Roster',
        20,
        () => 20,
        generateBubbleHtml,
        () => '',
        mockGameRules
      );

      // Check that jump value is not displayed and movement is shown normally
      expect(html).not.toContain('/ ');
      expect(html).not.toContain('(Jump)');
      expect(html).toContain('<strong>Movement:</strong>');
    });
  });

  describe('SupportAssetPrintable', () => {
    it('renders weapon system support asset correctly', () => {
      const weaponAsset = {
        type: 'Anti-Tank Gun',
        isSupportAsset: true,
        details: [
          '<u>Anti-Tank Gun</u>',
          '<strong>Damage:</strong> 5',
          '<strong>Range:</strong> 48"',
          '<strong>Traits:</strong> AP2, Limited(3)'
        ]
      };

      const html = generateSupportAssetHtml(
        weaponAsset,
        'Test Roster',
        20,
        generateBubbleHtml,
        () => '',
        mockGameRules
      );

      expect(html).toContain('Anti-Tank Gun');
      expect(html).toContain('5'); // Damage value
      expect(html).toContain('48"'); // Range value
      expect(html).toContain('AP2');
      expect(html).toContain('AP2');
      expect(html).toContain('Limited');
    });
  });

  describe('UltraLightSquadronPrintable', () => {
    it('renders Ultra-Light Squadron correctly', () => {
      const squadronUnit = {
        isSupportAsset: true,
        type: 'Test Squadron',
        upgradePodId: 'pod1',
        details: [
          '<u>Brawler</u>',
          '<strong>Speed:</strong> 7"',
          '<strong>Armor:</strong> 3',
          '<strong>Weapon Systems:</strong> UL Melee Weapons',
          '<strong>Traits:</strong> Magnetic Grapnels',
          '<u>Pyro</u>',
          '<strong>Speed:</strong> 6"',
          '<strong>Armor:</strong> 4',
          '<strong>Weapon Systems:</strong> UL Incinerators',
          '<strong>Traits:</strong> Inferno Gear',
          '<strong>Tonnage:</strong> 10T'
        ]
      };

      const html = generateUltraLightSquadronHtml(
        squadronUnit,
        'Test Roster',
        20,
        generateBubbleHtml,
        mockGameRules
      );

      expect(html).toContain('Test Squadron');
      expect(html).toContain('Brawler');
      expect(html).toContain('Pyro');
      expect(html).toContain('UL Melee Weapons');
      expect(html).toContain('UL Incinerators');
      expect(html).toContain('Squadron Upgrade Pod');
    });
  });

  describe('InfantryOutpostPrintable', () => {
    it('renders Infantry Outpost correctly', () => {
      const outpostUnit = {
        type: 'Infantry Outpost',
        isSupportAsset: true,
        details: [
          '<u><strong>Bunker 1</strong></u>',
          '<u>Autocannon</u>',
          '<strong>Damage:</strong> 3',
          '<strong>Range:</strong> 36"',
          '<strong>Traits:</strong> Sustained Fire',
          '<u>2x Rifle Squad</u>',
          '<strong>Speed:</strong> 6"',
          '<strong>Traits:</strong> Infantry',
          '<strong>UNIT_START:</strong>',
          '<strong>Structure:</strong> 2',
          '<strong>WEAPON:</strong> Combat Rifle | 2 | 24" | AP1',
          '<strong>UNIT_END</strong>',
          '<strong>UNIT_START:</strong>',
          '<strong>Structure:</strong> 2',
          '<strong>WEAPON:</strong> Combat Rifle | 2 | 24" | AP1',
          '<strong>UNIT_END</strong>'
        ]
      };

      const html = generateInfantryOutpostHtml(
        outpostUnit,
        'Test Roster',
        20,
        generateBubbleHtml,
        mockGameRules
      );

      expect(html).toContain('Infantry Outpost');
      expect(html).toContain('Bunker 1');
      expect(html).toContain('Autocannon');
      expect(html).toContain('Combat Rifle');
      expect(html).toContain('AP1');
    });
  });

  describe('Full Print Service Integration', () => {
    it('generates complete roster HTML with different unit types', () => {
      const roster = [
        baseHevUnit,
        {
          type: 'Anti-Tank Gun',
          isSupportAsset: true,
          details: [
            '<u>Anti-Tank Gun</u>',
            '<strong>Damage:</strong> 5',
            '<strong>Range:</strong> 48"',
            '<strong>Traits:</strong> AP2, Limited(3)'
          ]
        }
      ];

      const html = generatePrintHtml({
        roster,
        rosterName: 'Test Roster',
        totalRosterBaseTonnage: 30,
        getBaseTonnage: () => 20,
        generateBubbleHtml,
        formatPrintTrait: () => '',
        gameRulesData: mockGameRules
      });

      expect(html).toContain('Test HE-V');
      expect(html).toContain('Anti-Tank Gun');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Print this page');
    });
  });
});
