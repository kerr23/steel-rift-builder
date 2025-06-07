// Utility for generating print HTML for Steel Rift Force Builder
// Extracted from App.vue for maintainability

export function generatePrintHtml({
  roster,
  rosterName,
  totalRosterBaseTonnage,
  getBaseTonnage,
  findDieObjectPrint,
  generateBubbleHtml,
  getModificationText,
  formatPrintTrait,
  gameRulesData
}) {
  const cssLink = '<link rel="stylesheet" href="print.css">'
  let htmlBody = `
    <button class="no-print" onclick="window.print()">Print this page</button>
    <div class="print-header">
      <h1>${rosterName || 'Unnamed Roster'}</h1>
    </div>
  `
  roster.forEach((unit) => {
    if (!unit || !unit.selectedClass) return
    const unitClassName = unit.selectedClass.name
    const baseArmorDie = findDieObjectPrint(unit.selectedClass.defaultArmorDie)
    const baseStructDie = findDieObjectPrint(unit.selectedClass.defaultStructureDie)
    const unitBaseMovement = unit.selectedClass?.baseMovement ?? 0
    const unitHasJumpJets = unit.selectedUpgrades?.some((upg) => upg.id === 'u3' || upg.id === 'u6') ?? false
    let unitJumpMovement = 0
    if (unitHasJumpJets) {
      if (unitBaseMovement === 12) unitJumpMovement = 10
      else if (unitBaseMovement === 10) unitJumpMovement = 8
      else if (unitBaseMovement === 8) unitJumpMovement = 6
      else if (unitBaseMovement === 6) unitJumpMovement = 4
    }
    const uniqueUnitTraitNames = new Set()
    if (unit.selectedWeapons && unit.selectedWeapons.length > 0) {
      unit.selectedWeapons.forEach((weaponInstance) => {
        const weaponData = gameRulesData.weapons.find((w) => w.id === weaponInstance.id)
        if (weaponData?.traits?.length) {
          weaponData.traits.forEach((traitObj) => {
            if (typeof traitObj === 'object' && traitObj !== null && traitObj.name) {
              uniqueUnitTraitNames.add(traitObj.name)
            } else if (typeof traitObj === 'string') {
              uniqueUnitTraitNames.add(traitObj)
            }
          })
        }
      })
    }
    if (unit.selectedUpgrades && unit.selectedUpgrades.length > 0) {
      unit.selectedUpgrades.forEach((upgradeInstance) => {
        if (upgradeInstance?.traits?.length) {
          upgradeInstance.traits.forEach((traitStr) => {
            if (typeof traitStr === 'object' && traitStr !== null && traitStr.name) {
              uniqueUnitTraitNames.add(traitStr.name)
            } else if (typeof traitStr === 'string') {
              uniqueUnitTraitNames.add(traitStr)
            }
          })
        }
      })
    }
    htmlBody += `<div class="unit-card">`
    htmlBody += `<h3 class="unit-title">
      <span class="unit-title-hev-name">${unit.unitName || 'Unnamed HE-V'}</span>`
    if (rosterName) {
      htmlBody += `<span class="unit-title-roster-info">
        <span class="unit-title-roster-name">(${rosterName})</span>
        <span class="unit-title-total-tonnage">- ${totalRosterBaseTonnage}T Total</span>
      </span>`
    } else {
      htmlBody += `<span class="unit-title-roster-info">
        <span class="unit-title-total-tonnage">${totalRosterBaseTonnage}T Total</span>
      </span>`
    }
    htmlBody += `</h3>`
    htmlBody += `<div class="section-wrapper class-defense-wrapper">`
    htmlBody += `<div class="form-section class-section">
      <h4 class="section-title">Classification</h4>
      <p><strong>Class:</strong> ${unitClassName}</p>
      <p><strong>Motive:</strong> ${unit.selectedMotiveType?.name || 'Standard'}</p>
      <p><strong>Movement:</strong> ${unitBaseMovement}"</p>`
    if (unitHasJumpJets) {
      htmlBody += `<p><strong>Jump:</strong> ${unitJumpMovement}"</p>`
    }
    htmlBody += `<p><strong>Unit Tonnage:</strong> ${getBaseTonnage(unit) || '?'}</p>`
    if (unit.selectedMotiveType && unit.selectedMotiveType.description) {
      htmlBody += `<div class="motive-description-section">
        <h5 class="section-title">Motive Ability: ${unit.selectedMotiveType.name}</h5>
        <p class="motive-description-text">${unit.selectedMotiveType.description}</p>
      </div>`
    }
    htmlBody += `</div>`
    htmlBody += `<div class="form-section defense-section">
      <h4 class="section-title">Armor & Structure</h4>
      <div class="print-defense-layout-container">
        <div class="print-defense-row defense-roll-row">
          <span class="print-defense-label">Defense:</span>
          <span>${unit.selectedClass?.defenseRoll || '?'}</span>
        </div>
        <div class="print-defense-row armor-row">
          <span class="print-defense-label">Armor:</span>
          ${generateBubbleHtml(unit.effectiveArmorDie?.sides ?? 0, false)}
          ${getModificationText(baseArmorDie, unit.effectiveArmorDie)}
        </div>
        <div class="print-defense-row structure-row">
          <span class="print-defense-label">Structure:</span>
          ${generateStructureBubbleHtml(unit.effectiveStructureDie?.sides ?? 0)}
          ${getModificationText(baseStructDie, unit.effectiveStructureDie)}
        </div>`
    const structureSides = unit.effectiveStructureDie?.sides ?? 0
    if (structureSides > 0) {
      const yellowThresholdPips = Math.floor(structureSides * 0.75)
      const orangeThresholdPips = Math.floor(structureSides * 0.5)
      const redThresholdPips = Math.floor(structureSides * 0.25)
      const hasYellowThreshold = yellowThresholdPips < structureSides
      const hasOrangeThreshold = orangeThresholdPips < structureSides
      const hasRedThreshold = redThresholdPips < structureSides
      if (hasYellowThreshold || hasOrangeThreshold || hasRedThreshold) {
        htmlBody += `<div class="threshold-descriptions">`
        if (hasYellowThreshold)
          htmlBody += `<p class="threshold-desc-green"><strong>25% Dmg:</strong> All Move/Jump Orders -1</p>`
        if (hasOrangeThreshold)
          htmlBody += `<p class="threshold-desc-yellow"><strong>50% Dmg:</strong> Weapon Damage -1 (min 1)</p>`
        if (hasRedThreshold)
          htmlBody += `<p class="threshold-desc-red"><strong>75% Dmg:</strong> Only 1 Order per activation</p>`
        htmlBody += `</div>`
      }
    }
    if (unit.selectedClass && unit.selectedClass.special) {
      htmlBody += `<div class="print-special-attribute"><strong>Special:</strong> ${unit.selectedClass.special}</div>`
    }
    htmlBody += `</div></div>`
    htmlBody += `</div>`
    htmlBody += `<div class="equipment-section">
      <h4 class="section-title">Weapon Systems</h4>`
    if (unit.selectedWeapons && unit.selectedWeapons.length > 0) {
      htmlBody += `<table class="print-weapon-table">
        <thead>
          <tr>
            <th>Weapon</th>
            <th>Range</th>
            <th>Damage</th>
            <th>Traits</th>
          </tr>
        </thead>
        <tbody>`
      unit.selectedWeapons.forEach((weaponInstance) => {
        const weaponData = gameRulesData.weapons.find((w) => w.id === weaponInstance.id)
        if (weaponData) {
          const damage = weaponData.damageRating?.[unitClassName] ?? '?'
          const range = weaponData.rangeCategory || 'N/A'
          const traitsHtml =
            weaponData.traits
              ?.map((traitObj) => formatPrintTrait(traitObj, unitClassName))
              .join(', ') || 'None'
          htmlBody += `<tr>
            <td>${weaponData.name || 'Unknown'}</td>
            <td>${range}</td>
            <td>${damage}</td>
            <td>${traitsHtml}</td>
          </tr>`
        } else {
          htmlBody += `<tr>
            <td><i>Unknown Weapon (ID: ${weaponInstance.id})</i></td>
            <td>?</td>
            <td>?</td>
            <td>?</td>
          </tr>`
        }
      })
      htmlBody += `</tbody></table>`
    } else {
      htmlBody += `<table class="print-weapon-table"><tbody><tr class="placeholder-row"><td colspan="4"><i>No weapons equipped.</i></td></tr></tbody></table>`
    }
    htmlBody += `</div>`
    htmlBody += `<div class="equipment-section"><h4 class="section-title">Upgrades</h4>`
    if (unit.selectedUpgrades && unit.selectedUpgrades.length > 0) {
      htmlBody += `<ul class="item-list">`
      unit.selectedUpgrades.forEach((upgrade) => {
        if (upgrade && upgrade.name) {
          htmlBody += `<li>
            <div class="item-info-line">
              <span class="item-name">${upgrade.name}</span>`
          htmlBody += `</div>`
          if (upgrade.description) {
            htmlBody += `<p class="upgrade-description">${upgrade.description}</p>`
          }
          htmlBody += `</li>`
        } else {
          htmlBody += `<li><i>Unknown Upgrade</i></li>`
        }
      })
      htmlBody += `</ul>`
    } else {
      htmlBody += `<p class="placeholder-text-inline" style="text-align: center; padding: 0.5rem;"><i>None</i></p>`
    }
    htmlBody += `</div>`
    if (uniqueUnitTraitNames.size > 0) {
      htmlBody += `<div class="equipment-section trait-definitions-section">
        <h4 class="section-title">Trait Key</h4>
        <ul class="trait-list">`
      const sortedTraitNames = Array.from(uniqueUnitTraitNames).sort()
      sortedTraitNames.forEach((traitName) => {
        const definition = gameRulesData.traitDefinitions?.[traitName] || 'Definition not found.'
        htmlBody += `<li><strong>${traitName}:</strong> ${definition}</li>`
      })
      htmlBody += `</ul></div>`
    }
    htmlBody += `</div>` // End unit-card
  })
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Print Roster - ${rosterName || 'Unnamed'}</title>${cssLink}</head><body><div class="print-container">${htmlBody}</div></body></html>`
}

function generateStructureBubbleHtml(sides) {
  if (!sides || sides <= 0) return '<span class="placeholder-text-inline italic text-text-muted text-xs pl-1">N/A</span>';
  let html = '';
  for (let n = 1; n <= sides; n++) {
    // Insert dividers after the correct pip, counting from left to right
    if (n === sides - Math.floor(sides * 0.25) && sides >= 4) {
      html += '<span class="threshold-divider divider-green" style="display:inline-block;width:1.5px;height:10px;vertical-align:middle;background-color:var(--success-color);"></span>';
    }
    if (n === sides - Math.floor(sides * 0.5) && sides >= 2) {
      html += '<span class="threshold-divider divider-yellow" style="display:inline-block;width:1.5px;height:10px;vertical-align:middle;background-color:#b38600;"></span>';
    }
    if (n === sides - Math.floor(sides * 0.75) && sides >= 1) {
      html += '<span class="threshold-divider divider-red" style="display:inline-block;width:1.5px;height:10px;vertical-align:middle;background-color:var(--danger-color);"></span>';
    }
    html += '<span class="bubble" style="display:inline-block;width:9px;height:9px;border-radius:50%;border:1px solid #000;background:transparent;box-sizing:border-box;"></span>';
  }
  return html;
}
