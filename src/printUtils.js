// Utility for generating print HTML for Steel Rift Force Builder
// Extracted from App.vue for maintainability

export function generatePrintHtml({
  roster,
  rosterName,
  totalRosterBaseTonnage,
  getBaseTonnage,
  generateBubbleHtml,
  formatPrintTrait,
  gameRulesData
}) {
  // Ensure we have UL_HEV_UPGRADE_PODS in gameRulesData
  if (!gameRulesData.UL_HEV_UPGRADE_PODS) {
    // Import directly from gameData.js if not available in gameRulesData
    try {
      console.log('Importing UL_HEV_UPGRADE_PODS directly from gameData.js')
      const { UL_HEV_UPGRADE_PODS } = require('./gameData.js')
      gameRulesData.UL_HEV_UPGRADE_PODS = UL_HEV_UPGRADE_PODS
    } catch (e) {
      console.warn('UL_HEV_UPGRADE_PODS not found in gameRulesData and could not be imported:', e)
    }
  }
  const cssLink = '<link rel="stylesheet" href="print.css">'
  let htmlBody = `
    <button class="no-print" onclick="window.print()">Print this page</button>
    <div class="print-header">
      <h1>${rosterName || 'Unnamed Roster'}</h1>
    </div>
  `
  roster.forEach((unit) => {
    if (unit.isSupportAsset) {
      htmlBody += `<div class="unit-card support-asset-card">`
      htmlBody += `<h3 class="unit-title"><span class="unit-title-hev-name">${unit.type || 'Support Asset'}</span>`
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

      // Removed support asset details header and section as requested

      // Determine if this is a weapon system or support asset
      const isWeaponSystem = unit.details?.some(line => (/Damage:/.test(line) || /Range:/.test(line))) || false
      const isUltraLightSquad = unit.type?.includes('Squadron') || false

      if (isWeaponSystem) {
        // Display weapon-like support assets in a table format like HEVs
        htmlBody += `<div class="equipment-section">`
        htmlBody += `<h4 class="section-title">Weapon Systems</h4>`
        htmlBody += `<table class="print-weapon-table">
          <thead>
            <tr>
              <th>System</th>
              <th>Damage</th>
              <th>Traits</th>
            </tr>
          </thead>
          <tbody>`

        // Extract the relevant details
        let systemName = unit.type || 'Support System'
        let damage = 'N/A'
        let traits = 'None'
        let targeting = ''

        if (Array.isArray(unit.details)) {
          // Find damage value
          const damageDetail = unit.details.find(line => /Damage:/.test(line))
          if (damageDetail) {
            damage = damageDetail.replace(/<strong>Damage:<\/strong>\s*/, '')
          }

          // Find traits
          const traitsDetail = unit.details.find(line => /Traits:/.test(line) && /Limited\(\d+\)/.test(line))
          if (traitsDetail) {
            traits = renderLimitedTraitWithBubbles(traitsDetail.replace(/<strong>Traits:<\/strong>\s*/, ''))
          } else {
            const regularTraitsDetail = unit.details.find(line => /Traits:/.test(line))
            if (regularTraitsDetail) {
              traits = regularTraitsDetail.replace(/<strong>Traits:<\/strong>\s*/, '')
            }
          }

          // Find targeting restrictions
          const targetingDetail = unit.details.find(line => /Targeting Restriction:/.test(line))
          if (targetingDetail) {
            targeting = targetingDetail.replace(/<strong>Targeting Restriction:<\/strong>\s*/, '')
          }
        }

        htmlBody += `<tr>
          <td>${systemName}</td>
          <td class="text-center">${damage}</td>
          <td>${traits}</td>
        </tr>`

        htmlBody += `</tbody></table>`

        if (targeting) {
          htmlBody += `<div class="targeting-restriction">
            <p><strong>Targeting:</strong> ${targeting}</p>
          </div>`
        }

        // If there are any notes, display them
        if (Array.isArray(unit.details)) {
          const notes = unit.details.filter(line => /Note:/.test(line))
          if (notes.length > 0) {
            htmlBody += `<div class="support-asset-notes">
              <ul class="notes-list">`
            notes.forEach(note => {
              htmlBody += `<li>${note}</li>`
            })
            htmlBody += `</ul>
            </div>`
          }
        }

        htmlBody += `</div>`
      } else if (isUltraLightSquad) {
        // Enhanced display for Ultra-Light squadrons
        htmlBody += `<div class="equipment-section">`
        htmlBody += `<h4 class="section-title">Squadron Composition</h4>`

        // Create a nice table for the UL HE-V squadron
        htmlBody += `<div class="squadron-container">`

        // Group UL HE-Vs and their details
        let currentHEV = null
        let hevDetails = []
        const hevs = []

        if (Array.isArray(unit.details)) {
          unit.details.forEach(line => {
            if (/Tonnage:/.test(line) || /Squadron Composition:/.test(line)) {
              return // Skip tonnage and squadron composition lines
            }

            if (/<u>.*<\/u>/.test(line)) {
              // New HE-V found
              if (currentHEV) {
                hevs.push({ name: currentHEV, details: [...hevDetails] })
                hevDetails = []
              }
              currentHEV = line.replace(/<\/?u>/g, '')
            } else if (currentHEV && !line.startsWith('<strong>Upgrade Pod:</strong>')) {
              hevDetails.push(line)
            }
          })

          // Don't forget the last HE-V
          if (currentHEV && hevDetails.length > 0) {
            hevs.push({ name: currentHEV, details: [...hevDetails] })
          }
        }

        // Display each HE-V with its details
        htmlBody += `<div class="ultra-light-grid">`
        hevs.forEach(hev => {
          htmlBody += `<div class="ultra-light-card">
            <div class="ultra-light-name">${hev.name}</div>
            <ul class="ultra-light-details">`
          hev.details.forEach(detail => {
            htmlBody += `<li>${detail}</li>`
          })
          htmlBody += `</ul>
          </div>`
        })
        htmlBody += `</div>`

        htmlBody += `</div></div>` // End squadron-container and equipment-section

        // Add separate section for Upgrade Pod
        htmlBody += `<div class="equipment-section">`
        htmlBody += `<h4 class="section-title">Upgrade Pod</h4>`

        // Get upgradePodId from unit if available
        const upgradePodId = unit.upgradePodId || ''

        // Use UL_HEV_UPGRADE_PODS data if available in gameRulesData
        if (upgradePodId && gameRulesData.UL_HEV_UPGRADE_PODS) {
          // Find the upgrade pod data from gameRulesData
          const upgradePod = gameRulesData.UL_HEV_UPGRADE_PODS.find(pod => pod.id === upgradePodId)

          if (upgradePod) {
            htmlBody += `<div class="upgrade-pod-info">
              <h5>${upgradePod.name}</h5>
              <div class="upgrade-pod-details">`

            // Display damage if available and not N/A
            if (upgradePod.damage && upgradePod.damage !== 'N/A') {
              htmlBody += `<p><strong>Damage:</strong> ${upgradePod.damage}</p>`
            }

            // Display range if available and not N/A
            if (upgradePod.range && upgradePod.range !== 'N/A') {
              htmlBody += `<p><strong>Range:</strong> ${upgradePod.range}</p>`
            }

            // Display traits if available
            if (upgradePod.traits && upgradePod.traits.length > 0) {
              const traitsStr = upgradePod.traits.join(', ')
              const formattedTraits = /Limited\(\d+\)/.test(traitsStr)
                ? renderLimitedTraitWithBubbles(`<strong>Traits:</strong> ${traitsStr}`)
                : `<strong>Traits:</strong> ${traitsStr}`
              htmlBody += `<p>${formattedTraits}</p>`
            }

            // Display description if available
            if (upgradePod.description) {
              htmlBody += `<p class="upgrade-pod-description">${upgradePod.description}</p>`
            }

            htmlBody += `</div>
            </div>`
          } else {
            // Fallback to the old method if the pod is not found in gameRulesData
            const upgradePodLine = unit.details?.find(line => line.startsWith('<strong>Upgrade Pod:</strong>'))
            const upgradePodName = upgradePodLine ? upgradePodLine.replace('<strong>Upgrade Pod:</strong>', '').trim() : ''

            if (upgradePodName) {
              htmlBody += `<div class="upgrade-pod-info">
                <h5>${upgradePodName}</h5>
                <div class="upgrade-pod-details">`

              // Look for related attributes in unit.details
              if (Array.isArray(unit.details)) {
                // Find damage info (if any)
                const damageLine = unit.details.find(line => line.includes('<strong>Damage:</strong>'))
                if (damageLine) {
                  htmlBody += `<p>${damageLine}</p>`
                }

                // Find range info (if any)
                const rangeLine = unit.details.find(line => line.includes('<strong>Range:</strong>'))
                if (rangeLine) {
                  htmlBody += `<p>${rangeLine}</p>`
                }

                // Find traits info (if any)
                const traitsLine = unit.details.find(line => line.includes('<strong>Traits:</strong>'))
                if (traitsLine) {
                  htmlBody += `<p>${traitsLine}</p>`
                }

                // Find description (if any)
                const descriptionLines = unit.details.filter(line =>
                  !line.includes('<strong>') &&
                  !line.includes('Squadron Composition:') &&
                  !line.startsWith('<u>') &&
                  !line.includes('Tonnage:')
                )

                descriptionLines.forEach(line => {
                  if (line.trim()) {
                    htmlBody += `<p class="upgrade-pod-description">${line}</p>`
                  }
                })
              }

              htmlBody += `</div>
              </div>`
            }
          }
        } else {
          // If no upgrade pod data is available
          htmlBody += `<p class="placeholder-text-inline" style="text-align: center; padding: 0.5rem;"><i>No Upgrade Pod equipped</i></p>`
        }

        htmlBody += `</div>` // End equipment-section for Upgrade Pod
      } else {
        // Default display for other support assets
        htmlBody += `<div class="equipment-section">`
        htmlBody += `<h4 class="section-title">Support Asset Properties</h4>`
        htmlBody += `<ul class="item-list">`
        if (Array.isArray(unit.details)) {
          unit.details.forEach(line => {
            // Skip tonnage line completely as requested
            if (/Tonnage:/.test(line)) return
            // Skip Squadron Composition as we already rendered it elsewhere
            if (/Squadron Composition:/.test(line)) return

            // Format Limited trait with bubbles
            if (/Traits:/.test(line) && /Limited\(\d+\)/.test(line)) {
              htmlBody += `<li>
                <div class="item-info-line">
                  <span>${renderLimitedTraitWithBubbles(line)}</span>
                </div>
              </li>`
            }
            // Format HE-V details in the Ultra-Light squadron
            else if (/<u>.*<\/u>/.test(line)) {
              // This is a HE-V name in Ultra-Light Squadron
              htmlBody += `<li>
                <div class="item-info-line">
                  <span class="item-name">${line}</span>
                </div>
              </li>`
            }
            // For Upgrade Pod information
            else if (line.startsWith('<strong>Upgrade Pod:</strong>')) {
              htmlBody += `<li>
                <div class="item-info-line">
                  <span class="item-name">${line}</span>
                </div>
              </li>`
            }
            // For regular stats and properties
            else {
              htmlBody += `<li>
                <div class="item-info-line">
                  <span>${line}</span>
                </div>
              </li>`
            }
          })
        }
        htmlBody += `</ul></div>`
      }

      // Removed Limited bubble reminder as requested

      htmlBody += `</div>` // End unit-card
      return
    }
    if (!unit || !unit.selectedClass) return
    const unitClassName = unit.selectedClass.name
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
        </div>`
    const structureValue = unit.structureBaseValue ?? unit.effectiveStructure ?? 0
    if (structureValue > 0) {
      const yellowThresholdPips = Math.floor(structureValue * 0.75)
      const orangeThresholdPips = Math.floor(structureValue * 0.5)
      const redThresholdPips = Math.floor(structureValue * 0.25)
      const hasYellowThreshold = yellowThresholdPips < structureValue
      const hasOrangeThreshold = orangeThresholdPips < structureValue
      const hasRedThreshold = redThresholdPips < structureValue
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

function generateStructureBubbleHtml(value) {
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

function renderLimitedTraitWithBubbles(traitsHtml) {
  // Replace Limited(N) with Limited and N bubbles
  return traitsHtml.replace(/Limited\((\d+)\)/g, (match, count) => {
    let bubbles = ''
    for (let i = 0; i < Number(count); i++) {
      bubbles += '<span class="print-trait-bubble"></span>'
    }
    return `Limited${bubbles ? `(${bubbles})` : ''}`
  })
}
