// HE-V specific print renderer
import { generateUnitTitleHtml, generateStructureBubbleHtml, generateTraitDefinitionsHtml } from './printHelpers.js';

/**
 * Generates HTML for an HE-V unit
 * @param {Object} unit - The HE-V unit object
 * @param {String} rosterName - Name of the roster
 * @param {Number} totalRosterBaseTonnage - Total roster base tonnage
 * @param {Function} getBaseTonnage - Function to calculate base tonnage
 * @param {Function} generateBubbleHtml - Function to generate bubble HTML
 * @param {Function} formatPrintTrait - Function to format print traits
 * @param {Object} gameRulesData - Game rules data
 * @returns {String} HTML string for the HE-V unit
 */
export function generateHevHtml(unit, rosterName, totalRosterBaseTonnage, getBaseTonnage, generateBubbleHtml, formatPrintTrait, gameRulesData) {
  // Extract unit details
  const unitClassName = unit.selectedClass?.name || 'Unknown';
  const unitBaseMovement = unit.effectiveMovement || unit.selectedClass?.baseMovement || 4;
  const unitHasJumpJets = unit.hasJumpJets || false;
  const unitJumpMovement = unitHasJumpJets ? (unit.jumpMovement || unitBaseMovement) : 0;

  // Extract unique trait names for defintiions
  const uniqueUnitTraitNames = new Set();

  // Collect trait names from weapons
  if (Array.isArray(unit.selectedWeapons)) {
    unit.selectedWeapons.forEach(weaponInstance => {
      const weaponData = gameRulesData.weapons.find(w => w.id === weaponInstance.id);
      if (weaponData && Array.isArray(weaponData.traits)) {
        weaponData.traits.forEach(traitObj => {
          let traitStr;
          if (typeof traitObj === 'object' && traitObj.name) {
            traitStr = traitObj.name;
          } else if (typeof traitObj === 'string') {
            traitStr = traitObj;
          }
          if (traitStr) {
            uniqueUnitTraitNames.add(traitStr);
          }
        });
      }
    });
  }

  let html = `<div class="unit-card">`;

  // Generate the title section
  html += generateUnitTitleHtml(unit.unitName || 'Unnamed HE-V', rosterName, totalRosterBaseTonnage);

  // Generate classification and defense sections
  html += `<div class="section-wrapper class-defense-wrapper">`;
  html += `<div class="form-section class-section">
    <h4 class="section-title">Classification</h4>
    <p><strong>Class:</strong> ${unitClassName}</p>
    <p><strong>Motive:</strong> ${unit.selectedMotiveType?.name || 'Standard'}</p>
    <p><strong>Movement:</strong> ${unitBaseMovement}"</p>`;

  if (unitHasJumpJets) {
    html += `<p><strong>Jump:</strong> ${unitJumpMovement}"</p>`;
  }

  html += `<p><strong>Unit Tonnage:</strong> ${getBaseTonnage(unit) || '?'}</p>`;

  if (unit.selectedMotiveType && unit.selectedMotiveType.description) {
    html += `<div class="motive-description-section">
      <h5 class="section-title">Motive Ability: ${unit.selectedMotiveType.name}</h5>
      <p class="motive-description-text">${unit.selectedMotiveType.description}</p>
    </div>`;
  }

  html += `</div>`;

  // Defense section with armor and structure
  html += `<div class="form-section defense-section">
    <h4 class="section-title">Armor & Structure</h4>
    <div class="print-defense-layout-container">
      <div class="print-defense-row defense-roll-row">
        <span class="print-defense-label">Defense:</span>
        <span>${unit.selectedClass?.defenseRoll || '?'}</span>
      </div>
      <div class="print-defense-row armor-row">
        <span class="print-defense-label">Armor:</span>
        <span class="bubble-display">
          ${generateBubbleHtml(
            unit.armorBaseValue ?? unit.effectiveArmor ?? 0,
            false
          )}
        </span>
      </div>
      <div class="print-defense-row structure-row">
        <span class="print-defense-label">Structure:</span>
        <span class="bubble-display">
          ${generateStructureBubbleHtml(
            unit.structureBaseValue ?? unit.effectiveStructure ?? 0
          )}
        </span>
      </div>`;

  // Add structure threshold descriptions
  const structureValue = unit.structureBaseValue ?? unit.effectiveStructure ?? 0;
  if (structureValue > 0) {
    const yellowThresholdPips = Math.floor(structureValue * 0.75);
    const orangeThresholdPips = Math.floor(structureValue * 0.5);
    const redThresholdPips = Math.floor(structureValue * 0.25);
    const hasYellowThreshold = yellowThresholdPips < structureValue;
    const hasOrangeThreshold = orangeThresholdPips < structureValue;
    const hasRedThreshold = redThresholdPips < structureValue;

    if (hasYellowThreshold || hasOrangeThreshold || hasRedThreshold) {
      html += `<div class="threshold-descriptions">`;
      if (hasYellowThreshold)
        html += `<p class="threshold-desc-green"><strong>25% Dmg:</strong> All Move/Jump Orders -1</p>`;
      if (hasOrangeThreshold)
        html += `<p class="threshold-desc-yellow"><strong>50% Dmg:</strong> Weapon Damage -1 (min 1)</p>`;
      if (hasRedThreshold)
        html += `<p class="threshold-desc-red"><strong>75% Dmg:</strong> Only 1 Order per activation</p>`;
      html += `</div>`;
    }
  }

  if (unit.selectedClass && unit.selectedClass.special) {
    html += `<div class="print-special-attribute"><strong>Special:</strong> ${unit.selectedClass.special}</div>`;
  }

  html += `</div></div>`;
  html += `</div>`;

  // Weapons section
  html += `<div class="equipment-section">
    <h4 class="section-title">Weapon Systems</h4>`;

  if (unit.selectedWeapons && unit.selectedWeapons.length > 0) {
    html += `<table class="print-weapon-table">
      <thead>
        <tr>
          <th>Weapon</th>
          <th>Range</th>
          <th>Damage</th>
          <th>Traits</th>
        </tr>
      </thead>
      <tbody>`;

    unit.selectedWeapons.forEach((weaponInstance) => {
      const weaponData = gameRulesData.weapons.find((w) => w.id === weaponInstance.id);
      if (weaponData) {
        const damage = weaponData.damageRating?.[unitClassName] ?? '?';
        const range = weaponData.rangeCategory || 'N/A';
        const traitsHtml =
          weaponData.traits
            ?.map((traitObj) => formatPrintTrait(traitObj, unitClassName))
            .join(', ') || 'None';

        html += `<tr>
          <td>${weaponData.name || 'Unknown'}</td>
          <td>${range}</td>
          <td>${damage}</td>
          <td>${traitsHtml}</td>
        </tr>`;
      } else {
        html += `<tr>
          <td><i>Unknown Weapon (ID: ${weaponInstance.id})</i></td>
          <td>?</td>
          <td>?</td>
          <td>?</td>
        </tr>`;
      }
    });

    html += `</tbody></table>`;
  } else {
    html += `<table class="print-weapon-table"><tbody><tr class="placeholder-row"><td colspan="4"><i>No weapons equipped.</i></td></tr></tbody></table>`;
  }

  html += `</div>`;

  // Upgrades section
  html += `<div class="equipment-section"><h4 class="section-title">Upgrades</h4>`;

  if (unit.selectedUpgrades && unit.selectedUpgrades.length > 0) {
    html += `<ul class="item-list">`;
    unit.selectedUpgrades.forEach((upgrade) => {
      if (upgrade && upgrade.name) {
        html += `<li>
          <div class="item-info-line">
            <span class="item-name">${upgrade.name}</span>`;
        html += `</div>`;
        if (upgrade.description) {
          html += `<p class="upgrade-description">${upgrade.description}</p>`;
        }
        html += `</li>`;
      } else {
        html += `<li><i>Unknown Upgrade</i></li>`;
      }
    });
    html += `</ul>`;
  } else {
    html += `<p class="placeholder-text-inline" style="text-align: center; padding: 0.5rem;"><i>None</i></p>`;
  }

  html += `</div>`;

  // Trait definitions section
  html += generateTraitDefinitionsHtml(uniqueUnitTraitNames, gameRulesData.traitDefinitions);

  html += `</div>`; // End unit-card

  return html;
}
