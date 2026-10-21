import { describe, it, expect } from 'vitest'
import { generatePrintHtml } from '../printUtils.js'
import { escapeHtml, escapeDetailHtml, escapeRosterData } from '../utils/escapeHtml.js'

const PAYLOAD = '<img src=x onerror=alert(1)>'

const mockGameRules = { traitDefinitions: {}, weapons: [] }

const printOptions = (roster, rosterName) => ({
  roster,
  rosterName,
  totalRosterBaseTonnage: 20,
  getBaseTonnage: () => 20,
  generateBubbleHtml: () => '',
  formatPrintTrait: () => '',
  gameRulesData: mockGameRules
})

describe('escapeHtml', () => {
  it('escapes HTML text-content characters', () => {
    expect(escapeHtml(`<a href="x">&</a> 6"`)).toBe('&lt;a href="x"&gt;&amp;&lt;/a&gt; 6"')
  })
})

describe('escapeDetailHtml', () => {
  it('preserves bare strong/u tags and escapes everything else', () => {
    expect(escapeDetailHtml(`<u><strong>Bunker 1</strong></u> ${PAYLOAD}`)).toBe(
      '<u><strong>Bunker 1</strong></u> &lt;img src=x onerror=alert(1)&gt;'
    )
  })

  it('escapes strong tags carrying attributes', () => {
    expect(escapeDetailHtml('<strong onclick=alert(1)>x</strong>')).toBe('&lt;strong onclick=alert(1)&gt;x</strong>')
  })
})

describe('escapeRosterData', () => {
  it('escapes nested strings without mutating input', () => {
    const unit = { unitName: PAYLOAD, selectedWeapons: [{ name: PAYLOAD, id: 1 }], armor: 6 }
    const escaped = escapeRosterData(unit)
    expect(escaped.unitName).not.toContain('<')
    expect(escaped.selectedWeapons[0].name).not.toContain('<')
    expect(escaped.armor).toBe(6)
    expect(unit.unitName).toBe(PAYLOAD)
  })

  it('drops __proto__ keys from parsed JSON', () => {
    const escaped = escapeRosterData(JSON.parse('{"__proto__": {"polluted": true}}'))
    expect(escaped.polluted).toBeUndefined()
  })
})

describe('generatePrintHtml escaping', () => {
  it('escapes unit and roster names', () => {
    const unit = {
      unitName: PAYLOAD,
      selectedClass: { name: 'Light', defenseRoll: '3+' },
      selectedMotiveType: { name: PAYLOAD },
      selectedWeapons: [],
      selectedUpgrades: [],
      armorBaseValue: 6,
      structureBaseValue: 4
    }
    const html = generatePrintHtml(printOptions([unit], `</title>${PAYLOAD}`))
    expect(html).not.toContain(PAYLOAD)
    expect(html).not.toContain('</title><img')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('escapes injected markup in support asset details', () => {
    const asset = {
      isSupportAsset: true,
      type: 'Off-Table Support',
      unitName: 'Asset',
      details: ['<strong>Damage:</strong> 4', `<strong>Traits:</strong> ${PAYLOAD}`],
      totalUnitTonnage: 10,
      id: 1
    }
    const html = generatePrintHtml(printOptions([asset], 'Roster'))
    expect(html).not.toContain(PAYLOAD)
  })
})
