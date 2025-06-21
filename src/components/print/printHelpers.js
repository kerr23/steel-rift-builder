// Utility functions for print components

/**
 * Generates HTML for structure bubbles with threshold dividers
 * @param {Number} value - The number of structure points
 * @returns {String} HTML string representing structure points with dividers
 */
export function generateStructureBubbleHtml(value) {
  if (!value || value <= 0) return '<span class="placeholder-text-inline italic text-text-muted text-xs pl-1">N/A</span>';
  let html = '';
  for (let n = 1; n <= value; n++) {
    // Insert dividers after the correct pip, counting from left to right
    if (n === value - Math.floor(value * 0.25) && value >= 4) {
      html += '<span class="threshold-divider divider-green" style="display:inline-block;width:1.5px;height:10px;vertical-align:middle;background-color:var(--success-color);"></span>';
    }
    if (n === value - Math.floor(value * 0.5) && value >= 2) {
      html += '<span class="threshold-divider divider-yellow" style="display:inline-block;width:1.5px;height:10px;vertical-align:middle;background-color:#b38600;"></span>';
    }
    if (n === value - Math.floor(value * 0.75) && value >= 1) {
      html += '<span class="threshold-divider divider-red" style="display:inline-block;width:1.5px;height:10px;vertical-align:middle;background-color:var(--danger-color);"></span>';
    }
    html += '<span class="bubble" style="display:inline-block;width:9px;height:9px;border-radius:50%;border:1px solid #000;background:transparent;box-sizing:border-box;"></span>';
  }
  return html;
}

/**
 * Renders limited trait with bubble markers
 * @param {String} traitsHtml - HTML string containing traits
 * @returns {String} HTML with Limited trait bubbles rendered
 */
export function renderLimitedTraitWithBubbles(traitsHtml) {
  // Replace Limited(N) with Limited and N bubbles
  return traitsHtml.replace(/Limited\((\d+)\)/g, (match, count) => {
    let bubbles = '';
    for (let i = 0; i < Number(count); i++) {
      bubbles += '<span class="print-trait-bubble"></span>';
    }
    return `Limited${bubbles ? `(${bubbles})` : ''}`;
  });
}

/**
 * Generates HTML for unit title with roster information
 * @param {String} unitName - Name of the unit
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total roster base tonnage
 * @returns {String} HTML string for unit title
 */
export function generateUnitTitleHtml(unitName, rosterName, totalRosterBaseTonnage) {
  let html = `<h3 class="unit-title">
    <span class="unit-title-hev-name">${unitName}</span>`;

  if (rosterName) {
    html += `<span class="unit-title-roster-info">
      <span class="unit-title-roster-name">(${rosterName})</span>
      <span class="unit-title-total-tonnage">- ${totalRosterBaseTonnage}T Total</span>
    </span>`;
  } else {
    html += `<span class="unit-title-roster-info">
      <span class="unit-title-total-tonnage">${totalRosterBaseTonnage}T Total</span>
    </span>`;
  }

  html += `</h3>`;
  return html;
}

/**
 * Extracts trait names from a string containing traits
 * @param {String} traitsText - Text containing traits
 * @returns {Set} Set of unique trait names
 */
export function extractTraitNames(traitsText) {
  const traitNames = new Set();

  if (!traitsText) return traitNames;

  // Extract traits from the traits line
  const traitsList = traitsText.replace(/<strong>Traits:<\/strong>\s*/, '').split(/,\s*/);

  traitsList.forEach(trait => {
    // Parse complex traits to extract just the base trait name
    let baseTraitName = trait.trim();

    // Handle traits with numbers in parentheses like Limited(3)
    if (/\(\d+.*\)/.test(baseTraitName)) {
      baseTraitName = baseTraitName.split('(')[0].trim();
    }
    // Handle traits with other parameters like Blast(3")
    else if (/\(.*\)/.test(baseTraitName)) {
      baseTraitName = baseTraitName.split('(')[0].trim();
    }

    traitNames.add(baseTraitName);
  });

  return traitNames;
}

/**
 * Generates HTML for trait definitions
 * @param {Set|Array} traitNames - Set or Array of trait names
 * @param {Object} traitDefinitions - Object mapping trait names to definitions
 * @returns {String} HTML string for trait definitions
 */
export function generateTraitDefinitionsHtml(traitNames, traitDefinitions) {
  if (!traitNames || traitNames.size === 0) return '';

  let html = `<div class="equipment-section trait-definitions-section">
    <h4 class="section-title">Trait Definitions</h4>
    <ul class="trait-list">`;

  const sortedTraitNames = Array.from(traitNames).sort();
  sortedTraitNames.forEach((traitName) => {
    // Only include traits that have definitions
    if (traitDefinitions?.[traitName]) {
      html += `<li><strong>${traitName}:</strong> ${traitDefinitions[traitName]}</li>`;
    }
  });

  html += `</ul></div>`;
  return html;
}
