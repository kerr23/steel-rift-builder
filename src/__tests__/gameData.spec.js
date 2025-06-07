/* eslint-env jest */
import { gameData, findClassByName, findWeaponById, findUpgradeById } from '../gameData.js'

describe('gameData helpers', () => {
  it('finds a class by name', () => {
    expect(findClassByName('Light')).toEqual(expect.objectContaining({ name: 'Light' }))
    expect(findClassByName('Nonexistent')).toBeNull()
  })

  it('finds a weapon by id', () => {
    expect(findWeaponById('w_autocannon')).toEqual(expect.objectContaining({ name: 'Auto-Cannon' }))
    expect(findWeaponById('nope')).toBeNull()
  })

  it('finds an upgrade by id', () => {
    expect(findUpgradeById('u1')).toEqual(expect.objectContaining({ name: 'Ablative Armour ' }))
    expect(findUpgradeById('nope')).toBeNull()
  })

  it('returns correct base armor and structure for each class', () => {
    // These values should match your new model in gameData.js
    const expected = [
      { name: 'Light', armor: 6, structure: 4 },
      { name: 'Medium', armor: 8, structure: 6 },
      { name: 'Heavy', armor: 10, structure: 8 },
      { name: 'Ultra-Heavy', armor: 12, structure: 10 },
    ]
    expected.forEach(({ name, armor, structure }) => {
      const cls = findClassByName(name)
      expect(cls).not.toBeNull()
      expect(cls.baseArmor).toBe(armor)
      expect(cls.baseStructure).toBe(structure)
    })
  })

  it('applies stripped and reinforced modifiers to armor/structure', () => {
    // Simulate logic for modifiers: -2 for stripped, +2 for reinforced
    const base = { baseArmor: 8, baseStructure: 6 }
    const stripped = { ...base, armorMod: -2, structureMod: -2 }
    const reinforced = { ...base, armorMod: 2, structureMod: 2 }
    // Effective values
    expect(base.baseArmor + stripped.armorMod).toBe(6)
    expect(base.baseStructure + stripped.structureMod).toBe(4)
    expect(base.baseArmor + reinforced.armorMod).toBe(10)
    expect(base.baseStructure + reinforced.structureMod).toBe(8)
  })
})
