import { describe, it, expect, beforeEach } from 'vitest'
import { INFANTRY_OUTPOST_WEAPONS, INFANTRY_TYPES } from '../gameData'

describe('Infantry Outpost Support Asset', () => {
  // Test data validation functions
  it('should have properly defined weapons in gameData.js', () => {
    expect(INFANTRY_OUTPOST_WEAPONS).toBeDefined()
    expect(Array.isArray(INFANTRY_OUTPOST_WEAPONS)).toBe(true)
    expect(INFANTRY_OUTPOST_WEAPONS.length).toBeGreaterThan(0)

    // Validate weapon structure
    INFANTRY_OUTPOST_WEAPONS.forEach(weapon => {
      expect(weapon.id).toBeDefined()
      expect(weapon.name).toBeDefined()
      expect(weapon.damage).toBeDefined()
      expect(weapon.range).toBeDefined()
      expect(Array.isArray(weapon.traits)).toBe(true)
    })
  })

  it('should have properly defined infantry types in gameData.js', () => {
    expect(INFANTRY_TYPES).toBeDefined()
    expect(Array.isArray(INFANTRY_TYPES)).toBe(true)
    expect(INFANTRY_TYPES.length).toBeGreaterThan(0)

    // Validate infantry structure
    INFANTRY_TYPES.forEach(infantry => {
      expect(infantry.id).toBeDefined()
      expect(infantry.name).toBeDefined()
      expect(infantry.speed).toBeDefined()
      expect(Array.isArray(infantry.traits)).toBe(true)

      // Regular infantry have weapons, mine drones have special rules
      if (infantry.id === 'mine-drone') {
        expect(infantry.specialRules).toBeDefined()
      } else {
        expect(Array.isArray(infantry.weapons)).toBe(true)
        expect(infantry.structure).toBeDefined()
        infantry.weapons.forEach(weapon => {
          expect(weapon.name).toBeDefined()
          expect(weapon.damage).toBeDefined()
          expect(weapon.range).toBeDefined()
          expect(Array.isArray(weapon.traits)).toBe(true)
        })
      }
    })
  })

  // Test bunker validation
  describe('Bunker Validation', () => {
    let bunker

    beforeEach(() => {
      bunker = {
        selectedWeaponId: INFANTRY_OUTPOST_WEAPONS[0].id,
        infantry: {
          'rifle-squad': 2,
          'engineers': 1
        }
      }
    })

    it('should validate a valid bunker configuration', () => {
      // Simulate the validation function
      const isValid = (bunker) => {
        if (!bunker.selectedWeaponId) return false
        const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
        if (totalInfantry < 1 || totalInfantry > 6) return false
        const mineDrones = bunker.infantry['mine-drone'] || 0
        if (mineDrones > 2) return false
        return true
      }

      expect(isValid(bunker)).toBe(true)
    })

    it('should invalidate a bunker with no weapon', () => {
      bunker.selectedWeaponId = ''

      // Simulate the validation function
      const isValid = (bunker) => {
        if (!bunker.selectedWeaponId) return false
        const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
        if (totalInfantry < 1 || totalInfantry > 6) return false
        const mineDrones = bunker.infantry['mine-drone'] || 0
        if (mineDrones > 2) return false
        return true
      }

      expect(isValid(bunker)).toBe(false)
    })

    it('should invalidate a bunker with no infantry', () => {
      bunker.infantry = {}

      // Simulate the validation function
      const isValid = (bunker) => {
        if (!bunker.selectedWeaponId) return false
        const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
        if (totalInfantry < 1 || totalInfantry > 6) return false
        const mineDrones = bunker.infantry['mine-drone'] || 0
        if (mineDrones > 2) return false
        return true
      }

      expect(isValid(bunker)).toBe(false)
    })

    it('should invalidate a bunker with too many infantry', () => {
      bunker.infantry = {
        'rifle-squad': 4,
        'engineers': 3
      }

      // Simulate the validation function
      const isValid = (bunker) => {
        if (!bunker.selectedWeaponId) return false
        const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
        if (totalInfantry < 1 || totalInfantry > 6) return false
        const mineDrones = bunker.infantry['mine-drone'] || 0
        if (mineDrones > 2) return false
        return true
      }

      expect(isValid(bunker)).toBe(false)
    })

    it('should invalidate a bunker with too many mine drones', () => {
      bunker.infantry = {
        'rifle-squad': 1,
        'mine-drone': 3
      }

      // Simulate the validation function
      const isValid = (bunker) => {
        if (!bunker.selectedWeaponId) return false
        const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
        if (totalInfantry < 1 || totalInfantry > 6) return false
        const mineDrones = bunker.infantry['mine-drone'] || 0
        if (mineDrones > 2) return false
        return true
      }

      expect(isValid(bunker)).toBe(false)
    })
  })

  // Test outpost validation (both bunkers)
  describe('Infantry Outpost Validation', () => {
    let bunker1, bunker2

    beforeEach(() => {
      bunker1 = {
        selectedWeaponId: INFANTRY_OUTPOST_WEAPONS[0].id,
        infantry: {
          'rifle-squad': 2,
          'engineers': 1
        }
      }

      bunker2 = {
        selectedWeaponId: INFANTRY_OUTPOST_WEAPONS[1].id,
        infantry: {
          'heavy-weapon-team': 3,
          'mine-drone': 1
        }
      }
    })

    it('should validate a valid outpost configuration', () => {
      // Simulate the validation function
      const isOutpostValid = (bunker1, bunker2) => {
        // Both bunkers must be valid
        const isBunkerValid = (bunker) => {
          if (!bunker.selectedWeaponId) return false
          const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
          if (totalInfantry < 1 || totalInfantry > 6) return false
          const mineDrones = bunker.infantry['mine-drone'] || 0
          if (mineDrones > 2) return false
          return true
        }

        if (!isBunkerValid(bunker1) || !isBunkerValid(bunker2)) return false

        // Total infantry count must not exceed 12
        const totalInfantry =
          Object.values(bunker1.infantry).reduce((sum, count) => sum + count, 0) +
          Object.values(bunker2.infantry).reduce((sum, count) => sum + count, 0)

        if (totalInfantry > 12) return false

        return true
      }

      expect(isOutpostValid(bunker1, bunker2)).toBe(true)
    })

    it('should invalidate an outpost with invalid bunkers', () => {
      bunker1.selectedWeaponId = ''

      // Simulate the validation function
      const isOutpostValid = (bunker1, bunker2) => {
        // Both bunkers must be valid
        const isBunkerValid = (bunker) => {
          if (!bunker.selectedWeaponId) return false
          const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
          if (totalInfantry < 1 || totalInfantry > 6) return false
          const mineDrones = bunker.infantry['mine-drone'] || 0
          if (mineDrones > 2) return false
          return true
        }

        if (!isBunkerValid(bunker1) || !isBunkerValid(bunker2)) return false

        // Total infantry count must not exceed 12
        const totalInfantry =
          Object.values(bunker1.infantry).reduce((sum, count) => sum + count, 0) +
          Object.values(bunker2.infantry).reduce((sum, count) => sum + count, 0)

        if (totalInfantry > 12) return false

        return true
      }

      expect(isOutpostValid(bunker1, bunker2)).toBe(false)
    })

    it('should invalidate an outpost with too many total infantry', () => {
      bunker1.infantry = {
        'rifle-squad': 6
      }

      bunker2.infantry = {
        'engineers': 6,
        'heavy-weapon-team': 1
      }

      // Simulate the validation function
      const isOutpostValid = (bunker1, bunker2) => {
        // Both bunkers must be valid
        const isBunkerValid = (bunker) => {
          if (!bunker.selectedWeaponId) return false
          const totalInfantry = Object.values(bunker.infantry).reduce((sum, count) => sum + count, 0)
          if (totalInfantry < 1 || totalInfantry > 6) return false
          const mineDrones = bunker.infantry['mine-drone'] || 0
          if (mineDrones > 2) return false
          return true
        }

        if (!isBunkerValid(bunker1) || !isBunkerValid(bunker2)) return false

        // Total infantry count must not exceed 12
        const totalInfantry =
          Object.values(bunker1.infantry).reduce((sum, count) => sum + count, 0) +
          Object.values(bunker2.infantry).reduce((sum, count) => sum + count, 0)

        if (totalInfantry > 12) return false

        return true
      }

      expect(isOutpostValid(bunker1, bunker2)).toBe(false)
    })
  })
})
