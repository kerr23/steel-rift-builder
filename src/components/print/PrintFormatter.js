// src/components/print/PrintFormatter.js
/**
 * Print formatting service for roster generation
 */

import { generatePrintHtml } from '@/printUtils'
import { useToast } from 'vue-toastification'

/**
 * Format roster for printing
 * @param {Object} options - Print options
 * @param {Array} options.roster - The roster to print
 * @param {String} options.rosterName - Name of the roster
 * @param {Number} options.totalRosterBaseTonnage - Total tonnage
 * @param {Function} options.getBaseTonnage - Function to calculate base tonnage
 * @param {Function} options.generateBubbleHtml - Function to generate bubble HTML
 * @param {Function} options.formatPrintTrait - Function to format traits for print
 * @param {Object} options.gameRulesData - Game rules data
 */
export function formatRosterForPrint(options) {
  const {
    roster,
    rosterName,
    totalRosterBaseTonnage,
    getBaseTonnage,
    generateBubbleHtml,
    formatPrintTrait,
    gameRulesData
  } = options

  const toast = useToast()

  if (roster.length === 0) {
    toast.info('No units to print. Add units to your roster first.', { timeout: 2000 })
    return
  }

  try {
    const fullHtml = generatePrintHtml({
      roster,
      rosterName,
      totalRosterBaseTonnage,
      getBaseTonnage,
      generateBubbleHtml,
      formatPrintTrait,
      gameRulesData
    })

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(fullHtml)
      printWindow.document.close()
      toast.success('Print view opened in new tab.', { timeout: 2000 })
    } else {
      toast.error('Failed to open print view. Please check your popup blocker settings.', { timeout: 3000 })
    }
  } catch (error) {
    console.error('Error generating print view:', error)
    toast.error('Failed to generate print view.', { timeout: 2000 })
  }
}
