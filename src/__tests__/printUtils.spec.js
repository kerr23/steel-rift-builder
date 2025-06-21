import { describe, it, expect } from 'vitest'
import { generatePrintHtml, generateStructureBubbleHtml } from '../printUtils.js'

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
  traitDefinitions: {},
  weapons: [],
}

const baseUnit = {
  unitName: 'Test HE-V',
  selectedClass: { name: 'Light', defenseRoll: '3+' },
  selectedMotiveType: { name: 'Biped' },
  selectedWeapons: [],
  selectedUpgrades: [],
  armorBaseValue: 6,
  structureBaseValue: 4,
}

// Helper to extract the entire row's HTML for armor and structure
function extractRowHtml(html, label) {
  // Find the relevant row (armor-row or structure-row)
  const rowRegex = new RegExp(`<div[^>]*class=["'][^"']*print-defense-row[^"']*${label}-row[^"']*["'][^>]*>([\\s\\S]*?)</div>`, 'i');
  const match = html.match(rowRegex);
  if (!match) {
    console.error(`Could not find ${label} row. HTML:\n`, html);
    throw new Error(`Could not find ${label} row in generated HTML`);
  }
  return match[1];
}

describe('generatePrintHtml', () => {
  it('renders correct number of armor bubbles', () => {
    const html = generatePrintHtml({
      roster: [baseUnit],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 20,
      getBaseTonnage: () => 20,
      generateBubbleHtml,
      generateStructureBubbleHtml,
      formatPrintTrait: () => '',
      gameRulesData: mockGameRules,
    });
    const armorRowHtml = extractRowHtml(html, 'armor');
    console.log('ARMOR ROW HTML:', armorRowHtml);
    const armorMatch = armorRowHtml.match(/<span[^>]*class=["'][^"']*\bbubble\b(?!-display)[^"']*["'][^>]*>/gi);
    expect(armorMatch?.length).toBe(6);
  });

  it('renders correct number of structure bubbles', () => {
    const html = generatePrintHtml({
      roster: [{ ...baseUnit, structureBaseValue: 5 }],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 20,
      getBaseTonnage: () => 20,
      generateBubbleHtml,
      generateStructureBubbleHtml,
      formatPrintTrait: () => '',
      gameRulesData: mockGameRules,
    });
    const structRowHtml = extractRowHtml(html, 'structure');
    console.log('STRUCTURE ROW HTML:', structRowHtml);
    const structMatch = structRowHtml.match(/<span[^>]*class=["'][^"']*\bbubble\b(?!-display)[^"']*["'][^>]*>/gi);
    expect(structMatch?.length).toBe(5);
  });

  it('renders N/A for zero armor/structure', () => {
    const html = generatePrintHtml({
      roster: [{ ...baseUnit, armorBaseValue: 0, structureBaseValue: 0 }],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 20,
      getBaseTonnage: () => 20,
      generateBubbleHtml,
      generateStructureBubbleHtml,
      formatPrintTrait: () => '',
      gameRulesData: mockGameRules,
    });
    expect(html).toContain('N/A');
  });  it('renders correct armor bubbles for Ultra-Light HE-V squadrons', () => {
    const squadronUnit = {
      isSupportAsset: true,
      type: 'Test Squadron',
      upgradePodId: 'pod1',
      details: [
        '<u>Brawler</u>',
        '<strong>Speed:</strong> 7"',
        '<strong>Armor:</strong> 3',
        '<strong>Weapon Systems:</strong> UL Melee Weapons, Submunitions',
        '<strong>Traits:</strong> Magnetic Grapnels',
        '<u>Pyro</u>',
        '<strong>Speed:</strong> 6"',
        '<strong>Armor:</strong> 4', // Different armor value for testing
        '<strong>Weapon Systems:</strong> UL Incenerators, Submunitions',
        '<strong>Traits:</strong> Inferno Gear',
        '<u>Commando</u>',
        '<strong>Speed:</strong> 7"',
        '<strong>Armor:</strong> 2', // Different armor value for testing
        '<strong>Weapon Systems:</strong> Submunitions',
        '<strong>Traits:</strong> Scramblers, Target Designator',
        '<strong>Tonnage:</strong> 10T'
      ]
    };

    const mockRules = {
      ...mockGameRules,
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

    const html = generatePrintHtml({
      roster: [squadronUnit],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 20,
      getBaseTonnage: () => 20,
      generateBubbleHtml,
      generateStructureBubbleHtml,
      formatPrintTrait: () => '',
      gameRulesData: mockRules,
    });

    // Let's just check that the html contains the correct number of bubbles in total
    const allBubbles = html.match(/<span class="bubble"><\/span>/g) || [];

    // We should have 9 bubbles in total (3 + 4 + 2 from the three HE-Vs)
    expect(allBubbles.length).toBe(9);

    // Check that we have the right HE-V names
    expect(html).toContain('Brawler');
    expect(html).toContain('Pyro');
    expect(html).toContain('Commando');

    // Check for the correct HE-V types and armor values
    // First check that we have all the ULV types in the HTML
    expect(html).toContain('Brawler');
    expect(html).toContain('Pyro');
    expect(html).toContain('Commando');

    // Then check that we have the expected number of armor bubbles in the HTML
    // Since we're using a different structure now, we'll count the bubbles directly
    const bubbles = html.match(/<span class="bubble"><\/span>/g) || [];
    expect(bubbles.length).toBe(9); // 3 for Brawler + 4 for Pyro + 2 for Commando

    // Check that we have the correct ULV card class used
    expect(html).toContain('ultra-light-card');

    // Verify there's no structure row
    const structMatch = html.match(/<div[^>]*class=["'][^"']*structure-row[^"']*["'][^>]*>/gi);
    expect(structMatch).toBeNull();
  });

  it('renders weapon information for Ultra-Light HE-V squadrons', () => {
    const squadronUnit = {
      isSupportAsset: true,
      type: 'Ultra-Light HE-V Squadron',
      upgradePodId: 'pod1',
      details: [
        '<u>Brawler</u>',
        '<strong>Speed:</strong> 7"',
        '<strong>Armor:</strong> 3',
        '<strong>Weapon Systems:</strong> UL Melee Weapons, Submunitions',
        '<strong>Traits:</strong> Magnetic Grapnels',
        '<u>Pyro</u>',
        '<strong>Speed:</strong> 6"',
        '<strong>Armor:</strong> 4',
        '<strong>Weapon Systems:</strong> UL Incinerators, Submunitions',
        '<strong>Traits:</strong> Inferno Gear',
        '<u>Unknown</u>',
        '<strong>Speed:</strong> 8"',
        '<strong>Armor:</strong> 3',
        '<strong>Weapon Systems:</strong> Unknown Weapon',
        '<strong>Traits:</strong> Stealth',
        '<strong>Tonnage:</strong> 10T'
      ]
    };

    const mockRules = {
      ...mockGameRules,
      UL_HEV_WEAPONS: [
        {
          id: 'ul-melee',
          name: 'UL Melee Weapons',
          damage: 'N/A',
          range: 'N/A',
          traits: ['Melee (X)', 'AP1 x (X)']
        },
        {
          id: 'submunitions',
          name: 'Submunitions',
          damage: '1 x (X)',
          range: '6"',
          traits: ['Flak']
        },
        {
          id: 'ul-incinerators',
          name: 'UL Incinerators',
          damage: '4 x (X)',
          range: '4',
          traits: ['Disruptive', 'Light']
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
      ],
      traitDefinitions: {
        'Melee': 'Combat at close range',
        'AP1': 'Armor Piercing 1',
        'Flak': 'Anti-air capability',
        'Disruptive': 'Disrupts electronics',
        'Light': 'Reduced weight'
      }
    };

    const html = generatePrintHtml({
      roster: [squadronUnit],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 20,
      getBaseTonnage: () => 20,
      generateBubbleHtml,
      generateStructureBubbleHtml,
      formatPrintTrait: (trait) => typeof trait === 'string' ? trait : trait.name,
      gameRulesData: mockRules,
    });

    // Check that weapon tables exist for each HE-V
    expect(html).toContain('UL Melee Weapons');
    expect(html).toContain('Submunitions');
    expect(html).toContain('UL Incinerators');

    // Check that weapon traits are displayed
    expect(html).toContain('Melee (X), AP1 x (X)');
    expect(html).toContain('Flak');
    expect(html).toContain('Disruptive, Light');

    // Just check that the weapons table has the right content
    expect(html).toContain('UL Melee Weapons');
    expect(html).toContain('Submunitions');
    expect(html).toContain('UL Incinerators');
    expect(html).toContain('Disruptive, Light');
  });
});
