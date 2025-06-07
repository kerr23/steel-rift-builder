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
  });
});
