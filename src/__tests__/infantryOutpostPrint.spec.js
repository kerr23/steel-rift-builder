import { describe, it, expect } from 'vitest'
import { generatePrintHtml } from '../printUtils'

describe('Infantry Outpost Print Format', () => {
  it('renders Infantry Outpost in a compact layout', () => {
    // Create mock bunker details
    const mockBunkerDetails = [
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

    // Create mock Infantry Outpost unit
    const mockOutpost = {
      type: 'Infantry Outpost',
      details: mockBunkerDetails,
      isSupportAsset: true
    }

    // Set up mock game rules data
    const mockGameRules = {
      traitDefinitions: {
        'AP1': 'Armor Piercing 1: Reduce the target\'s Armor by 1',
        'Infantry': 'Infantry can enter buildings and difficult terrain',
        'Sustained Fire': 'Can fire multiple shots'
      }
    }

    // Generate HTML
    const html = generatePrintHtml({
      roster: [mockOutpost],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 10,
      generateBubbleHtml: (count) => `<span>${'●'.repeat(count)}</span>`,
      formatPrintTrait: (trait) => trait,
      gameRulesData: mockGameRules
    })

    // Check that infantry outpost is rendered
    expect(html).toContain('Infantry Outpost')

    // Check for bunker section
    expect(html).toContain('Bunker 1')
    expect(html).toContain('Autocannon')

    // Check for infantry units
    expect(html).toContain('Rifle Squad')
    expect(html).toContain('Unit 1')
    expect(html).toContain('Unit 2')

    // Check for weapon display
    expect(html).toContain('Combat Rifle')

    // Check for traits section
    expect(html).toContain('Trait Definitions')
    expect(html).toContain('AP1:')
    expect(html).toContain('Infantry:')
    expect(html).toContain('Sustained Fire:')

    // Check for bunker-container class that makes it compact
    expect(html).toContain('bunker-container')

    // Check for compacted infantry layout with grid
    expect(html).toContain('infantry-units-grid')
  })

  it('renders Limited weapon traits as bubbles in infantry outpost', () => {
    // Create mock bunker details with Limited weapon traits
    const mockBunkerDetails = [
      '<u><strong>Bunker 1</strong></u>',
      '<u>Missile Launcher</u>',
      '<strong>Damage:</strong> 4',
      '<strong>Range:</strong> 48"',
      '<strong>Traits:</strong> Limited(3), Blast(2")',
      '<u>1x Anti-Tank Squad</u>',
      '<strong>Speed:</strong> 5"',
      '<strong>Traits:</strong> Infantry',
      '<strong>UNIT_START:</strong>',
      '<strong>Structure:</strong> 2',
      '<strong>WEAPON:</strong> Anti-Tank Launcher | 3 | 36" | AP2, Limited(2)',
      '<strong>UNIT_END</strong>'
    ]

    // Create mock Infantry Outpost unit
    const mockOutpost = {
      type: 'Infantry Outpost',
      details: mockBunkerDetails,
      isSupportAsset: true
    }

    // Set up mock game rules data
    const mockGameRules = {
      traitDefinitions: {
        'AP2': 'Armor Piercing 2: Reduce the target\'s Armor by 2',
        'Infantry': 'Infantry can enter buildings and difficult terrain',
        'Limited': 'This weapon system has a limited number of uses per battle (represented by bubbles).',
        'Blast': 'Area-of-effect attack that affects all units in the specified radius.'
      }
    }

    // Generate HTML
    const html = generatePrintHtml({
      roster: [mockOutpost],
      rosterName: 'Test Roster',
      totalRosterBaseTonnage: 10,
      generateBubbleHtml: (count) => `<span>${'●'.repeat(count)}</span>`,
      formatPrintTrait: (trait) => trait,
      gameRulesData: mockGameRules
    })

    // Check for Limited trait with bubbles in the main bunker weapon
    expect(html).toContain('Limited(<span class="print-trait-bubble"></span><span class="print-trait-bubble"></span><span class="print-trait-bubble"></span>)')

    // Check for Limited trait with bubbles in infantry weapon
    expect(html).toContain('Limited(<span class="print-trait-bubble"></span><span class="print-trait-bubble"></span>)')
  })
})
