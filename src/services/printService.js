// src/services/printService.js
// Print functionality extracted into a service for better separation of concerns

import { generateHevHtml } from '../components/print/HevPrintable.js';
import { generateSupportAssetHtml } from '../components/print/SupportAssetPrintable.js';
import { generateUltraLightSquadronHtml } from '../components/print/UltraLightSquadronPrintable.js';
import { generateInfantryOutpostHtml } from '../components/print/InfantryOutpostPrintable.js';

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

/**
 * Generates HTML for printing the roster
 *
 * @param {Object} options - Options for generating print HTML
 * @param {Array} options.roster - The roster data to print
 * @param {String} options.rosterName - Name of the roster
 * @param {Number} options.totalRosterBaseTonnage - Total tonnage of the roster
 * @param {Function} options.getBaseTonnage - Function to get base tonnage
 * @param {Function} options.generateBubbleHtml - Function to generate bubble HTML
 * @param {Function} options.formatPrintTrait - Function to format print traits
 * @param {Object} options.gameRulesData - Game rules data
 * @returns {String} - Full HTML document for printing
 */
export function generatePrintHtml({
  roster,
  rosterName,
  totalRosterBaseTonnage,
  getBaseTonnage,
  generateBubbleHtml,
  formatPrintTrait,
  gameRulesData
}) {
  // Validate essential game data
  if (!gameRulesData.UL_HEV_WEAPONS) {
    console.warn('UL_HEV_WEAPONS not found in gameRulesData')
  }
  if (!gameRulesData.UL_HEV_UPGRADE_PODS) {
    console.warn('UL_HEV_UPGRADE_PODS not found in gameRulesData')
  }

  // Set up CSS and header
  const cssLink = '<link rel="stylesheet" href="print.css">'
  let htmlBody = `
    <button class="no-print" onclick="window.print()">Print this page</button>
  `

  // Generate HTML for each unit in the roster
  roster.forEach((unit) => {
    if (unit.isSupportAsset) {
      // Determine the type of support asset
      const isUltraLightSquadron = unit.type?.includes('Squadron') || false
      const isInfantryOutpost = unit.type === 'Infantry Outpost' || false

      if (isInfantryOutpost) {
        // Render infantry outpost
        htmlBody += generateInfantryOutpostHtml(
          unit,
          rosterName,
          totalRosterBaseTonnage,
          generateBubbleHtml,
          gameRulesData
        )
      } else if (isUltraLightSquadron) {
        // Render ultra-light squadron
        htmlBody += generateUltraLightSquadronHtml(
          unit,
          rosterName,
          totalRosterBaseTonnage,
          generateBubbleHtml,
          gameRulesData
        )
      } else {
        // Render regular support asset
        htmlBody += generateSupportAssetHtml(
          unit,
          rosterName,
          totalRosterBaseTonnage,
          generateBubbleHtml,
          formatPrintTrait,
          gameRulesData
        )
      }
    } else {
      // Render regular HE-V unit
      htmlBody += generateHevHtml(
        unit,
        rosterName,
        totalRosterBaseTonnage,
        getBaseTonnage,
        generateBubbleHtml,
        formatPrintTrait,
        gameRulesData
      )
    }
  })

  // Assemble the full HTML document
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steel Rift Force Builder - Print ${rosterName ? `- ${rosterName}` : ''}</title>
    ${cssLink}
    <style>
      /* Add any additional in-page styles here */
      @media print {
        .no-print {
          display: none;
        }
        /* Force background colors to print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  </head>
  <body>
    ${htmlBody}
  </body>
  </html>`
}
