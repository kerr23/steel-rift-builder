/* eslint-env jest */
import { gameData, getMaxDieStep, findClassByName, findWeaponById, findUpgradeById } from '../gameData.js'

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

  it('gets the max die step', () => {
    expect(getMaxDieStep()).toBeGreaterThan(0)
  })
})
