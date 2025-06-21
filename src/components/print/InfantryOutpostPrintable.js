// Infantry Outpost print renderer
import { generateUnitTitleHtml, renderLimitedTraitWithBubbles, extractTraitNames, generateTraitDefinitionsHtml } from './printHelpers.js';

/**
 * Generates HTML for an Infantry Outpost
 * @param {Object} unit - The infantry outpost unit object
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total roster base tonnage
 * @param {Function} generateBubbleHtml - Function to generate bubble HTML
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML string for the infantry outpost
 */
export function generateInfantryOutpostHtml(unit, rosterName, totalRosterBaseTonnage, generateBubbleHtml, gameRulesData) {
  // Extract trait names for definitions
  const outpostTraitNames = new Set();

  if (Array.isArray(unit.details)) {
    unit.details.forEach(line => {
      if (/Traits:/.test(line)) {
        const traitsText = line.replace(/<strong>Traits:<\/strong>\s*/, '');
        extractTraitNames(traitsText).forEach(trait => outpostTraitNames.add(trait));
      }
    });
  }

  // Get all bunker sections
  const bunkerSections = parseBunkerSections(unit.details);

  // Start the HTML
  let html = `<div class="unit-card support-asset-card">`;

  // Add the title
  html += generateUnitTitleHtml('Infantry Outpost', rosterName, totalRosterBaseTonnage);

  // Equipment section
  html += `<div class="equipment-section">`;

  // Container for bunkers to lay them out side-by-side
  html += `<div class="bunker-container">`;

  // Render each bunker
  bunkerSections.forEach(bunker => {
    html += renderBunkerSection(bunker, generateBubbleHtml, gameRulesData, outpostTraitNames);
  });

  html += `</div>`; // End bunker-container
  html += `</div>`; // End equipment-section

  // Trait definitions section
  html += generateTraitDefinitionsHtml(outpostTraitNames, gameRulesData.traitDefinitions);

  html += `</div>`; // End unit-card
  return html;
}

/**
 * Parse bunker sections from the unit details
 * @param {Array} details - The unit details
 * @returns {Array} Array of bunker section objects
 */
function parseBunkerSections(details) {
  const bunkerSections = [];
  if (!Array.isArray(details)) return bunkerSections;

  let currentSection = null;
  let currentSectionDetails = [];

  // Process details to extract bunker sections
  for (let i = 0; i < details.length; i++) {
    const line = details[i];

    // Check if this is a bunker header
    if (line.includes('<u><strong>Bunker')) {
      // If we have a current section, add it to bunkerSections
      if (currentSection) {
        bunkerSections.push({
          title: currentSection,
          details: [...currentSectionDetails]
        });
        currentSectionDetails = [];
      }

      currentSection = line.replace(/<[^>]+>/g, '').trim();
    } else if (currentSection && !line.includes('Tonnage:') && !line.includes('<u><strong>')) {
      // Add details to current section
      currentSectionDetails.push(line);
    } else if (line.includes('<u><strong>') && !line.includes('Bunker')) {
      // Skip other headers
      continue;
    }
  }

  // Add the last section
  if (currentSection && currentSectionDetails.length > 0) {
    bunkerSections.push({
      title: currentSection,
      details: [...currentSectionDetails]
    });
  }

  return bunkerSections;
}

/**
 * Render a bunker section
 * @param {Object} bunker - Bunker section object
 * @param {Function} generateBubbleHtml - Function to generate bubble HTML
 * @param {Object} gameRulesData - Game rules data
 * @param {Set} outpostTraitNames - Set of trait names to collect
 * @returns {String} HTML for the bunker section
 */
function renderBunkerSection(bunker, generateBubbleHtml, gameRulesData, outpostTraitNames) {
  let html = `<div class="bunker-section">
    <h4 class="bunker-title">${bunker.title}</h4>`;

  // Parse the bunker details
  const bunkerData = parseBunkerData(bunker.details);

  // Render Armor and Structure bubbles for the bunker (Outpost stats)
  html += `
    <div class="bunker-stats flex flex-row items-center gap-4 mb-2">
      <span class="font-semibold mr-1">Armor:</span>
      ${generateBubbleHtml(8, false)}
      <span class="font-semibold mx-2">Structure:</span>
      ${generateBubbleHtml(3, true)}
    </div>
  `;

  // Render turret/weapon systems
  if (bunkerData.turrets.length > 0) {
    html += `<div class="bunker-turrets">
      <table class="print-weapon-table">
        <thead>
          <tr>
            <th>Weapon</th>
            <th>Range</th>
            <th>Damage</th>
            <th>Traits</th>
          </tr>
        </thead>
        <tbody>`;

    bunkerData.turrets.forEach(turret => {
      // Extract and add trait names to outpostTraitNames
      if (turret.traits) {
        extractTraitNames(turret.traits).forEach(trait => outpostTraitNames.add(trait));
      }

      html += `<tr>
        <td>${turret.name || 'Unknown'}</td>
        <td>${turret.range || 'N/A'}</td>
        <td>${turret.damage || 'N/A'}</td>
        <td>${renderLimitedTraitWithBubbles(turret.traits || 'None')}</td>
      </tr>`;
    });

    html += `</tbody>
      </table>
    </div>`;
  }

  // Render infantry units
  if (bunkerData.infantryUnits.length > 0) {
    html += `<div class="bunker-infantry">
      <h5 class="section-subtitle">Infantry Units</h5>
      <div class="infantry-units-grid">`;

    bunkerData.infantryUnits.forEach((infantry, index) => {
      // Extract and add trait names to outpostTraitNames
      if (infantry.traits) {
        extractTraitNames(infantry.traits).forEach(trait => outpostTraitNames.add(trait));
      }

      html += `<div class="infantry-unit">
        <div class="infantry-header">
          <h6 class="infantry-name">${infantry.name} - Unit ${index + 1}</h6>
          <div class="infantry-stats">
            ${infantry.speed ? `<span class="infantry-speed"><strong>Speed:</strong> ${infantry.speed}</span>` : ''}
            ${infantry.structure ? `<span class="infantry-structure"><strong>Structure:</strong> ${generateBubbleHtml(infantry.structure, true)}</span>` : ''}
          </div>
        </div>`;

      // Infantry traits
      if (infantry.traits) {
        html += `<div class="infantry-traits"><strong>Traits:</strong> ${renderLimitedTraitWithBubbles(infantry.traits)}</div>`;
      }

      // Infantry weapons
      if (infantry.weapons.length > 0) {
        html += `<table class="print-weapon-table infantry-weapon-table">
          <thead>
            <tr>
              <th>Weapon</th>
              <th>Dmg</th>
              <th>Range</th>
              <th>Traits</th>
            </tr>
          </thead>
          <tbody>`;

        infantry.weapons.forEach(weapon => {
          // Extract and add trait names from weapon traits
          if (weapon.traits) {
            extractTraitNames(weapon.traits).forEach(trait => outpostTraitNames.add(trait));
          }

          html += `<tr>
            <td>${weapon.name || 'Unknown'}</td>
            <td>${weapon.damage || 'N/A'}</td>
            <td>${weapon.range || 'N/A'}</td>
            <td>${renderLimitedTraitWithBubbles(weapon.traits || 'None')}</td>
          </tr>`;
        });

        html += `</tbody></table>`;
      }

      html += `</div>`; // End infantry-unit
    });

    html += `</div>`; // End infantry-units-grid
    html += `</div>`; // End bunker-infantry
  }

  html += `</div>`; // End bunker-section
  return html;
}

/**
 * Parse bunker data from bunker details
 * @param {Array} bunkerDetails - The bunker details
 * @returns {Object} Object with turrets and infantry units
 */
function parseBunkerData(bunkerDetails) {
  const data = {
    turrets: [],
    infantryUnits: []
  };

  if (!Array.isArray(bunkerDetails)) return data;

  let currentItem = null;
  let itemType = null;
  let currentInfantryUnit = null;

  bunkerDetails.forEach(line => {
    if (line.startsWith('<u>')) {
      // This is a weapon system or infantry squad
      currentItem = line.replace(/<\/?u>/g, '');

      // Check if it's an infantry unit - comprehensive detection of all infantry types
      // Common infantry keywords: Squad, Team, Engineer, Specialist, Command, Officer, etc.
      if (currentItem.includes('Squad') ||
          currentItem.includes('Team') ||
          currentItem.includes('Engineer') ||
          currentItem.includes('Specialist') ||
          currentItem.includes('Command') ||
          currentItem.includes('Officer') ||
          currentItem.includes('Infantry') ||
          currentItem.includes('Trooper') ||
          currentItem.includes('Soldier') ||
          currentItem.includes('Mechanic') ||
          currentItem.includes('Medic') ||
          currentItem.includes('Scout')) {
        itemType = 'infantry';

        // Extract count from name (e.g., "2x Rifle Squad")
        const countMatch = currentItem.match(/(\d+)x\s+/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 1;
        const name = currentItem.replace(/\d+x\s+/, '');

        // Create infantry units based on count
        for (let i = 0; i < count; i++) {
          data.infantryUnits.push({
            name,
            speed: null,
            structure: null,
            traits: null,
            weapons: []
          });
        }
      } else {
        itemType = 'turret';
        data.turrets.push({
          name: currentItem,
          damage: null,
          range: null,
          traits: null
        });
      }
    } else if (itemType === 'turret') {
      // Parse turret weapon details
      const currentTurret = data.turrets[data.turrets.length - 1];

      if (/Damage:/.test(line)) {
        const match = line.match(/<strong>Damage:<\/strong>\s*(.*)/i);
        if (match) currentTurret.damage = match[1];
      } else if (/Range:/.test(line)) {
        const match = line.match(/<strong>Range:<\/strong>\s*(.*)/i);
        if (match) currentTurret.range = match[1];
      } else if (/Traits:/.test(line)) {
        const match = line.match(/<strong>Traits:<\/strong>\s*(.*)/i);
        if (match) currentTurret.traits = match[1];
      }
    } else if (itemType === 'infantry') {
      // Parse infantry details

      if (/Speed:/.test(line)) {
        const match = line.match(/<strong>Speed:<\/strong>\s*(.*)/i);
        if (match) {
          // Apply speed to all infantry units of this type
          const speed = match[1];
          data.infantryUnits.forEach(unit => {
            if (unit.name === currentItem.replace(/\d+x\s+/, '')) {
              unit.speed = speed;
            }
          });
        }
      } else if (/Traits:/.test(line)) {
        const match = line.match(/<strong>Traits:<\/strong>\s*(.*)/i);
        if (match) {
          // Apply traits to all infantry units of this type
          const traits = match[1];
          data.infantryUnits.forEach(unit => {
            if (unit.name === currentItem.replace(/\d+x\s+/, '')) {
              unit.traits = traits;
            }
          });
        }
      } else if (line.startsWith('<strong>UNIT_START:</strong>')) {
        // Start of an individual infantry unit
        currentInfantryUnit = data.infantryUnits.find(unit =>
          unit.name === currentItem.replace(/\d+x\s+/, '') &&
          !unit.structure // Find first unit without structure
        );
      } else if (line.startsWith('<strong>UNIT_END</strong>')) {
        // End of an individual infantry unit
        currentInfantryUnit = null;
      } else if (currentInfantryUnit) {
        // Parse unit-specific details
        if (/Structure:/.test(line)) {
          const match = line.match(/<strong>Structure:<\/strong>\s*(\d+)/i);
          if (match && match[1]) {
            currentInfantryUnit.structure = parseInt(match[1], 10);
          }
        } else if (/WEAPON:/.test(line)) {
          const match = line.match(/<strong>WEAPON:<\/strong>\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)(?:\s*\|\s*(.*))?$/i);
          if (match) {
            const [, name, damage, range, traits] = match;
            currentInfantryUnit.weapons.push({
              name: name.trim(),
              damage: damage.trim(),
              range: range.trim(),
              traits: traits ? traits.trim() : null
            });
          }
        }
      }
    }
  });

  return data;
}
