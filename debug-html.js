// Check HTML output
import { generatePrintHtml } from './src/printUtils.js';

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

// Output HTML for inspection
console.log(html);

// Check for required classes
console.log("Contains 'ulv-types-container':", html.includes('ulv-types-container'));
console.log("Contains 'ulv-type-container':", html.includes('ulv-type-container'));
console.log("Contains 'ulv-type-header':", html.includes('ulv-type-header'));
console.log("Contains 'ulv-instances-container':", html.includes('ulv-instances-container'));
console.log("Contains 'ultra-light-card':", html.includes('ultra-light-card'));
