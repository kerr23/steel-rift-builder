// src/stores/rosterStore.js
import { defineStore } from 'pinia'
import { findClassByName } from '@/gameData'
import { generateUniqueId } from '@/utils/formatters'
import { useToast } from 'vue-toastification'

export const useRosterStore = defineStore('roster', {
  state: () => ({
    rosterName: '',
    roster: [],
  }),

  getters: {
    totalRosterBaseTonnage: (state) => {
      return state.roster.reduce((total, unit) => total + getBaseTonnage(unit), 0)
    },
  },

  actions: {
    addHevToRoster(hevData) {
      if (!hevData) {
        console.error('Cannot add HEV: Invalid data provided')
        return
      }

      this.roster.push({
        ...hevData,
        id: hevData.id || generateUniqueId(),
      })

      const toast = useToast()
      toast.success('HE-V added to roster!', { timeout: 1000 })
    },

    addSupportAssetToRoster(asset) {
      this.roster.push({
        ...asset,
        id: generateUniqueId(),
        isSupportAsset: true,
        totalUnitTonnage: 10
      })

      const toast = useToast()
      toast.success('Support Asset added to roster!', { timeout: 1000 })
    },

    removeFromRoster(unitId, showToast = true) {
      const index = this.roster.findIndex((unit) => unit.id === unitId)
      if (index !== -1) {
        this.roster.splice(index, 1)

        if (showToast) {
          const toast = useToast()
          toast.info('Unit removed from roster.', { timeout: 1000 })
        }
      }
    },

    updateRosterName(newName) {
      this.rosterName = newName
    },

    importRoster(importData) {
      if (importData && importData.rosterName && Array.isArray(importData.roster)) {
        this.rosterName = importData.rosterName
        this.roster = importData.roster

        const toast = useToast()
        toast.success(`Roster imported successfully. ${importData.roster.length} units loaded.`, { timeout: 2000 })
      }
    },

    reorderRoster(newOrder) {
      this.roster = newOrder
    }
  }
})

/**
 * Gets base tonnage for a unit
 * @param {Object} unit - The unit to calculate tonnage for
 * @returns {number} - The base tonnage value
 */
function getBaseTonnage(unit) {
  if (unit.isSupportAsset) return unit.totalUnitTonnage || 10
  if (!unit.selectedClass) return 0
  const cls = findClassByName(unit.selectedClass.name)
  return cls ? cls.baseTonnage : 0
}
