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

      // Determine if this is a weapon system or support asset
      const isWeaponSystem = unit.details?.some(line => (/Damage:/.test(line) || /Range:/.test(line))) || false
      const isUltraLightSquad = unit.type?.includes('Squadron') || false
      const isInfantryOutpost = unit.type === 'Infantry Outpost' || false

      // Extract unique trait names for support assets
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

      if (isInfantryOutpost) {
        renderInfantryOutpost(unit, supportAssetTraitNames, generateBubbleHtml, gameRulesData)
      } else if (isUltraLightSquad) {
        renderUltraLightSquadron(unit, supportAssetTraitNames, generateBubbleHtml, gameRulesData)
      } else if (isWeaponSystem) {
        renderWeaponSystem(unit, supportAssetTraitNames, gameRulesData)
      } else {
        // Default display for other support assets
        renderDefaultSupportAsset(unit, supportAssetTraitNames, gameRulesData)
      }

      htmlBody += `</div>`
    } else {
      // Handle regular HE-V units
      htmlBody += generateHevHtml(unit, rosterName, generateBubbleHtml, formatPrintTrait, gameRulesData)
    }
  })

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

  // Helper function to render Limited trait with bubbles
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

  // Function to handle rendering Infantry Outpost
  function renderInfantryOutpost(unit, supportAssetTraitNames, generateBubbleHtml, gameRulesData) {
    htmlBody += `<div class="equipment-section">`

    // Get all bunker sections
    let bunkerSections = []

    if (Array.isArray(unit.details)) {
      let currentSection = null
      let currentSectionDetails = []

      // Process details to extract bunker sections
      for (let i = 0; i < unit.details.length; i++) {
        const line = unit.details[i]

        // Check if this is a bunker header
        if (line.includes('<u><strong>Bunker')) {
          // If we have a current section, add it to bunkerSections
          if (currentSection) {
            bunkerSections.push({
              title: currentSection,
              details: [...currentSectionDetails]
            })
            currentSectionDetails = []
          }

          currentSection = line.replace(/<[^>]+>/g, '').trim()
        } else if (currentSection && !line.includes('Tonnage:') && !line.includes('<u><strong>')) {
          // Add details to current section
          currentSectionDetails.push(line)
        } else if (line.includes('<u><strong>') && !line.includes('Bunker')) {
          // Skip other headers
          continue
        }
      }

      // Add the last section
      if (currentSection && currentSectionDetails.length > 0) {
        bunkerSections.push({
          title: currentSection,
          details: [...currentSectionDetails]
        })
      }
    }

    // Container for bunkers to lay them out side-by-side
    htmlBody += `<div class="bunker-container">`

    // Render each bunker
    bunkerSections.forEach(bunker => {
      htmlBody += `<div class="bunker-section">
        <h4 class="bunker-title">${bunker.title}</h4>
        <div class="bunker-header">
          <div class="bunker-armor defense-stat">
            <span class="print-defense-label">Armor:</span>
            <span class="bubble-display">
              ${generateBubbleHtml(8, false)}
            </span>
          </div>
        </div>
        <div class="bunker-traits">
          <table class="print-weapon-table">
            <thead>
              <tr>
                <th>Traits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fortification, Garrison(6), Command(2)</td>
              </tr>
            </tbody>
          </table>
        </div>`

      // Find weapon system details
      const weaponLineIndex = bunker.details.findIndex(line => line.startsWith('<u>') && !line.includes('x '))

      if (weaponLineIndex !== -1) {
        // Extract and render weapon system
        const weaponName = bunker.details[weaponLineIndex].replace(/<[^>]+>/g, '').trim()
        const damageLine = bunker.details[weaponLineIndex + 1] || ''
        const rangeLine = bunker.details[weaponLineIndex + 2] || ''
        const traitsLine = bunker.details[weaponLineIndex + 3] || ''

        const damageValue = damageLine.replace(/<strong>Damage:<\/strong>\s*/, '').trim()
        const rangeValue = rangeLine.replace(/<strong>Range:<\/strong>\s*/, '').trim()
        const traitsValue = traitsLine.replace(/<strong>Traits:<\/strong>\s*/, '').trim()

        // Add weapon system traits to supportAssetTraitNames
        if (traitsValue) {
          traitsValue.split(/,\s*/).forEach(trait => {
            const baseTraitName = trait.includes('(') ? trait.split('(')[0].trim() : trait.trim()
            supportAssetTraitNames.add(baseTraitName)
          })
        }

        htmlBody += `<div class="weapon-system-table">
          <table class="print-weapon-table">
            <thead>
              <tr>
                <th>System</th>
                <th>Damage</th>
                <th>Range</th>
                <th>Traits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${weaponName}</td>
                <td class="text-center">${damageValue}</td>
                <td class="text-center">${rangeValue}</td>
                <td>${renderLimitedTraitWithBubbles(traitsValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>`
      }

      // Process infantry units - first group by type
      let infantryTypes = new Map() // Map of typeName -> { speed, traits, units }
      let currentType = null
      let currentTypeInfo = null

      for (let i = 0; i < bunker.details.length; i++) {
        const line = bunker.details[i]

        // Check for infantry type header line
        if (line.startsWith('<u>') && line.includes('x ')) {
          const typeMatch = line.replace(/<[^>]+>/g, '').trim().match(/(\d+)x\s+(.+)/)
          if (typeMatch) {
            const typeName = typeMatch[2].trim()

            // Get speed and traits
            const speedLine = bunker.details[i + 1] || ''
            const traitsLine = bunker.details[i + 2] || ''

            const speed = speedLine.replace(/<strong>Speed:<\/strong>\s*/, '').trim()
            const traits = traitsLine.replace(/<strong>Traits:<\/strong>\s*/, '').trim()

            currentType = typeName
            currentTypeInfo = { typeName, speed, traits, units: [] }
            infantryTypes.set(currentType, currentTypeInfo)

            // Add traits to support asset traits
            if (traits) {
              traits.split(/,\s*/).forEach(trait => {
                supportAssetTraitNames.add(trait.trim())
              })
            }
          }
        }

        // Process individual units
        if (currentType && line.includes('<strong>UNIT_START:')) {
          let unitInfo = { isMineDrone: line.includes('MINE_DRONE'), weapons: [], specialRule: '', structure: 1 }
          let i2 = i + 1

          // Collect all details for this unit
          while (i2 < bunker.details.length && !bunker.details[i2].includes('<strong>UNIT_END</strong>')) {
            const detail = bunker.details[i2]

            // Check for structure
            if (detail.includes('<strong>Structure:</strong>')) {
              unitInfo.structure = parseInt(detail.replace(/<strong>Structure:<\/strong>\s*/, '').trim()) || 1
            }
            // Check for mine drone special rule
            else if (detail.includes('<strong>Mine Drone')) {
              unitInfo.specialRule = detail.replace(/<strong>Mine Drone[^:]*:<\/strong>\s*/, '').trim()
            }
            // Check for weapon
            else if (detail.includes('<strong>WEAPON:</strong>')) {
              const weaponParts = detail.replace(/<strong>WEAPON:<\/strong>\s*/, '').split('|')
              if (weaponParts.length >= 4) {
                unitInfo.weapons.push({
                  name: weaponParts[0].trim(),
                  damage: weaponParts[1].trim(),
                  range: weaponParts[2].trim(),
                  traits: weaponParts[3].trim()
                })

                // Add weapon traits
                if (weaponParts[3]) {
                  weaponParts[3].split(/,\s*/).forEach(trait => {
                    const baseTraitName = trait.includes('(') ? trait.split('(')[0].trim() : trait.trim()
                    supportAssetTraitNames.add(baseTraitName)
                  })
                }
              }
            }

            i2++
          }

          // Add this unit to the current type
          if (currentTypeInfo) {
            currentTypeInfo.units.push(unitInfo)
          }

          // Skip to end of unit
          i = i2
        }
      }

      // Render infantry groups
      infantryTypes.forEach((typeInfo, typeName) => {
        htmlBody += `<div class="infantry-group">
          <h5 class="infantry-group-title">${typeName}</h5>
          <div class="infantry-group-stats">
            <span><strong>Speed:</strong> ${typeInfo.speed}</span>
            <span><strong>Traits:</strong> ${typeInfo.traits}</span>
          </div>`

        // Render individual units in a compact grid
        htmlBody += `<div class="infantry-units-grid">`

        typeInfo.units.forEach((unit, index) => {
          htmlBody += `<div class="infantry-unit">
            <div class="infantry-unit-header">
              <span class="infantry-unit-number">Unit ${index + 1}</span>`

          // For regular infantry, show structure bubbles
          if (!unit.isMineDrone) {
            htmlBody += `<span class="infantry-unit-structure">
              ${generateBubbleHtml(unit.structure, true)}
            </span>`
          }

          htmlBody += `</div>` // End infantry-unit-header

          if (unit.isMineDrone) {
            // Special display for mine drones
            htmlBody += `<div class="mine-drone-rules">
              <p><strong>Special:</strong> ${unit.specialRule}</p>
            </div>`
          } else if (unit.weapons && unit.weapons.length > 0) {
            // Weapon table for regular infantry
            htmlBody += `<table class="print-weapon-table infantry-weapon-table">
              <thead>
                <tr>
                  <th>Weapon</th>
                  <th>Dam</th>
                  <th>Rng</th>
                  <th>Traits</th>
                </tr>
              </thead>
              <tbody>`

            // Add each weapon (should not have duplicates)
            unit.weapons.forEach(weapon => {
              htmlBody += `<tr>
                <td>${weapon.name}</td>
                <td class="text-center">${weapon.damage}</td>
                <td class="text-center">${weapon.range}</td>
                <td>${renderLimitedTraitWithBubbles(weapon.traits)}</td>
              </tr>`
            })

            htmlBody += `</tbody>
            </table>`
          }

          htmlBody += `</div>` // End infantry-unit
        })

        htmlBody += `</div>` // End infantry-units-grid
        htmlBody += `</div>` // End infantry-group
      })

      htmlBody += `</div>` // End bunker-section
    })

    htmlBody += `</div>` // End bunker-container

    htmlBody += `</div>` // End equipment-section

    // Add trait definitions section
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

  // Function to render Ultra-Light Squadron
  function renderUltraLightSquadron(unit, supportAssetTraitNames, generateBubbleHtml, gameRulesData) {
    htmlBody += `<div class="equipment-section">`

    // Create an outer container for the UL HE-V squadron
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

    // Group HE-Vs by type
    const hevsByType = {};
    hevs.forEach(hev => {
      const typeName = hev.name;
      if (!hevsByType[typeName]) {
        hevsByType[typeName] = [];
      }
      hevsByType[typeName].push(hev);
    });

    // Display each type of HE-V with its details grouped together
    htmlBody += `<div class="ulv-types-container">`

    for (const typeName in hevsByType) {
      const typeHevs = hevsByType[typeName];
      // Get traits and speed from the first HEV of this type (should be consistent for all of same type)
      const speedDetail = typeHevs[0].details.find(detail => /Speed:/.test(detail))
      const traitsDetail = typeHevs[0].details.find(detail => /Traits:/.test(detail))

      htmlBody += `<div class="ulv-type-container">
        <div class="ulv-type-header">
          <h4 class="ulv-type-name">${typeName}</h4>
          ${speedDetail ? `<div class="ulv-type-speed">${speedDetail}</div>` : ''}
          ${traitsDetail ? `<div class="ulv-type-traits">${traitsDetail}</div>` : ''}
        </div>
        <div class="ulv-instances-container">`

      // Display individual ULV instances within this type
      typeHevs.forEach(hev => {
        // Extract weapon systems information
        const weaponSystemsDetail = hev.details.find(detail => /Weapon Systems:/.test(detail))
        let weaponNames = []
        if (weaponSystemsDetail) {
          const weaponText = weaponSystemsDetail.replace(/<strong>Weapon Systems:<\/strong>\s*/, '')
          weaponNames = weaponText.split(/,\s*/).map(name => name.trim())
        }

        htmlBody += `<div class="ultra-light-card">
          <div class="ultra-light-armor">
            <span class="print-defense-label">Armor:</span>
            <span class="bubble-display">
              ${generateBubbleHtml(hev.armor || 3, false)}
            </span>
          </div>`

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
    }
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
  }

  // Function to render weapon systems (off-table support)
  function renderWeaponSystem(unit, supportAssetTraitNames, gameRulesData) {
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
  }

  // Function to render default support assets
  function renderDefaultSupportAsset(unit, supportAssetTraitNames, gameRulesData) {
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
    htmlBody += `</ul>`
    htmlBody += `</div>`

    // Add trait definitions section for default assets if there are any traits
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

  // Placeholder for HE-V HTML generation
  function generateHevHtml(unit, rosterName, generateBubbleHtml, formatPrintTrait, gameRulesData) {
    return `<div class="unit-card"><p>HE-V implementation placeholder</p></div>`
  }
}
