// src/services/printService.js
// Print functionality extracted into a service for better separation of concerns

import { generatePrintHtml } from '../printUtils.js'

/**
 * Opens a print window with formatted roster data
 *
 * @param {Array} roster - The roster data to print
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total tonnage of the roster
 * @param {Function} getBaseTonnage - Function to get the base tonnage of a unit
 * @param {Object} formatHelpers - Object containing formatting helper functions
 * @param {Object} gameRulesData - Game rules data
 * @returns {Boolean} - Whether print window was successfully opened
 */
export function openPrintWindow(roster, rosterName, totalRosterBaseTonnage, getBaseTonnage, formatHelpers, gameRulesData) {
  try {
    const fullHtml = generatePrintHtml({
      roster,
      rosterName,
      totalRosterBaseTonnage,
      getBaseTonnage,
      ...formatHelpers,
      gameRulesData
    })

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(fullHtml)
      printWindow.document.close()
      return true
    }
    return false
  } catch (error) {
    console.error('Print error:', error)
    return false
  }
}

/**
 * Prepares a formatted version of the roster for print
 * without opening a print window
 *
 * @param {Array} roster - The roster data to format
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total tonnage of the roster
 * @param {Function} getBaseTonnage - Function to get the base tonnage of a unit
 * @param {Object} formatHelpers - Object containing formatting helper functions
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} - HTML string with formatted roster
 */
export function prepareRosterForPrint(roster, rosterName, totalRosterBaseTonnage, getBaseTonnage, formatHelpers, gameRulesData) {
  try {
    return generatePrintHtml({
      roster,
      rosterName,
      totalRosterBaseTonnage,
      getBaseTonnage,
      ...formatHelpers,
      gameRulesData
    })
  } catch (error) {
    console.error('Print preparation error:', error)
    return `<div class="error">Error preparing print: ${error.message}</div>`
  }
}
