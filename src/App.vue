<script setup>
import { ref, computed, watchEffect } from 'vue'
// Correct import capitalization
import HevCustomizer from './components/hevCustomizer.vue'
import { gameData as importedGameData } from './gameData.js'

// --- App State ---
const rosterName = ref('')
const roster = ref([])
const hevCustomizerRef = ref(null)
const gameRulesData = importedGameData
const fileInputRef = ref(null)
const versionTag = import.meta.env.VITE_GIT_COMMIT_SHA || 'dev'
const isDarkMode = ref(false)

// --- Computed Properties ---
const totalRosterTonnage = computed(() => {
  return roster.value.reduce((total, unit) => total + (unit?.totalUnitTonnage || 0), 0)
})

const getBaseTonnage = (unit) => {
  if (!unit.selectedClass || !gameRulesData?.classes) return 0
  const cls = gameRulesData.classes.find((c) => c.name === unit.selectedClass.name)
  return cls ? cls.baseTonnage : 0
}

const totalRosterBaseTonnage = computed(() => {
  return roster.value.reduce((total, unit) => total + getBaseTonnage(unit), 0)
})

// --- Methods ---
const addHevToRoster = (hevData) => {
  console.log('Adding HEV to roster:', hevData)
  roster.value.push({
    ...hevData,
    id: hevData.id || Date.now() + Math.random(),
  })
  if (hevCustomizerRef.value) {
    hevCustomizerRef.value.resetForm()
  } else {
    console.warn('Could not access hevCustomizerRef to reset form.')
  }
}

// --- Roster Manipulation ---
const removeHevFromRoster = (unitId) => {
  const index = roster.value.findIndex((unit) => unit.id === unitId)
  if (index !== -1) {
    roster.value.splice(index, 1)
  } else {
    console.warn(`Could not find HE-V with ID ${unitId} to remove.`)
  }
}

const editHev = (unitToEdit) => {
  if (!hevCustomizerRef.value) {
    console.error('Cannot edit: HevCustomizer ref not found.')
    alert('Error: Cannot access customizer.')
    return
  }
  if (!unitToEdit || unitToEdit.id === undefined) {
    console.error('Cannot edit: Invalid unit data.', unitToEdit)
    alert('Error: Invalid unit data.')
    return
  }
  hevCustomizerRef.value.loadHevForEditing(JSON.parse(JSON.stringify(unitToEdit)))
  removeHevFromRoster(unitToEdit.id)
}

// --- Print Formatting Helpers ---
const findDieObjectPrint = (dieString) => {
  if (!gameRulesData?.dice || !dieString) return null
  return gameRulesData.dice.find((d) => d.die === dieString)
}

const generateBubbleHtml = (sides, isStructureTrack = false) => {
  if (sides <= 0) return `<span class="placeholder-text-inline">N/A</span>`
  let bubblesHtml = ''
  const thresholds = isStructureTrack
    ? {
        markerYellow: sides > 0 ? sides - Math.floor(sides * 0.75) + 1 : 0,
        markerOrange: sides > 0 ? sides - Math.floor(sides * 0.5) + 1 : 0,
        markerRed: sides > 0 ? sides - Math.floor(sides * 0.25) + 1 : 0,
      }
    : null

  for (let n = 1; n <= sides; n++) {
    let bubbleClass = 'bubble'
    if (isStructureTrack && thresholds) {
      if (n === thresholds.markerYellow && thresholds.markerYellow <= sides)
        bubblesHtml += `<span class="threshold-divider divider-green"></span>`
      else if (n === thresholds.markerOrange && thresholds.markerOrange <= sides)
        bubblesHtml += `<span class="threshold-divider divider-yellow"></span>`
      else if (n === thresholds.markerRed && thresholds.markerRed <= sides)
        bubblesHtml += `<span class="threshold-divider divider-red"></span>`
    }
    if (!isStructureTrack) {
      bubbleClass += ' armor-bubble'
    }
    bubblesHtml += `<span class="${bubbleClass}"></span>`
  }
  return `<div class="bubble-display">${bubblesHtml}</div>`
}

const getModificationText = (baseDie, effectiveDie) => {
  if (!baseDie || !effectiveDie) return ''
  if (effectiveDie.step > baseDie.step)
    return ' <span class="modification-text">(Reinforced)</span>'
  if (effectiveDie.step < baseDie.step) return ' <span class="modification-text">(Stripped)</span>'
  return ''
}

const generateLimitedTraitBubbleHtml = (count) => {
  if (count <= 0) return ''
  let bubbles = ''
  for (let i = 0; i < count; i++) {
    bubbles += `<span class="print-trait-bubble"></span>`
  }
  return `(${bubbles})`
}

const formatPrintTrait = (traitObj, forClassName) => {
  if (typeof traitObj === 'string') return traitObj
  if (!traitObj || !traitObj.name) return 'Unknown Trait'

  if (traitObj.name === 'Limited' && traitObj.value !== undefined) {
    return `Limited${generateLimitedTraitBubbleHtml(traitObj.value)}`
  }
  if (typeof traitObj.value === 'object' && traitObj.value !== null) {
    if (forClassName && traitObj.value[forClassName] !== undefined) {
      return `${traitObj.name} ${traitObj.value[forClassName]}`
    } else {
      const classValues = Object.entries(traitObj.value)
        .map(([k, v]) => `${k[0]}:${v}`)
        .join('/')
      return `${traitObj.name} (${classValues})`
    }
  }
  if (traitObj.value !== undefined) {
    return `${traitObj.name} ${traitObj.value}`
  }
  return traitObj.name
}
// --- END Print Formatting Helpers ---

// --- Main Print Formatting Function ---
const formatForPrint = () => {
  console.log('Formatting for print...')
  try {
    // --- CSS Styles ---
    const cssStyles = `
            body { font-family: system-ui, sans-serif; line-height: 1.4; margin: 0; padding: 0; color: #212529; background-color: #fff; font-size: 14px; }
            * { box-sizing: border-box; }
            :root { --primary-color: #0d6efd; --secondary-color: #6c757d; --success-color: #198754; --danger-color: #dc3545; --warning-color: #ffc107; --black-color: #000000; --light-grey: #f8f9fa; --medium-grey: #e9ecef; --dark-grey: #343a40; --border-color: #dee2e6; --border-radius: 0.25rem; --text-muted: #6c757d; }

            .print-container { max-width: 900px; margin: 15px auto; padding: 10px; }
            .print-header { text-align: center; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
            .print-header h1 { margin: 0 0 3px 0; font-size: 1.6rem; font-weight: 500; }

            .unit-card { border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 10px; margin-bottom: 15px; page-break-inside: avoid !important; }

            .unit-title { display: flex; justify-content: space-between; align-items: baseline; font-size: 1.2rem; font-weight: 600; margin: 0 0 10px 0; padding: 0; color: var(--dark-grey); }
            .unit-title-hev-name { flex-grow: 1; margin-right: 1em; }
            .unit-title-roster-info { display: flex; align-items: baseline; font-size: 0.85rem; font-weight: 400; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
            .unit-title-roster-name { margin-right: 0.5em; }
            .unit-title-total-tonnage { font-weight: 500; color: var(--secondary-color); }

            .section-wrapper.class-defense-wrapper { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.8rem; align-items: stretch; }
            .form-section { flex: 1; min-width: 230px; display: flex; flex-direction: column; }
            .section-title { font-size: 0.9rem; color: var(--secondary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.2rem; margin-bottom: 0.5rem; font-weight: 500; }
            .class-section p { margin: 0.1rem 0; font-size: 0.85rem; display: flex; }
            .class-section p strong { display: inline-block; min-width: 100px; font-weight: bold; margin-right: 0.5em; }

            /* Motive Description Section Styles */
            .motive-description-section { margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px dashed var(--medium-grey); }
            .motive-description-section .section-title { font-size: 0.85rem; color: var(--secondary-color); border-bottom: none; padding-bottom: 0.1rem; margin-bottom: 0.3rem; font-weight: 600; }
            .motive-description-text { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-left: 0.5em; }
            .motive-description-text strong { font-weight: 600; color: var(--dark-grey); }


            /* Defense Section Styles */
            .defense-section { display: flex; flex-direction: column; }
            .print-defense-layout-container { display: flex; flex-direction: column; gap: 0.4rem; border: 1px solid var(--medium-grey); padding: 0.5rem; border-radius: var(--border-radius); flex-grow: 1; }
            .print-defense-row { display: flex; align-items: center; gap: 0.5rem; min-height: 20px; }
            .print-defense-label { font-weight: bold; min-width: 65px; text-align: left; flex-shrink: 0; font-size: 0.85rem; }
            .print-defense-row .bubble-display { display: flex; flex-wrap: nowrap; gap: 1.5px; align-items: left; flex-shrink: 0; min-width: 140px; overflow: hidden; }
            .bubble { display: inline-block; width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--black-color); flex-shrink: 0; background-color: transparent; box-sizing: border-box; }
            .bubble.armor-bubble { border-color: var(--success-color); }
            .threshold-divider { display: inline-block; width: 1.5px; height: 10px; margin: 0 1px; vertical-align: middle; flex-shrink: 0; }
            .divider-green { background-color: var(--success-color); }
            .divider-yellow { background-color: var(--warning-color); }
            .divider-red { background-color: var(--danger-color); }
            .placeholder-text-inline { font-style: italic; color: var(--text-muted); font-size: 0.75rem; padding-left: 5px; }
            .modification-text { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; margin-left: 0.2em; }
            .threshold-descriptions { margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed var(--border-color); font-size: 0.7rem; line-height: 1.2; }
            .threshold-descriptions p { margin: 0; display: flex;}
            .threshold-descriptions p strong { min-width: 50px; text-align: right; flex-shrink: 0; display: inline-block; font-weight: bold; margin-right: 3px; }
            .threshold-desc-green strong { color: var(--success-color); }
            .threshold-desc-yellow strong { color: #b38600; }
            .threshold-desc-red strong { color: var(--danger-color); }

            /* Equipment Sections & Tables/Lists */
            .equipment-section { margin-top: 0.8rem; }
            .print-weapon-table { width: 100%; border-collapse: collapse; margin-top: 0.4rem; font-size: 0.8rem; }
            .print-weapon-table th, .print-weapon-table td { border: 1px solid var(--border-color); padding: 0.2rem 0.4rem; text-align: left; vertical-align: top; }
            .print-weapon-table th { background-color: var(--light-grey); font-weight: 600; white-space: nowrap; }
            .print-weapon-table th:nth-child(2), .print-weapon-table td:nth-child(2) { text-align: center; width: 12%; white-space: nowrap; }
            .print-weapon-table th:nth-child(3), .print-weapon-table td:nth-child(3) { text-align: center; width: 12%; white-space: nowrap; }
            .print-weapon-table td:nth-child(4) { font-size: 0.75rem; color: var(--text-muted); }
            .print-weapon-table .placeholder-row td { text-align: center; padding: 0.4rem; font-style: italic; color: var(--text-muted); }

            .print-trait-bubble { display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 1px solid var(--secondary-color); background-color: transparent; margin: 0 1px; vertical-align: middle; box-sizing: border-box; }

            /* Updated Upgrade List Styles for Print */
            .item-list { list-style: none; padding: 0; margin: 0.4rem 0 0 0; border: 1px solid var(--border-color); border-radius: var(--border-radius); }
            .item-list li {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                padding: 0.3rem 0.6rem;
                border-bottom: 1px solid var(--medium-grey);
                font-size: 0.8rem;
            }
            .item-list li:last-child { border-bottom: none; }
            .item-list li i { color: var(--text-muted); font-style: italic; width: 100%; text-align: center; padding: 0.4rem; }
            .item-info-line {
                display: flex;
                flex-wrap: nowrap;
                align-items: baseline;
                gap: 0.5em;
                width: 100%;
            }
            .item-name { font-weight: 600; margin-right: auto; color: var(--dark-grey); }
            .item-stats { font-size: 0.9em; color: var(--secondary-color); white-space: nowrap; margin-left: 0.5em; }
            .item-traits { font-size: 0.85em; color: var(--text-muted); white-space: nowrap; margin-left: 0.5em; }
            .upgrade-description {
                font-size: 0.75rem;
                color: var(--text-muted);
                line-height: 1.3;
                margin-top: 0.25rem;
                padding-left: 0.5em;
                width: 100%;
            }


            /* Trait Definitions Section Styles */
            .trait-definitions-section { margin-top: 1rem; }
            .trait-definitions-section .section-title { margin-bottom: 0.3rem; }
            .trait-list { list-style: none; padding: 0.4rem 0.6rem; margin: 0; font-size: 0.75rem; line-height: 1.4; border: 1px solid var(--medium-grey); border-radius: var(--border-radius); background-color: var(--light-grey); }
            .trait-list li { margin-bottom: 0.25rem; }
            .trait-list li:last-child { margin-bottom: 0; }
            .trait-list li strong { font-weight: bold; color: var(--dark-grey); margin-right: 0.4em; }

            /* Print specific overrides */
            @media print {
                body { margin: 0; padding: 0; background-color: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 10pt; }
                .print-container { max-width: 100%; margin: 8mm; padding: 0; box-shadow: none; border: none; }
                .no-print { display: none !important; }
                .unit-card { border: 1px solid #ccc; margin-bottom: 8mm; }
            }
            .no-print { position: fixed; top: 10px; right: 10px; padding: 5px 10px; background-color: #ddd; border: 1px solid #aaa; border-radius: 4px; cursor: pointer; z-index: 1000;}
        `

    // --- HTML Body Generation ---
    let htmlBody = `
            <button class="no-print" onclick="window.print()">Print this page</button>
            <div class="print-header>
                <h1>${rosterName.value || 'Unnamed Roster'}</h1>
            </div>
        `

    roster.value.forEach((unit) => {
      if (!unit || !unit.selectedClass) return
      const unitClassName = unit.selectedClass.name
      const baseArmorDie = findDieObjectPrint(unit.selectedClass.defaultArmorDie)
      const baseStructDie = findDieObjectPrint(unit.selectedClass.defaultStructureDie)

      const unitBaseMovement = unit.selectedClass?.baseMovement ?? 0
      const unitHasJumpJets =
        unit.selectedUpgrades?.some((upg) => upg.id === 'u3' || upg.id === 'u6') ?? false
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
            // Check if upgrade has traits array
            upgradeInstance.traits.forEach((traitStr) => {
              // If upgrade traits can also be objects, add similar handling as for weapons
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
      if (rosterName.value) {
        htmlBody += `<span class="unit-title-roster-info">
                               <span class="unit-title-roster-name">(${rosterName.value})</span>
                               <span class="unit-title-total-tonnage">- ${totalRosterBaseTonnage.value}T Total</span>
                             </span>`
      } else {
        htmlBody += `<span class="unit-title-roster-info">
                               <span class="unit-title-total-tonnage">${totalRosterBaseTonnage.value}T Total</span>
                             </span>`
      }
      htmlBody += `</h3>`

      htmlBody += `<div class="section-wrapper class-defense-wrapper">`

      // Classification Section with Motive Description
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
      htmlBody += `</div>` // End class-section

      // Defense Section
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
                                    ${generateBubbleHtml(unit.effectiveStructureDie?.sides ?? 0, true)}
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
      // Display special attribute if present
      if (unit.selectedClass && unit.selectedClass.special) {
        htmlBody += `<div class="print-special-attribute"><strong>Special:</strong> ${unit.selectedClass.special}</div>`
      }
      htmlBody += `</div></div>`
      htmlBody += `</div>`

      // Weapon Systems Section
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

      // Upgrades Section
      htmlBody += `<div class="equipment-section"><h4 class="section-title">Upgrades</h4>`
      if (unit.selectedUpgrades && unit.selectedUpgrades.length > 0) {
        htmlBody += `<ul class="item-list">`
        unit.selectedUpgrades.forEach((upgrade) => {
          if (upgrade && upgrade.name) {
            htmlBody += `<li>
                                       <div class="item-info-line">
                                         <span class="item-name">${upgrade.name}</span>`
            htmlBody += `</div>` // End item-info-line
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

      // Trait Definitions Section
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

    const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Print Roster - ${rosterName.value || 'Unnamed'}</title><style>${cssStyles}</style></head><body><div class="print-container">${htmlBody}</div></body></html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(fullHtml)
      printWindow.document.close()
    } else {
      alert("Could not open print window. Please check your browser's popup blocker settings.")
    }
  } catch (error) {
    console.error('Error formatting for print:', error)
    alert('Failed to format roster for printing. Check console for details.')
  }
} // End formatForPrint

// --- Export/Import Functionality ---
const exportRosterJson = () => {
  try {
    const dataToExport = { rosterName: rosterName.value, roster: roster.value }
    const jsonString = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filename = `${rosterName.value || 'SteelRiftRoster'}.json`.replace(/[^a-z0-9._-]/gi, '_')
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('Roster exported successfully.')
  } catch (error) {
    console.error('Error exporting roster:', error)
    alert('Failed to export roster. Check console for details.')
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const importRosterJson = (event) => {
  const file = event.target.files ? event.target.files[0] : null
  if (!file) {
    return
  }
  if (file.type !== 'application/json') {
    alert(`Invalid file type (${file.type}). Please select a .json file.`)
    event.target.value = null
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      const importedData = JSON.parse(content)
      if (typeof importedData.rosterName === 'string' && Array.isArray(importedData.roster)) {
        const validUnits = importedData.roster.filter(
          (unit) =>
            unit &&
            typeof unit === 'object' &&
            unit.selectedClass &&
            unit.effectiveArmorDie &&
            unit.effectiveStructureDie &&
            Array.isArray(unit.selectedWeapons) &&
            Array.isArray(unit.selectedUpgrades) &&
            typeof unit.totalUnitTonnage === 'number' &&
            unit.id !== undefined,
        )
        if (validUnits.length !== importedData.roster.length) {
          const skippedCount = importedData.roster.length - validUnits.length
          console.warn(
            `${skippedCount} unit(s) in the imported file were invalid/incomplete and were skipped.`,
          )
          alert(
            `Import Warning: ${skippedCount} unit(s) were skipped due to missing or invalid data.`,
          )
        }
        rosterName.value = importedData.rosterName
        roster.value = validUnits
        console.log(`Roster imported successfully. ${validUnits.length} units loaded.`)
        alert(
          `Roster '${importedData.rosterName || 'Unnamed'}' imported successfully! ${validUnits.length} units loaded.`,
        )
      } else {
        throw new Error(
          "Invalid JSON structure. Expected 'rosterName' (string) and 'roster' (array).",
        )
      }
    } catch (error) {
      console.error('Error parsing/validating imported JSON:', error)
      alert(`Failed to import roster: ${error.message}`)
    } finally {
      if (event.target) event.target.value = null
    }
  }
  reader.onerror = (e) => {
    console.error('Error reading file:', e)
    alert('Failed to read the selected file.')
    if (event.target) event.target.value = null
  }
  reader.readAsText(file)
}
// --- END Export/Import Functionality ---

watchEffect(() => {
  const html = document.documentElement
  if (isDarkMode.value) {
    html.classList.add('dark-theme')
  } else {
    html.classList.remove('dark-theme')
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}
</script>

<template>
  <div id="app" class="container">
    <button
      class="dark-mode-toggle"
      :aria-pressed="isDarkMode.value"
      @click="toggleDarkMode"
      title="Toggle dark mode"
    >
      {{ isDarkMode.value ? '☀️ Light Mode' : '🌙 Dark Mode' }}
    </button>
    <span class="version-tag">v{{ versionTag }}</span>
    <h1>Steel Rift Force Roster & HE-V Customizer</h1>

    <!-- Roster Management Section -->
    <section class="roster-manager card">
      <h2>Roster Management</h2>
      <div class="form-group">
        <label for="rosterName">Roster Name:</label>
        <input type="text" id="rosterName" v-model="rosterName" placeholder="Enter Roster Name" />
      </div>
      <div class="roster-summary">
        <h3>
          Roster Units <span class="tonnage-badge">(Total: {{ totalRosterTonnage }} T)</span>
        </h3>
        <ul v-if="roster.length > 0">
          <li v-for="unit in roster" :key="unit.id" class="roster-item">
            <div class="roster-item-info">
              <span class="roster-item-name">{{ unit.unitName || 'Unnamed HE-V' }}</span>
              <span class="roster-item-details">
                ({{ unit.selectedClass?.name || 'N/A' }} /
                {{ unit.selectedMotiveType?.name || 'Standard' }}) [A:{{
                  unit.effectiveArmorDie?.die || '?'
                }}
                S:{{ unit.effectiveStructureDie?.die || '?' }}] -
                {{ unit.totalUnitTonnage ?? '?' }} T
              </span>
            </div>
            <div class="roster-item-actions">
              <button @click="editHev(unit)" class="btn btn-edit" title="Edit this HE-V">
                Edit
              </button>
              <button
                @click="removeHevFromRoster(unit.id)"
                class="btn btn-remove-roster"
                title="Remove this HE-V"
              >
                Remove
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="placeholder-text">No HE-Vs added to the roster yet.</p>
      </div>
      <div class="action-buttons">
        <input
          type="file"
          ref="fileInputRef"
          @change="importRosterJson"
          accept=".json,application/json"
          style="display: none"
        />
        <button
          @click="triggerFileInput"
          class="btn btn-secondary"
          title="Load roster from a JSON file"
        >
          Import Roster (JSON)
        </button>
        <button
          @click="exportRosterJson"
          :disabled="roster.length === 0 && !rosterName"
          class="btn btn-info"
          title="Save current roster to a JSON file"
        >
          Export Roster (JSON)
        </button>
        <button
          @click="formatForPrint"
          :disabled="roster.length === 0"
          class="btn btn-warning"
          title="Open a printer-friendly version of the roster"
        >
          Format for Print
        </button>
      </div>
    </section>

    <hr class="divider" />

    <HevCustomizer ref="hevCustomizerRef" :game-rules="gameRulesData" @add-hev="addHevToRoster" />
  </div>
</template>

<!-- Styles are in src/assets/main.css and src/components/hevCustomizer.css -->
<style>
.version-tag {
  position: fixed;
  top: 16px;
  right: 160px;
  z-index: 2000;
  background: var(--card-bg-color);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 1rem;
  font-family: monospace;
  opacity: 0.85;
  pointer-events: none;
}
.dark-mode-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2000;
  background: var(--card-bg-color);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
body,
.dark-mode,
body.dark-mode {
  background: var(--bg-color) !important;
  color: var(--text-color) !important;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.card,
.unit-card,
.form-section,
.section-title,
.print-defense-layout-container,
.print-weapon-table th,
.print-weapon-table td,
.item-list,
.trait-list,
.no-print {
  background: var(--card-bg-color) !important;
  color: var(--text-color) !important;
  border-color: var(--border-color) !important;
  font-weight: 500;
}
.section-title {
  color: var(--secondary-color) !important;
  border-bottom-color: var(--border-color) !important;
  font-weight: 600;
}
.print-special-attribute {
  color: var(--warning-color) !important;
  font-weight: 600;
}
.threshold-desc-green strong { color: var(--success-color) !important; }
.threshold-desc-yellow strong { color: var(--warning-color) !important; }
.threshold-desc-red strong { color: var(--danger-color) !important; }
</style>
