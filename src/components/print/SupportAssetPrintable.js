// Support Asset print renderer
import { generateUnitTitleHtml, renderLimitedTraitWithBubbles, extractTraitNames, generateTraitDefinitionsHtml } from './printHelpers.js';

/**
 * Generates HTML for a generic support asset
 * @param {Object} unit - The support asset unit object
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total roster base tonnage
 * @param {Function} generateBubbleHtml - Function to generate bubble HTML
 * @param {Function} formatPrintTrait - Function to format print traits
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML string for the support asset
 */
export function generateSupportAssetHtml(unit, rosterName, totalRosterBaseTonnage, generateBubbleHtml, formatPrintTrait, gameRulesData) {
  // Extract support asset trait names
  const supportAssetTraitNames = new Set();

  if (Array.isArray(unit.details)) {
    unit.details.forEach(line => {
      if (/Traits:/.test(line)) {
        // Extract traits from the traits line
        const traitsText = line.replace(/<strong>Traits:<\/strong>\s*/, '');
        const traitsList = extractTraitNames(traitsText);
        traitsList.forEach(trait => supportAssetTraitNames.add(trait));
      }
    });
  }

  // Determine if this is a weapon system, ultra-light squadron, or infantry outpost
  const isWeaponSystem = unit.details?.some(line => (/Damage:/.test(line) || /Range:/.test(line))) || false;
  const isUltraLightSquadron = unit.type?.includes('Squadron') || false;
  const isInfantryOutpost = unit.type === 'Infantry Outpost' || false;

  // Start the HTML
  let html = `<div class="unit-card support-asset-card">`;

  // Add the title
  html += generateUnitTitleHtml(unit.type || 'Support Asset', rosterName, totalRosterBaseTonnage);

  // Generate the appropriate content based on the type
  if (isWeaponSystem) {
    html += renderWeaponSystem(unit, supportAssetTraitNames, gameRulesData);
  } else {
    // Default display for other support assets
    html += renderDefaultSupportAsset(unit, supportAssetTraitNames, gameRulesData);
  }

  // Trait definitions section
  html += generateTraitDefinitionsHtml(supportAssetTraitNames, gameRulesData.traitDefinitions);

  html += `</div>`;
  return html;
}

/**
 * Renders a weapon system support asset
 * @param {Object} unit - The weapon system unit object
 * @param {Set} supportAssetTraitNames - Set of trait names
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML string for weapon system
 */
function renderWeaponSystem(unit, supportAssetTraitNames, gameRulesData) {
  let html = `<div class="equipment-section">`;

  // Extract weapon details from unit.details
  let weaponName, damage, range, traits;

  if (Array.isArray(unit.details)) {
    unit.details.forEach(line => {
      // Main weapon name is usually the first line
      if (!weaponName && /<u>(.*?)<\/u>/.test(line)) {
        const match = line.match(/<u>(.*?)<\/u>/);
        if (match) weaponName = match[1];
      }

      if (/Damage:/.test(line)) {
        const match = line.match(/<strong>Damage:<\/strong>\s*(.*)/i);
        if (match) damage = match[1];
      }

      if (/Range:/.test(line)) {
        const match = line.match(/<strong>Range:<\/strong>\s*(.*)/i);
        if (match) range = match[1];
      }

      if (/Traits:/.test(line)) {
        const match = line.match(/<strong>Traits:<\/strong>\s*(.*)/i);
        if (match) traits = match[1];
      }
    });
  }

  // Weapon section
  html += `<div class="weapon-system-card">
    <h4 class="weapon-system-name">${weaponName || 'Weapon System'}</h4>

    <table class="print-weapon-table">
      <thead>
        <tr>
          <th>Weapon</th>
          <th>Range</th>
          <th>Damage</th>
          <th>Traits</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${weaponName || 'Weapon System'}</td>
          <td>${range || 'N/A'}</td>
          <td>${damage || 'N/A'}</td>
          <td>${traits ? renderLimitedTraitWithBubbles(traits) : 'None'}</td>
        </tr>
      </tbody>
    </table>`;

  // Additional details
  html += `<div class="support-asset-details">`;
  if (Array.isArray(unit.details)) {
    unit.details.forEach(line => {
      // Skip the lines we've already processed
      if (/<u>/.test(line) || /Damage:/.test(line) || /Range:/.test(line) || /Traits:/.test(line)) {
        return;
      }
      html += `<div class="detail-line">${line}</div>`;
    });
  }
  html += `</div>`;

  html += `</div>`; // End weapon-system-card
  html += `</div>`; // End equipment-section

  return html;
}

/**
 * Renders a default support asset
 * @param {Object} unit - The support asset unit object
 * @param {Set} supportAssetTraitNames - Set of trait names
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML string for support asset
 */
function renderDefaultSupportAsset(unit, supportAssetTraitNames, gameRulesData) {
  let html = `<div class="equipment-section">`;

  // Support Asset Details
  html += `<div class="support-asset-card">`;

  // Extract support asset name
  let assetName = unit.type || 'Support Asset';

  // Display all the details
  html += `<div class="support-asset-details">`;
  if (Array.isArray(unit.details)) {
    unit.details.forEach(line => {
      html += `<div class="detail-line">${line}</div>`;
    });
  }
  html += `</div>`;

  html += `</div>`; // End support-asset-card
  html += `</div>`; // End equipment-section

  return html;
}
