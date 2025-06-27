import { describe, it, expect } from 'vitest'
import { useUnitDetails } from '../useUnitDetails.js'

describe('useUnitDetails', () => {
  const mockGameRules = {
    weapons: [
      {
        id: 'w_laser',
        name: 'Pulse Laser',
        tonnage: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 },
        damageRating: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
        rangeCategory: '18"',
        traits: [
          { name: 'AP', value: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 } }
        ]
      },
      {
        id: 'w_missile',
        name: 'Missile Pack',
        tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
        damageRating: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
        rangeCategory: 'Unlimited',
        traits: [
          { name: 'Smart' },
          { name: 'Limited', value: 2 }
        ]
      }
    ],
    upgradePods: [
      {
        id: 'u_armor',
        name: 'Ablative Armor',
        tonnage: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 },
        type: 'defensive',
        description: 'Provides additional armor protection',
        traits: []
      },
      {
        id: 'u_jump',
        name: 'Jump Jets',
        tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
        type: 'mobility',
        description: 'Allows jumping over terrain',
        slots: 1,
        traits: [
          { name: 'Jump' }
        ]
      }
    ]
  }

  const { getAvailableWeapons, getAvailableUpgrades, getSupportAssetDetails } = useUnitDetails(mockGameRules)

  describe('getAvailableWeapons', () => {
    it('returns formatted weapons for Light class', () => {
      const lightClass = { name: 'Light' }
      const weapons = getAvailableWeapons(lightClass)

      expect(weapons).toHaveLength(2)
      
      const laser = weapons.find(w => w.id === 'w_laser')
      expect(laser).toEqual({
        id: 'w_laser',
        name: 'Pulse Laser',
        damage: 2,
        tonnage: 1,
        range: '18"',
        traits: [
          { name: 'AP(1)', description: expect.any(String) }
        ]
      })

      const missile = weapons.find(w => w.id === 'w_missile')
      expect(missile).toEqual({
        id: 'w_missile',
        name: 'Missile Pack',
        damage: 3,
        tonnage: 2,
        range: 'Unlimited',
        traits: [
          { name: 'Smart', description: expect.any(String) },
          { name: 'Limited(2)', description: expect.any(String) }
        ]
      })
    })

    it('returns formatted weapons for Heavy class', () => {
      const heavyClass = { name: 'Heavy' }
      const weapons = getAvailableWeapons(heavyClass)

      expect(weapons).toHaveLength(2)
      
      const laser = weapons.find(w => w.id === 'w_laser')
      expect(laser.damage).toBe(4)
      expect(laser.tonnage).toBe(3)
      expect(laser.traits[0].name).toBe('AP(3)')
    })

    it('handles missing class gracefully', () => {
      const weapons = getAvailableWeapons(null)
      expect(weapons).toEqual([])
    })

    it('handles missing game rules gracefully', () => {
      const { getAvailableWeapons: getWeapons } = useUnitDetails(null)
      const weapons = getWeapons({ name: 'Light' })
      expect(weapons).toEqual([])
    })

    it('formats traits correctly', () => {
      const lightClass = { name: 'Light' }
      const weapons = getAvailableWeapons(lightClass)
      
      const laser = weapons.find(w => w.id === 'w_laser')
      expect(laser.traits[0].name).toBe('AP(1)')
      expect(laser.traits[0].description).toContain('Armor Penetrating')

      const missile = weapons.find(w => w.id === 'w_missile')
      expect(missile.traits.find(t => t.name === 'Smart')).toBeTruthy()
      expect(missile.traits.find(t => t.name === 'Limited(2)')).toBeTruthy()
    })
  })

  describe('getAvailableUpgrades', () => {
    it('returns formatted upgrades for Light class', () => {
      const lightClass = { name: 'Light' }
      const upgrades = getAvailableUpgrades(lightClass)

      expect(upgrades).toHaveLength(2)
      
      const armor = upgrades.find(u => u.id === 'u_armor')
      expect(armor).toEqual({
        id: 'u_armor',
        name: 'Ablative Armor',
        tonnage: 1,
        description: 'Provides additional armor protection',
        traits: [],
        type: 'defensive',
        slots: 0
      })

      const jumpJets = upgrades.find(u => u.id === 'u_jump')
      expect(jumpJets).toEqual({
        id: 'u_jump',
        name: 'Jump Jets',
        tonnage: 2,
        description: 'Allows jumping over terrain',
        traits: [
          { name: 'Jump', description: expect.any(String) }
        ],
        type: 'mobility',
        slots: 1
      })
    })

    it('handles missing class gracefully', () => {
      const upgrades = getAvailableUpgrades(null)
      expect(upgrades).toEqual([])
    })
  })

  describe('getSupportAssetDetails', () => {
    it('returns off-table support details', () => {
      const details = getSupportAssetDetails('off-table', 'artillery')
      
      expect(details.abilities).toHaveLength(1)
      expect(details.abilities[0]).toEqual({
        name: 'Artillery Strike',
        description: 'Can target any visible enemy unit on the battlefield',
        cooldown: 'Once per battle',
        effectiveness: 'High damage, area effect'
      })
    })

    it('returns ultra-light support details with upgrade pods', () => {
      const details = getSupportAssetDetails('ultra-light', 'squadron')
      
      expect(details.upgrades).toHaveLength(2)
      expect(details.upgrades[0].name).toBe('Ablative Armor')
    })

    it('returns infantry-outpost support details with weapons', () => {
      const details = getSupportAssetDetails('infantry-outpost', 'bunker')
      
      expect(details.weapons).toHaveLength(2)
      expect(details.weapons[0].name).toBe('Pulse Laser')
    })

    it('returns empty details for unknown asset class', () => {
      const details = getSupportAssetDetails('unknown', 'type')
      
      expect(details).toEqual({
        weapons: [],
        equipment: [],
        abilities: [],
        upgrades: []
      })
    })
  })
})
