// Ultra-Light Squadron print renderer
import { generateUnitTitleHtml, generateTraitDefinitionsHtml } from './printHelpers.js';

/**
 * Generates HTML for an Ultra-Light Squadron
 * @param {Object} unit - The ultra-light squadron unit object
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total roster base tonnage
 * @param {Function} generateBubbleHtml - Function to generate bubble HTML
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML string for the ultra-light squadron
 */
export function generateUltraLightSquadronHtml(unit, rosterName, totalRosterBaseTonnage, generateBubbleHtml, gameRulesData) {
  // Extract trait names for definitions
  const squadronTraitNames = new Set();

  if (Array.isArray(unit.details)) {
    unit.details.forEach(line => {
      if (/Traits:/.test(line)) {
        const traitsText = line.replace(/<strong>Traits:<\/strong>\s*/, '');
        const traitsList = traitsText.split(/,\s*/);
        traitsList.forEach(trait => {
          const baseTraitName = trait.trim().split('(')[0].trim();
          squadronTraitNames.add(baseTraitName);
        });
      }
    });
  }

  // Parse HE-Vs from the unit details
  const hevs = parseUltraLightHevs(unit.details);

  // Start the HTML
  let html = `<div class="unit-card support-asset-card">`;

  // Add the title
  html += generateUnitTitleHtml(unit.type || 'Ultra-Light Squadron', rosterName, totalRosterBaseTonnage);

  // Equipment section
  html += `<div class="equipment-section">`;

  // Add Defense section
  html += `<div class="print-defense-layout-container">
    <div class="print-defense-row defense-roll-row">
      <span class="print-defense-label">Defense:</span>
      <span>4+</span>
    </div>
  </div>`;

  // Group HE-Vs by type
  const hevsByType = groupHevsByType(hevs);

  // Display each type of HE-V with its details grouped together
  html += `<div class="ulv-types-container">`;

  Object.entries(hevsByType).forEach(([typeName, typeHevs]) => {
    // Get traits and speed from the first HEV of this type
    const speedDetail = typeHevs[0].details.find(detail => /Speed:/.test(detail));
    const traitsDetail = typeHevs[0].details.find(detail => /Traits:/.test(detail));

    html += `<div class="ulv-type-container">
      <div class="ulv-type-header">
        <h4 class="ulv-type-name">${typeName}</h4>
        ${speedDetail ? `<div class="ulv-type-speed">${speedDetail}</div>` : ''}
        ${traitsDetail ? `<div class="ulv-type-traits">${traitsDetail}</div>` : ''}
      </div>
      <div class="ulv-instances-container">`;

    // Display individual ULV instances within this type
    typeHevs.forEach(hev => {
      // Extract weapon systems information
      const weaponSystemsDetail = hev.details.find(detail => /Weapon Systems:/.test(detail));
      let weaponNames = [];
      if (weaponSystemsDetail) {
        const weaponText = weaponSystemsDetail.replace(/<strong>Weapon Systems:<\/strong>\s*/, '');
        weaponNames = weaponText.split(/,\s*/).map(name => name.trim());
      }

      html += `<div class="ultra-light-card">
        <div class="ultra-light-armor">
          <span class="print-defense-label">Armor:</span>
          <span class="bubble-display">
            ${generateBubbleHtml(hev.armor || 3, false)}
          </span>
        </div>`;

      // Add weapon systems table if weapons exist
      if (weaponNames.length > 0 && gameRulesData.UL_HEV_WEAPONS) {
        html += renderUltraLightWeapons(weaponNames, gameRulesData);
      }

      html += `</div>`; // End ultra-light-card
    });

    html += `</div>`; // End ulv-instances-container
    html += `</div>`; // End ulv-type-container
  });

  html += `</div>`; // End ulv-types-container

  // Check if this squadron has an upgrade pod
  if (unit.upgradePodId && gameRulesData.UL_HEV_UPGRADE_PODS) {
    html += renderUpgradePod(unit.upgradePodId, gameRulesData);
  }

  html += `</div>`; // End equipment-section

  // Trait definitions section
  html += generateTraitDefinitionsHtml(squadronTraitNames, gameRulesData.traitDefinitions);

  html += `</div>`; // End unit-card
  return html;
}

/**
 * Parse ultra-light HE-Vs from the unit details
 * @param {Array} details - The unit details
 * @returns {Array} Array of HE-V objects
 */
function parseUltraLightHevs(details) {
  const hevs = [];
  if (!Array.isArray(details)) return hevs;

  let currentHEV = null;
  let hevDetails = [];

  details.forEach(line => {
    if (line.startsWith('<u>') && !line.includes('strong')) {
      // Save previous HE-V
      if (currentHEV && hevDetails.length > 0) {
        // Find the armor value in the details
        let armorValue = 3; // Default armor value
        const armorDetail = hevDetails.find(detail => /Armor:/.test(detail));
        if (armorDetail) {
          const armorMatch = armorDetail.match(/<strong>Armor:<\/strong>\s*(\d+)/i);
          if (armorMatch && armorMatch[1]) {
            armorValue = parseInt(armorMatch[1], 10);
          }
        }
        hevs.push({
          name: currentHEV,
          details: [...hevDetails],
          armor: armorValue
        });
        hevDetails = [];
      }
      currentHEV = line.replace(/<\/?u>/g, '');
    } else if (currentHEV && !line.startsWith('<strong>Upgrade Pod:</strong>')) {
      hevDetails.push(line);
    }
  });

  // Don't forget the last HE-V
  if (currentHEV && hevDetails.length > 0) {
    // Find the armor value in the details
    let armorValue = 3; // Default armor value
    const armorDetail = hevDetails.find(detail => /Armor:/.test(detail));
    if (armorDetail) {
      const armorMatch = armorDetail.match(/<strong>Armor:<\/strong>\s*(\d+)/i);
      if (armorMatch && armorMatch[1]) {
        armorValue = parseInt(armorMatch[1], 10);
      }
    }
    hevs.push({
      name: currentHEV,
      details: [...hevDetails],
      armor: armorValue
    });
  }

  return hevs;
}

/**
 * Group HE-Vs by type
 * @param {Array} hevs - Array of HE-V objects
 * @returns {Object} Object with type names as keys and arrays of HE-Vs as values
 */
function groupHevsByType(hevs) {
  const hevsByType = {};
  hevs.forEach(hev => {
    const typeName = hev.name;
    if (!hevsByType[typeName]) {
      hevsByType[typeName] = [];
    }
    hevsByType[typeName].push(hev);
  });
  return hevsByType;
}

/**
 * Render ultra-light weapon systems
 * @param {Array} weaponNames - Array of weapon names
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML for weapon systems table
 */
function renderUltraLightWeapons(weaponNames, gameRulesData) {
  let html = `<div class="ultra-light-weapons">
    <h5 class="weapons-heading">Weapon Systems</h5>
    <table class="print-weapon-table print-ul-weapon-table">
      <thead>
        <tr>
          <th>Weapon</th>
          <th>Range</th>
          <th>Damage</th>
          <th>Traits</th>
        </tr>
      </thead>
      <tbody>`;

  weaponNames.forEach(weaponName => {
    // Find the weapon data from the UL_HEV_WEAPONS array
    const weaponData = gameRulesData.UL_HEV_WEAPONS.find(w =>
      w.name.toLowerCase() === weaponName.toLowerCase() ||
      w.alternateNames?.some(alt => alt.toLowerCase() === weaponName.toLowerCase())
    );

    if (weaponData) {
      html += `<tr>
        <td>${weaponData.name}</td>
        <td>${weaponData.range || 'N/A'}</td>
        <td>${weaponData.damage || 'N/A'}</td>
        <td>${weaponData.traits ? weaponData.traits.join(', ') : 'None'}</td>
      </tr>`;
    } else {
      html += `<tr>
        <td>${weaponName}</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
      </tr>`;
    }
  });

  html += `</tbody>
    </table>
  </div>`;

  return html;
}

/**
 * Render upgrade pod
 * @param {String} podId - ID of the upgrade pod
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML for upgrade pod
 */
function renderUpgradePod(podId, gameRulesData) {
  const podData = gameRulesData.UL_HEV_UPGRADE_PODS.find(pod => pod.id === podId);
  if (!podData) return '';

  let html = `<div class="ultra-light-upgrade-pod">
    <h5 class="upgrade-pod-heading">Squadron Upgrade Pod: ${podData.name}</h5>

    <table class="print-weapon-table print-ul-weapon-table">
      <thead>
        <tr>
          <th>Upgrade Pod</th>
          <th>Range</th>
          <th>Damage</th>
          <th>Traits</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${podData.name}</td>
          <td>${podData.range || 'N/A'}</td>
          <td>${podData.damage || 'N/A'}</td>
          <td>${podData.traits ? podData.traits.join(', ') : 'None'}</td>
        </tr>
      </tbody>
    </table>

    ${podData.description ? `<p class="upgrade-pod-description">${podData.description}</p>` : ''}
  </div>`;

  return html;
}
