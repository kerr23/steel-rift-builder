import { expect, it, describe } from 'vitest'
import { hasUpgradeById, hasJumpJets } from '../upgradeUtils.js'

describe('upgradeUtils', () => {
  it('hasUpgradeById returns true for string ids', () => {
    const ups = ['u1', 'u6', 'u9']
    expect(hasUpgradeById(ups, 'u6')).toBe(true)
    expect(hasUpgradeById(ups, 'u3')).toBe(false)
  })

  it('hasUpgradeById returns true for object entries', () => {
    const ups = [{ id: 'u2' }, { id: 'u6', name: 'Jump Jets' }]
    expect(hasUpgradeById(ups, 'u6')).toBe(true)
    expect(hasUpgradeById(ups, 'u1')).toBe(false)
  })

  it('hasJumpJets respects explicit unit.hasJumpJets', () => {
    const ups = []
    expect(hasJumpJets(ups, { hasJumpJets: true })).toBe(true)
    expect(hasJumpJets(ups, {})).toBe(false)
  })

  it('hasJumpJets returns true for selectedUpgrades containing u6 (string or object)', () => {
    expect(hasJumpJets(['u6'], {})).toBe(true)
    expect(hasJumpJets([{ id: 'u6' }], {})).toBe(true)
  })

  it('hasJumpJets returns false when no jump upgrade present', () => {
    expect(hasJumpJets(['u1', 'u2'], {})).toBe(false)
    expect(hasJumpJets([{ id: 'u3' }], {})).toBe(false)
  })
})
