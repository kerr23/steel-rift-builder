import { describe, it, expect } from 'vitest'
import { gameData, findWeaponById, findUpgradeById } from '../../gameData.js'
import { isWeaponAvailableForClass, isUpgradeAvailableForClass, filterWeaponsForClass, filterUpgradesForClass } from '../gameDataHelpers.js'

describe('gameDataHelpers - availability', () => {
  it('returns true for weapons that include the class key in tonnage', () => {
  const particle = findWeaponById('w_particle_cannon')
    expect(isWeaponAvailableForClass(particle, 'Light')).toBe(true)
    expect(isWeaponAvailableForClass(particle, 'Medium')).toBe(true)
    expect(isWeaponAvailableForClass(particle, 'Kaiju')).toBe(false)
  })

  it('handles Kaiju-only weapons', () => {
  const kaijuPunch = findWeaponById('w_kaiju_punch')
    expect(isWeaponAvailableForClass(kaijuPunch, 'Kaiju')).toBe(true)
    expect(isWeaponAvailableForClass(kaijuPunch, 'Light')).toBe(false)
  })

  it('returns true for upgrades that include the class key in tonnage', () => {
  const jump = findUpgradeById('u6')
    expect(isUpgradeAvailableForClass(jump, 'Light')).toBe(true)
    expect(isUpgradeAvailableForClass(jump, 'Kaiju')).toBe(false)

  const kaijuShell = findUpgradeById('u13')
    expect(isUpgradeAvailableForClass(kaijuShell, 'Kaiju')).toBe(true)
    expect(isUpgradeAvailableForClass(kaijuShell, 'Heavy')).toBe(false)
  })

  it('filters lists to only items that have tonnage for the class', () => {
    const weaponsForKaiju = filterWeaponsForClass(gameData.weapons, 'Kaiju')
    expect(weaponsForKaiju.every(w => w.tonnage && Object.prototype.hasOwnProperty.call(w.tonnage, 'Kaiju'))).toBe(true)
    expect(weaponsForKaiju.some(w => w.id === 'w_kaiju_punch')).toBe(true)

    const upgForKaiju = filterUpgradesForClass(gameData.upgrades, 'Kaiju')
    expect(upgForKaiju.every(u => u.tonnage && Object.prototype.hasOwnProperty.call(u.tonnage, 'Kaiju'))).toBe(true)
    expect(upgForKaiju.some(u => u.id === 'u13')).toBe(true)
  })
})
