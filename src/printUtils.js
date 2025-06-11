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
  // Check if UL_HEV_WEAPONS is available in gameRulesData
  if (!gameRulesData.UL_HEV_WEAPONS) {
    console.warn('UL_HEV_WEAPONS not found in gameRulesData')
  }
  // Check if UL_HEV_UPGRADE_PODS is available in gameRulesData
  if (!gameRulesData.UL_HEV_UPGRADE_PODS) {
    console.warn('UL_HEV_UPGRADE_PODS not found in gameRulesData')
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
      const isUltraLightSquad = unit.type?.includes('Squadron') || false      // Extract unique trait names for support assets
      const supportAssetTraitNames = new Set()
      if (Array.isArray(unit.details)) {
        unit.details.forEach(line => {
          if (/Traits:/.test(line)) {
            // Extract traits from the traits line
            const traitsText = line.replace(/<strong>Traits:<\/strong>\s*/, '')
            const traitsList = traitsText.split(/,\s*/)

            traitsList.forEach(trait => {
              // Parse complex traits to extract just the base trait name
              let baseTraitName = trait.trim()

              // Handle traits with numbers in parentheses like Limited(3)
              if (/\(\d+.*\)/.test(baseTraitName)) {
                baseTraitName = baseTraitName.split('(')[0].trim()
              }

              // Handle traits with other parameters like Blast(3")
              else if (/\(.*\)/.test(baseTraitName)) {
                baseTraitName = baseTraitName.split('(')[0].trim()
              }

              supportAssetTraitNames.add(baseTraitName)
            })
          }
        })
      }

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

        // Add trait definitions section for weapon systems if there are any traits
        if (supportAssetTraitNames.size > 0) {
          htmlBody += `<div class="equipment-section trait-definitions-section">
            <h4 class="section-title">Trait Definitions</h4>
            <ul class="trait-list">`
          const sortedTraitNames = Array.from(supportAssetTraitNames).sort()
          sortedTraitNames.forEach((traitName) => {
            // Only include traits that have definitions
            if (gameRulesData.traitDefinitions?.[traitName]) {
              htmlBody += `<li><strong>${traitName}:</strong> ${gameRulesData.traitDefinitions[traitName]}</li>`
            }
          })
          htmlBody += `</ul></div>`
        }
      } else if (isUltraLightSquad) {
        // Enhanced display for Ultra-Light squadrons
        htmlBody += `<div class="equipment-section">`
        // htmlBody += `<h4 class="section-title">Squadron Composition</h4>`

        // // Add common Ultra-Light HE-V squadron traits
        // htmlBody += `<div class="squadron-common-traits">
        //   <p><strong>Common Squadron Traits:</strong> Ultra-Light, Squadron, Close Support, All-Terrain</p>
        // </div>`

        // We'll add traits based on what's actually used in the HE-V details

        // Create a nice table for the UL HE-V squadron
        htmlBody += `<div class="squadron-container">`

        // Group UL HE-Vs and their details
        let currentHEV = null
        let hevDetails = []
        const hevs = []

        if (Array.isArray(unit.details)) {
          // Extract traits from all HE-V details
          unit.details.forEach(detail => {
            if (/Traits:/.test(detail)) {
              const traitsText = detail.replace(/<strong>Traits:<\/strong>\s*/, '');
              traitsText.split(/,\s*/).forEach(trait => {
                // Extract base trait name
                let baseTraitName = trait.trim();
                // Handle traits with parameters
                if (baseTraitName.includes('(')) {
                  baseTraitName = baseTraitName.split('(')[0].trim();
                }
                // Handle traits with spaces
                if (baseTraitName.includes(' ')) {
                  baseTraitName = baseTraitName.split(' ')[0].trim();
                }
                // Only add actual traits (skip empty strings)
                if (baseTraitName) {
                  supportAssetTraitNames.add(baseTraitName);
                }
              });
            }
          });

          // Now process details to build the HE-V cards
          unit.details.forEach(line => {
            if (/Tonnage:/.test(line) || /Squadron Composition:/.test(line)) {
              return // Skip tonnage and squadron composition lines
            }

            if (/<u>.*<\/u>/.test(line)) {
              // New HE-V found
              if (currentHEV) {
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
                  armor: armorValue // Store the armor value with each HE-V
                })
                hevDetails = []
              }
              currentHEV = line.replace(/<\/?u>/g, '')
            } else if (currentHEV && !line.startsWith('<strong>Upgrade Pod:</strong>')) {
              hevDetails.push(line)
            }
          })

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
              armor: armorValue // Store the armor value with each HE-V
            })
          }
        }

        // Add Defense section for the squadron
        htmlBody += `<div class="print-defense-layout-container">
          <div class="print-defense-row defense-roll-row">
            <span class="print-defense-label">Defense:</span>
            <span>4+</span>
          </div>
        </div>`

        // Display each HE-V with its details and armor bubbles
        htmlBody += `<div class="ultra-light-grid">`
        hevs.forEach(hev => {
          // Extract weapon systems information
          const weaponSystemsDetail = hev.details.find(detail => /Weapon Systems:/.test(detail))
          let weaponNames = []
          if (weaponSystemsDetail) {
            const weaponText = weaponSystemsDetail.replace(/<strong>Weapon Systems:<\/strong>\s*/, '')
            weaponNames = weaponText.split(/,\s*/).map(name => name.trim())
          }

          htmlBody += `<div class="ultra-light-card">
            <div class="ultra-light-name">${hev.name}</div>
            <div class="ultra-light-armor">
              <span class="print-defense-label">Armor:</span>
              <span class="bubble-display">
                ${generateBubbleHtml(hev.armor || 3, false)}
              </span>
            </div>
            <ul class="ultra-light-details">`
          hev.details.forEach(detail => {
            // Skip armor line in details since we're showing it with bubbles above
            // Skip weapon systems line since we'll display it in a table below
            if (!detail.match(/<strong>Armor:<\/strong>/i) && !detail.match(/<strong>Weapon Systems:<\/strong>/i)) {
              htmlBody += `<li>${detail}</li>`
            }
          })
          htmlBody += `</ul>`

          // Add weapon systems table if weapons exist
          if (weaponNames.length > 0 && gameRulesData.UL_HEV_WEAPONS) {
            htmlBody += `<div class="ultra-light-weapons">
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
                <tbody>`

            weaponNames.forEach(weaponName => {
              // Find the weapon data from the UL_HEV_WEAPONS array
              const weaponData = gameRulesData.UL_HEV_WEAPONS.find(w =>
                w.name.toLowerCase() === weaponName.toLowerCase() ||
                weaponName.toLowerCase().includes(w.id.toLowerCase().replace('ul-', ''))
              )

              if (weaponData) {
                // Add weapon traits to the supportAssetTraitNames set for displaying definitions
                if (weaponData.traits && weaponData.traits.length > 0) {
                  weaponData.traits.forEach(trait => {
                    // Parse trait name to extract the base name
                    if (typeof trait !== 'string') return

                    // Split the trait by spaces and extract the base trait names
                    // Handle complex traits like "AP1 x (X)" and "Melee (X)"
                    const parts = trait.split(' ')
                    let baseTraitName = parts[0].trim()

                    // Add the base trait name
                    supportAssetTraitNames.add(baseTraitName)

                    // For traits like "AP1 x (X)", also add AP1
                    if (trait.includes('AP')) {
                      const apMatch = trait.match(/AP(\d+)/i)
                      if (apMatch) {
                        supportAssetTraitNames.add('AP' + apMatch[1])
                      }
                    }
                  })
                }

                const traitsHtml = weaponData.traits && weaponData.traits.length > 0
                  ? weaponData.traits.join(', ')
                  : 'None'

                htmlBody += `<tr>
                  <td>${weaponData.name}</td>
                  <td>${weaponData.range}</td>
                  <td>${weaponData.damage}</td>
                  <td>${traitsHtml}</td>
                </tr>`
              } else {
                htmlBody += `<tr>
                  <td>${weaponName}</td>
                  <td class="text-center">-</td>
                  <td class="text-center">-</td>
                  <td><span class="text-muted">Unknown weapon system</span></td>
                </tr>`
              }
            })

            htmlBody += `</tbody></table>
            </div>`
          }

          htmlBody += `</div>`
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
            // Add upgrade pod traits to the supportAssetTraitNames set
            if (upgradePod.traits && upgradePod.traits.length > 0) {
              upgradePod.traits.forEach(trait => {
                // Parse trait names more robustly
                let baseTraitName = trait

                // Handle traits with numbers in parentheses like Limited(3)
                if (/\(\d+.*\)/.test(baseTraitName)) {
                  baseTraitName = baseTraitName.split('(')[0].trim()
                }

                // Handle traits with other parameters like Blast(3")
                else if (/\(.*\)/.test(baseTraitName)) {
                  baseTraitName = baseTraitName.split('(')[0].trim()
                }

                // Handle traits with spaces (like "Sustained Fire")
                else if (baseTraitName.includes(' ')) {
                  baseTraitName = baseTraitName.split(' ')[0].trim()
                }

                supportAssetTraitNames.add(baseTraitName)
              })
            }

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
            </div>`          } else {
            // Fallback to the old method if the pod is not found in gameRulesData
            const upgradePodLine = unit.details?.find(line => line.startsWith('<strong>Upgrade Pod:</strong>'))
            const upgradePodName = upgradePodLine ? upgradePodLine.replace('<strong>Upgrade Pod:</strong>', '').trim() : ''

            if (upgradePodName) {
              htmlBody += `<div class="upgrade-pod-info">
                <h5>${upgradePodName}</h5>
                <div class="upgrade-pod-details">`

              // Look for traits in related attributes to add to the supportAssetTraitNames set
              const traitsLine = unit.details?.find(line => line.includes('<strong>Traits:</strong>'))
              if (traitsLine) {
                const traitsText = traitsLine.replace(/<strong>Traits:<\/strong>\s*/, '')
                const traitsList = traitsText.split(/,\s*/)

                traitsList.forEach(trait => {
                  // Parse trait names more robustly
                  let baseTraitName = trait.trim()

                  // Handle traits with numbers in parentheses like Limited(3)
                  if (/\(\d+.*\)/.test(baseTraitName)) {
                    baseTraitName = baseTraitName.split('(')[0].trim()
                  }

                  // Handle traits with other parameters like Blast(3")
                  else if (/\(.*\)/.test(baseTraitName)) {
                    baseTraitName = baseTraitName.split('(')[0].trim()
                  }

                  // Handle traits with spaces (like "Sustained Fire")
                  else if (baseTraitName.includes(' ')) {
                    baseTraitName = baseTraitName.split(' ')[0].trim()
                  }

                  supportAssetTraitNames.add(baseTraitName)
                })
              }

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

        // Add trait definitions section for Ultra-Light Squadron if there are any traits
        if (supportAssetTraitNames.size > 0) {
          htmlBody += `<div class="equipment-section trait-definitions-section">
            <h4 class="section-title">Trait Definitions</h4>
            <ul class="trait-list">`
          const sortedTraitNames = Array.from(supportAssetTraitNames).sort()
          sortedTraitNames.forEach((traitName) => {
            // Only include traits that have definitions
            if (gameRulesData.traitDefinitions?.[traitName]) {
              htmlBody += `<li><strong>${traitName}:</strong> ${gameRulesData.traitDefinitions[traitName]}</li>`
            }
          })
          htmlBody += `</ul></div>`
        }
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

        // Add trait definitions section for general support assets if there are any traits
        if (supportAssetTraitNames.size > 0) {
          htmlBody += `<div class="equipment-section trait-definitions-section">
            <h4 class="section-title">Trait Definitions</h4>
            <ul class="trait-list">`
          const sortedTraitNames = Array.from(supportAssetTraitNames).sort()
          sortedTraitNames.forEach((traitName) => {
            // Only include traits that have definitions
            if (gameRulesData.traitDefinitions?.[traitName]) {
              htmlBody += `<li><strong>${traitName}:</strong> ${gameRulesData.traitDefinitions[traitName]}</li>`
            }
          })
          htmlBody += `</ul></div>`
        }
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
        <h4 class="section-title">Trait Definitions</h4>
        <ul class="trait-list">`
      const sortedTraitNames = Array.from(uniqueUnitTraitNames).sort()
      sortedTraitNames.forEach((traitName) => {
        // Only include traits that have definitions
        if (gameRulesData.traitDefinitions?.[traitName]) {
          htmlBody += `<li><strong>${traitName}:</strong> ${gameRulesData.traitDefinitions[traitName]}</li>`
        }
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
