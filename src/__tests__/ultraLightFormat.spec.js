import { describe, it, expect } from 'vitest';
import { generatePrintHtml } from '../printUtils.js';

// Minimal mock for generateBubbleHtml
function generateBubbleHtml(count, isStructure) {
  if (!count || count <= 0) return '<span class="placeholder-text-inline italic text-text-muted text-xs pl-1">N/A</span>';
  let html = '';
  for (let n = 1; n <= count; n++) {
    html += `<span class="bubble"${isStructure ? ' data-struct="1"' : ''}></span>`;
  }
  return html;
}

// Format trait function
function formatPrintTrait(traitName) {
  return `${traitName}: Description for ${traitName}`;
}

describe('Ultra-Light Vehicle Squadron Formatting', () => {
  it('correctly organizes ULV squadrons by type with nested containers', () => {
    // Test data with multiple ULVs of the same type
    const ulvSquadron = {
      type: 'Ultra-Light Vehicle Squadron',
      isSupportAsset: true,
      details: [
        '<u>Engineering ULV</u>',
        '<strong>Speed:</strong> 6"',
        '<strong>Armor:</strong> 3',
        '<strong>Weapon Systems:</strong> Light Machine Gun',
        '<strong>Traits:</strong> Utility',

        '<u>Engineering ULV</u>',
        '<strong>Speed:</strong> 6"',
        '<strong>Armor:</strong> 3',
        '<strong>Weapon Systems:</strong> Light Machine Gun',
        '<strong>Traits:</strong> Utility',

        '<u>Scout ULV</u>',
        '<strong>Speed:</strong> 8"',
        '<strong>Armor:</strong> 2',
        '<strong>Weapon Systems:</strong> Micro Missile Pod',
        '<strong>Traits:</strong> Scanner'
      ],
      totalUnitTonnage: 10
    };

    const mockGameRules = {
      traitDefinitions: {
        'Utility': 'Provides engineering support',
        'Scanner': 'Provides enhanced scanning capabilities'
      },
      UL_HEV_WEAPONS: [
        {
          name: 'Light Machine Gun',
          damage: 2,
          range: 12,
          traits: []
        },
        {
          name: 'Micro Missile Pod',
          damage: 3,
          range: 18,
          traits: ['Limited(1)']
        }
      ]
    };

    const html = generatePrintHtml({
      roster: [ulvSquadron],
      rosterName: 'Test Squad',
      totalRosterBaseTonnage: 10,
      getBaseTonnage: () => 10,
      generateBubbleHtml,
      formatPrintTrait,
      gameRulesData: mockGameRules
    });

    // Verify the nested container structure
    expect(html).toContain('ulv-types-container');
    expect(html).toContain('ulv-type-container');
    expect(html).toContain('ulv-type-header');
    expect(html).toContain('ulv-instances-container');
    expect(html).toContain('ultra-light-card');

    // Verify Engineering ULV type is shown in the output
    expect(html).toContain('Engineering ULV');

    // Verify Scout ULV is found
    expect(html).toContain('Scout ULV');

    // Verify type-specific traits and speed are shown
    expect(html).toContain('<strong>Speed:</strong> 6"');
    expect(html).toContain('<strong>Speed:</strong> 8"');
    expect(html).toContain('<strong>Traits:</strong> Utility');
    expect(html).toContain('<strong>Traits:</strong> Scanner');

    // Verify weapon systems are shown
    expect(html).toContain('Light Machine Gun');
    expect(html).toContain('Micro Missile Pod');
  });
});
