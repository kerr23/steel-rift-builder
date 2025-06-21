// src/composables/useUnitEditor.js
import { nextTick } from 'vue'
import { useToast } from 'vue-toastification'

/**
 * A composable for handling HE-V unit editing functionality
 * @param {Object} options - Configuration options
 * @param {Object} options.hevCustomizerRef - Ref to the HEV customizer component
 * @param {Function} options.setActiveTab - Function to set the active tab
 * @param {Function} options.removeFromRoster - Function to remove a unit from the roster
 * @returns {Object} Unit editor functions
 */
export function useUnitEditor(options) {
  const { hevCustomizerRef, setActiveTab, removeFromRoster } = options
  const toast = useToast()

  /**
   * Edit an HE-V unit
   * @param {Object} unitToEdit - The unit to edit
   */
  const editUnit = async (unitToEdit) => {
    if (!unitToEdit || unitToEdit.id === undefined) {
      console.error('Cannot edit: Invalid unit data.', unitToEdit)
      toast.error('Error: Invalid unit data.', { timeout: 1000 })
      return
    }

    // First switch to HE-V tab if it's an HE-V
    if (!unitToEdit.isSupportAsset) {
      setActiveTab('hev')

      // Use nextTick to ensure the component is rendered before accessing it
      await nextTick()

      if (!hevCustomizerRef.value) {
        console.error('Cannot edit: HevCustomizer ref not found.')
        toast.error('Error: Cannot access customizer.', { timeout: 1000 })
        return
      }

      // Create a deep copy of the unit to edit
      const unitCopy = JSON.parse(JSON.stringify(unitToEdit))

      hevCustomizerRef.value.loadHevForEditing(unitCopy)
      removeFromRoster(unitToEdit.id, false) // Don't show toast when editing
      toast.info('HE-V loaded for editing.', { timeout: 1000 })
    }
    else {
      // Handle support asset editing logic
      toast.info('Support asset editing not implemented yet.', { timeout: 1000 })
      // Future implementation would go here
    }
  }

  return {
    editUnit
  }
}
