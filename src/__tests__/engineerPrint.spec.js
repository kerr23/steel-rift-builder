// Test file for Engineer squad rendering
import { describe, it, expect } from 'vitest';
import { generateInfantryOutpostHtml } from '../components/print/InfantryOutpostPrintable.js';

describe('Infantry Outpost Engineer Print Format', () => {
  it('renders Engineers in an infantry outpost correctly', () => {
    // Create mock infantry details for an outpost with various infantry types
    const mockOutpostDetails = [
      '<u><strong>Bunker 1</strong></u>',
      '<u>2x Engineer</u>',
      '<strong>Speed:</strong> 4"',
      '<strong>Traits:</strong> Repair',
      '<strong>UNIT_START:</strong>',
      '<strong>Structure:</strong> 1',
      '<strong>WEAPON:</strong> Rifle | 1 | 12" | ',
      '<strong>WEAPON:</strong> Repair Kit | Special | 1" | Repair(1)',
      '<strong>UNIT_END</strong>',
      '<strong>UNIT_START:</strong>',
      '<strong>Structure:</strong> 1',
      '<strong>WEAPON:</strong> Rifle | 1 | 12" | ',
      '<strong>WEAPON:</strong> Repair Kit | Special | 1" | Repair(1)',
      '<strong>UNIT_END</strong>',
      '<u><strong>Bunker 2</strong></u>',
      '<u>1x Rifle Squad</u>',
      '<strong>Speed:</strong> 4"',
      '<strong>Traits:</strong> ',
      '<strong>UNIT_START:</strong>',
      '<strong>Structure:</strong> 1',
      '<strong>WEAPON:</strong> Rifle | 1 | 12" | ',
      '<strong>UNIT_END</strong>',
      '<u>1x Command Team</u>',
      '<strong>Speed:</strong> 4"',
      '<strong>Traits:</strong> Command(1)',
      '<strong>UNIT_START:</strong>',
      '<strong>Structure:</strong> 2',
      '<strong>WEAPON:</strong> Pistol | 1 | 6" | ',
      '<strong>WEAPON:</strong> Radio | - | - | Command(1)',
      '<strong>UNIT_END</strong>',
      '<u>1x Specialist Infantry</u>',
      '<strong>Speed:</strong> 4"',
      '<strong>Traits:</strong> Stealth',
      '<strong>UNIT_START:</strong>',
      '<strong>Structure:</strong> 1',
      '<strong>WEAPON:</strong> Sniper Rifle | 2 | 24" | Accurate',
      '<strong>UNIT_END</strong>'
    ];

    // Create mock Infantry Outpost unit
    const mockOutpost = {
      type: 'Infantry Outpost',
      details: mockOutpostDetails
    };

    // Set up mock game rules data
    const mockGameRules = {
      traitDefinitions: {
        'Repair': 'Units with this trait can repair damaged equipment.'
      }
    };

    // Generate HTML
    const html = generateInfantryOutpostHtml(
      mockOutpost,
      'Test Roster',
      10,
      (count) => `<span>${'●'.repeat(count)}</span>`,
      mockGameRules
    );

    // Check if all infantry types are rendered correctly
    expect(html).toContain('Engineer - Unit 1');
    expect(html).toContain('Engineer - Unit 2');
    expect(html).toContain('Repair Kit');
    expect(html).toContain('Repair(1)');
    expect(html).toContain('Rifle Squad - Unit 1');
    expect(html).toContain('Command Team - Unit 2');
    expect(html).toContain('Radio');
    expect(html).toContain('Command(1)');
    expect(html).toContain('Specialist Infantry - Unit 3');
    expect(html).toContain('Sniper Rifle');
    expect(html).toContain('Accurate');

    // Make sure Engineers have the same structure formatting as other infantry
    expect(html).toContain('<span class="infantry-structure"><strong>Structure:</strong> <span>●</span></span>');

    // Verify Engineer weapons are shown in a table like other infantry
    expect(html).toContain('<table class="print-weapon-table infantry-weapon-table">');
    expect(html).toContain('<th>Weapon</th>');
    expect(html).toContain('<th>Dmg</th>');
    expect(html).toContain('<th>Range</th>');
    expect(html).toContain('<th>Traits</th>');
  });
});
