<script setup>
import { ref, computed } from 'vue';
// Removed: import { jsPDF } from 'jspdf';
import HevCustomizer from './components/HevCustomizer.vue';
import { gameData as importedGameData } from './gameData.js';

// --- App State ---
const rosterName = ref('');
const roster = ref([]);
const hevCustomizerRef = ref(null);
const gameRulesData = importedGameData;
const fileInputRef = ref(null);

// --- Computed Properties ---
const totalRosterTonnage = computed(() => {
  return roster.value.reduce((total, unit) => total + (unit?.totalUnitTonnage || 0), 0);
});

// --- Methods ---
const addHevToRoster = (hevData) => {
  console.log("Adding HEV to roster:", hevData);
  roster.value.push({
    ...hevData,
    id: hevData.id || Date.now() + Math.random()
  });
  if (hevCustomizerRef.value) {
    hevCustomizerRef.value.resetForm();
  } else {
     console.warn("Could not access hevCustomizerRef to reset form.");
  }
};

// --- Roster Manipulation ---
const removeHevFromRoster = (unitId) => {
    const index = roster.value.findIndex(unit => unit.id === unitId);
    if (index !== -1) { roster.value.splice(index, 1); }
    else { console.warn(`Could not find HE-V with ID ${unitId} to remove.`); }
};

const editHev = (unitToEdit) => {
    if (!hevCustomizerRef.value) { console.error("Cannot edit: HevCustomizer ref not found."); alert("Error: Cannot access customizer."); return; }
    if (!unitToEdit || unitToEdit.id === undefined) { console.error("Cannot edit: Invalid unit data.", unitToEdit); alert("Error: Invalid unit data."); return; }
    hevCustomizerRef.value.loadHevForEditing(JSON.parse(JSON.stringify(unitToEdit)));
    removeHevFromRoster(unitToEdit.id);
};


// --- Print Formatting Helpers ---
// Helper to find die object (still needed for print formatting)
const findDieObjectPrint = (dieString) => {
    if (!gameRulesData?.dice || !dieString) return null;
    return gameRulesData.dice.find(d => d.die === dieString);
};

// Helper to generate HTML for bubbles
const generateBubbleHtml = (sides, isStructureTrack = false) => {
    if (sides <= 0) return `<span class="placeholder-text-inline">N/A</span>`;
    let bubblesHtml = '';
    // Threshold calculation remains the same as it's for visual representation
    const thresholds = isStructureTrack ? {
         redEnd: sides > 0 ? Math.floor(sides * 0.25) : 0,
         orangeEnd: sides > 0 ? Math.floor(sides * 0.50) : 0,
         yellowEnd: sides > 0 ? Math.floor(sides * 0.75) : 0,
         markerYellow: sides > 0 ? (sides - Math.floor(sides * 0.75) + 1) : 0,
         markerOrange: sides > 0 ? (sides - Math.floor(sides * 0.50) + 1) : 0,
         markerRed: sides > 0 ? (sides - Math.floor(sides * 0.25) + 1) : 0,
    } : null;

    for (let n = 1; n <= sides; n++) {
        let bubbleClass = 'bubble';
        if (isStructureTrack && thresholds) {
            if (n === thresholds.markerYellow) bubblesHtml += `<span class="threshold-divider divider-yellow"></span>`;
            else if (n === thresholds.markerOrange) bubblesHtml += `<span class="threshold-divider divider-red"></span>`;
            else if (n === thresholds.markerRed) bubblesHtml += `<span class="threshold-divider divider-black"></span>`;
            if (n <= thresholds.redEnd) bubbleClass += ' bubble-black';
            else if (n <= thresholds.orangeEnd) bubbleClass += ' bubble-red';
            else if (n <= thresholds.yellowEnd) bubbleClass += ' bubble-yellow';
        }
         bubblesHtml += `<span class="${bubbleClass}"></span>`;
    }
    return `<div class="bubble-display">${bubblesHtml}</div>`;
};
// Helper to get modification text
const getModificationText = (baseDie, effectiveDie) => {
    if (!baseDie || !effectiveDie) return '';
    if (effectiveDie.step > baseDie.step) return ' (Reinforced)';
    if (effectiveDie.step < baseDie.step) return ' (Stripped)';
    return '';
};
// Helper for escalating weapon cost - needed for print formatting
const calculateNthWeaponCostPrint = (weaponData, n, className) => {
    if (n <= 0 || !weaponData || !className || !weaponData.tonnage || weaponData.tonnage[className] === undefined) return 0;
    const baseCost = weaponData.tonnage[className];
    if (n === 1) return baseCost;
    const penaltyAmount = Math.ceil(baseCost * 0.5);
    const totalPenaltyForNth = (n - 1) * penaltyAmount;
    return baseCost + totalPenaltyForNth;
};
const calculateGroupWeaponTonnagePrint = (weaponData, quantity, className) => {
    if (!weaponData || quantity <= 0 || !className || weaponData.tonnage === undefined) return 0;
    let groupTonnage = 0;
    for (let i = 1; i <= quantity; i++) {
        groupTonnage += calculateNthWeaponCostPrint(weaponData, i, className);
    }
    return groupTonnage;
};


// --- Main Print Formatting Function ---
const formatForPrint = () => {
    console.log("Formatting for print...");
    try {
        // CSS Styles (Embed critical styles)
        const cssStyles = `
            body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 0; padding: 0; color: #212529; background-color: #fff; }
            * { box-sizing: border-box; }
            :root { --primary-color: #0d6efd; --secondary-color: #6c757d; --success-color: #198754; --danger-color: #dc3545; --warning-color: #ffc107; --black-color: #000000; --light-grey: #f8f9fa; --medium-grey: #e9ecef; --dark-grey: #343a40; --border-color: #dee2e6; --border-radius: 0.375rem; --text-muted: #6c757d; }
            .print-container { max-width: 900px; margin: 20px auto; padding: 15px; }
            .print-header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;}
            .print-header h1 { margin: 0 0 5px 0; font-size: 1.8rem; font-weight: 500; }
            .print-header h2 { margin: 0; font-size: 1.2rem; font-weight: 400; color: var(--text-muted); }
            .unit-card { border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
            .unit-title { font-size: 1.3rem; font-weight: 500; margin-bottom: 10px; color: var(--primary-color); }
            .section-wrapper { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1rem; align-items: flex-start; }
            .form-section { flex: 1; min-width: 250px; }
            .section-title { font-size: 1rem; color: var(--secondary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.3rem; margin-bottom: 0.75rem; font-weight: 500; }
            .class-section p, .defense-item p { margin: 0.2rem 0; font-size: 0.9rem; }
            .defense-section { display: flex; flex-direction: column; gap: 0.75rem; }
            .defense-item { border: 1px solid var(--medium-grey); padding: 0.75rem; border-radius: var(--border-radius); }
            .defense-item > label { font-weight: bold; display: block; margin-bottom: 0.3rem; font-size: 0.9rem; text-align: center; }
            .dice-details-line { display: flex; align-items: center; gap: 0.5rem; min-height: 20px; margin-bottom: 0.5rem; }
            .bubble-display { display: flex; flex-wrap: nowrap; gap: 2px; align-items: center; flex-shrink: 0; min-width: 140px; overflow: hidden; }
            .bubble { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--success-color); flex-shrink: 0; }
            .bubble.bubble-yellow { border-color: var(--warning-color); }
            .bubble.bubble-red { border-color: var(--danger-color); }
            .bubble.bubble-black { border-color: var(--black-color); }
            .threshold-divider { display: inline-block; width: 1.5px; height: 11px; margin: 0 1px; vertical-align: middle; flex-shrink: 0; }
            .divider-yellow { background-color: var(--warning-color); }
            .divider-red { background-color: var(--danger-color); }
            .divider-black { background-color: var(--black-color); }
            .placeholder-text-inline { font-style: italic; color: var(--text-muted); font-size: 0.8rem; }
            .modification-text { font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5em; white-space: nowrap; }
            .die-cost-print { font-size: 0.8rem; color: var(--text-muted); margin-left: auto; white-space: nowrap; padding-left: 0.5em; }
            .threshold-descriptions { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color); font-size: 0.75rem; line-height: 1.3; }
            .threshold-descriptions p { margin: 1px 0; display: flex;}
            .threshold-descriptions p strong { min-width: 55px; text-align: right; flex-shrink: 0; display: inline-block; font-weight: bold; margin-right: 4px;}
            .threshold-desc-yellow strong { color: #b38600; }
            .threshold-desc-red strong { color: var(--danger-color); }
            .threshold-desc-black strong { color: var(--black-color); }
            .equipment-section { margin-top: 1rem; }
            .item-list { list-style: none; padding: 0; margin: 0.5rem 0 0 0; border: 1px solid var(--border-color); border-radius: var(--border-radius); }
            .item-list li { display: flex; justify-content: space-between; padding: 0.3rem 0.6rem; border-bottom: 1px solid var(--medium-grey); font-size: 0.85rem; }
            .item-list li:last-child { border-bottom: none; }
            .item-list li i { color: var(--text-muted); font-style: italic; width: 100%; text-align: center; }
            .item-info-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.4em; flex-grow: 1; }
            .item-name { font-weight: 500; margin-right: 0.2em; }
            .item-stats { font-size: 0.9em; color: var(--secondary-color); margin-right: 0.2em; }
            .item-traits { font-size: 0.85em; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            @media print { body { margin: 0; padding: 0; background-color: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact;} .print-container { max-width: 100%; margin: 10mm; padding: 0; box-shadow: none; border: none; } .no-print { display: none !important; } .unit-card { border: 1px solid #ccc; margin-bottom: 10mm; } }
            .no-print { position: fixed; top: 10px; right: 10px; padding: 5px 10px; background-color: #ddd; border: 1px solid #aaa; border-radius: 4px; cursor: pointer; z-index: 1000;}
        `;

        let htmlBody = `
            <button class="no-print" onclick="window.print()">Print this page</button>
            <div class="print-header">
                <h1>${rosterName.value || 'Unnamed Roster'}</h1>
                <h2>Total Tonnage: ${totalRosterTonnage.value}</h2>
            </div>
        `;

        roster.value.forEach(unit => {
            if (!unit || !unit.selectedClass) return;
            const unitClassName = unit.selectedClass.name;
            const baseArmorDie = findDieObjectPdf(unit.selectedClass.defaultArmorDie);
            const baseStructDie = findDieObjectPdf(unit.selectedClass.defaultStructureDie);

            htmlBody += `<div class="unit-card">`;
            htmlBody += `<h3 class="unit-title">${unit.unitName || 'Unnamed HE-V'}</h3>`;
            htmlBody += `<div class="section-wrapper class-defense-wrapper">`;
            // Classification Section
            htmlBody += `<div class="form-section class-section"><h4 class="section-title">Classification</h4><p><strong>Class:</strong> ${unitClassName}</p><p><strong>Motive:</strong> ${unit.selectedMotiveType?.name || 'Standard'}</p><p><strong>Unit Tonnage:</strong> ${unit.totalUnitTonnage || '?'}</p><p><strong>Slots Used:</strong> ${unit.usedSlots === undefined ? '?' : unit.usedSlots} / ${unit.maxSlots === undefined ? '?' : unit.maxSlots}</p></div>`;
            // Defense Section
            htmlBody += `<div class="form-section defense-section"><h4 class="section-title">Defense</h4>`;
            // Armor
            htmlBody += `<div class="defense-item"><label>Armor: ${unit.effectiveArmorDie?.die || 'N/A'} ${getModificationText(baseArmorDie, unit.effectiveArmorDie)}</label><div class="dice-details-line">${generateBubbleHtml(unit.effectiveArmorDie?.sides ?? 0, false)}<span class="die-cost-print">(${unit.effectiveArmorDie?.armorCost ?? 0}T)</span></div></div>`;
            // Structure
            htmlBody += `<div class="defense-item"><label>Structure: ${unit.effectiveStructureDie?.die || 'N/A'} ${getModificationText(baseStructDie, unit.effectiveStructureDie)}</label><div class="dice-details-line">${generateBubbleHtml(unit.effectiveStructureDie?.sides ?? 0, true)}<span class="die-cost-print">(${unit.effectiveStructureDie?.structureCost ?? unit.effectiveStructureDie?.armorCost ?? 0}T)</span></div>`;
            const structureSides = unit.effectiveStructureDie?.sides ?? 0;
            if (structureSides > 0) {
                const markerYellow = structureSides > 0 ? (structureSides - Math.floor(structureSides * 0.75) + 1) : 0;
                const markerOrange = structureSides > 0 ? (structureSides - Math.floor(structureSides * 0.50) + 1) : 0;
                const markerRed = structureSides > 0 ? (structureSides - Math.floor(structureSides * 0.25) + 1) : 0;
                htmlBody += `<div class="threshold-descriptions">`;
                if (markerYellow > 1) htmlBody += `<p class="threshold-desc-yellow"><strong>25% Dmg:</strong> All Move/Jump Orders -1</p>`;
                if (markerOrange > 1) htmlBody += `<p class="threshold-desc-red"><strong>50% Dmg:</strong> Weapon Damage -1 (min 1)</p>`;
                if (markerRed > 1) htmlBody += `<p class="threshold-desc-black"><strong>75% Dmg:</strong> Only 1 Order per activation</p>`;
                htmlBody += `</div>`;
            }
            htmlBody += `</div></div>`; // End defense-item & defense-section
            htmlBody += `</div>`; // End class-defense-wrapper

            // Weapons
            htmlBody += `<div class="equipment-section"><h4 class="section-title">Weapon Systems</h4>`;
            if (unit.selectedWeapons && unit.selectedWeapons.length > 0) {
                 htmlBody += `<ul class="item-list">`;
                 const weaponCounts = {}; unit.selectedWeapons.forEach(w => { if (w && w.id) { weaponCounts[w.id] = (weaponCounts[w.id] || 0) + 1; } });
                 Object.keys(weaponCounts).forEach(weaponId => {
                     const weaponData = gameRulesData.weapons.find(w => w.id === weaponId);
                     if(weaponData) {
                         const quantity = weaponCounts[weaponId]; const groupTonnage = calculateGroupWeaponTonnagePrint(weaponData, quantity, unitClassName);
                         const damage = weaponData.damageRating?.[unitClassName] ?? '?'; const range = weaponData.rangeCategory || 'N/A';
                         const traits = weaponData.traits?.join(', ') ?? 'None';
                         htmlBody += `<li class="single-line-item"><div class="item-info-line"><span class="item-name">${quantity}x ${weaponData.name}</span><span class="item-stats">[${range}] (Dmg:${damage}, Cost:${groupTonnage}T)</span><span class="item-traits">Tr:[${traits}]</span></div></li>`;
                     } else { htmlBody += `<li><i>Unknown Weapon (ID: ${weaponId})</i></li>`; }
                 }); htmlBody += `</ul>`;
            } else { htmlBody += `<p><i>None</i></p>`; }
            htmlBody += `</div>`;

            // Upgrades
            htmlBody += `<div class="equipment-section"><h4 class="section-title">Upgrades</h4>`;
            if (unit.selectedUpgrades && unit.selectedUpgrades.length > 0) {
                 htmlBody += `<ul class="item-list">`;
                 unit.selectedUpgrades.forEach(upgrade => {
                     if (upgrade && upgrade.name) {
                        const traits = upgrade.traits?.join(', ') ?? 'None';
                        htmlBody += `<li class="single-line-item"><div class="item-info-line"><span class="item-name">${upgrade.name}</span><span class="item-stats">(${upgrade.tonnage}T / 1S)</span><span class="item-traits">Tr:[${traits}]</span></div></li>`;
                     } else { htmlBody += `<li><i>Unknown Upgrade</i></li>`; }
                 }); htmlBody += `</ul>`;
            } else { htmlBody += `<p><i>None</i></p>`; }
            htmlBody += `</div>`;
            htmlBody += `</div>`; // End unit-card
        });

        const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Print Roster - ${rosterName.value || 'Unnamed'}</title><style>${cssStyles}</style></head><body><div class="print-container">${htmlBody}</div></body></html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) { printWindow.document.open(); printWindow.document.write(fullHtml); printWindow.document.close(); }
        else { alert("Could not open print window. Please check your browser's popup blocker settings."); }

    } catch (error) {
        console.error("Error formatting for print:", error);
        alert("Failed to format roster for printing. Check console for details.");
    }
}; // End formatForPrint


// --- Export/Import Functionality ---
const exportRosterJson = () => {
  try {
    const dataToExport = { rosterName: rosterName.value, roster: roster.value };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${rosterName.value || 'SteelRiftRoster'}.json`.replace(/[^a-z0-9._-]/gi, '_');
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("Roster exported successfully.");
  } catch (error) {
    console.error("Error exporting roster:", error);
    alert("Failed to export roster. Check console for details.");
  }
};

const triggerFileInput = () => {
  if (fileInputRef.value) { fileInputRef.value.click(); }
};

const importRosterJson = (event) => {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) { return; }
  if (file.type !== 'application/json') {
      alert(`Invalid file type (${file.type}). Please select a .json file.`);
      event.target.value = null; return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const importedData = JSON.parse(content);
      if (typeof importedData.rosterName === 'string' && Array.isArray(importedData.roster)) {
        const validUnits = importedData.roster.filter(unit =>
            unit && typeof unit === 'object' && unit.selectedClass &&
            unit.effectiveArmorDie && unit.effectiveStructureDie &&
            Array.isArray(unit.selectedWeapons) && Array.isArray(unit.selectedUpgrades) &&
            typeof unit.totalUnitTonnage === 'number'
        );
        if (validUnits.length !== importedData.roster.length) {
            console.warn("Some units in the imported file were invalid/incomplete and were skipped.");
        }
        rosterName.value = importedData.rosterName;
        roster.value = validUnits;
        console.log(`Roster imported successfully. ${validUnits.length} units loaded.`);
        alert(`Roster imported successfully! ${validUnits.length} units loaded.`);
      } else { throw new Error("Invalid JSON structure."); }
    } catch (error) {
      console.error("Error parsing/validating imported JSON:", error);
      alert(`Failed to import roster: ${error.message}`);
    } finally { event.target.value = null; }
  };
  reader.onerror = (e) => { console.error("Error reading file:", e); alert("Failed to read the selected file."); event.target.value = null; };
  reader.readAsText(file);
};

</script>

<template>
  <div id="app" class="container">
    <h1>Steel Rift Force Roster & HE-V Customizer</h1>

    <!-- Roster Management Section -->
    <section class="roster-manager card">
      <h2>Roster Management</h2>
      <div class="form-group">
        <label for="rosterName">Roster Name:</label>
        <input type="text" id="rosterName" v-model="rosterName" placeholder="Enter Roster Name">
      </div>
      <div class="roster-summary">
         <h3>Roster Units <span class="tonnage-badge">(Total: {{ totalRosterTonnage }} T)</span></h3>
         <ul v-if="roster.length > 0">
           <li v-for="unit in roster" :key="unit.id" class="roster-item">
              <div class="roster-item-info">
                  <span class="roster-item-name">{{ unit.unitName || 'Unnamed HE-V' }}</span>
                  <span class="roster-item-details">
                    ({{ unit.selectedClass?.name || 'N/A' }} / {{ unit.selectedMotiveType?.name || 'Standard' }})
                    [A:{{ unit.effectiveArmorDie?.die || '?' }} S:{{ unit.effectiveStructureDie?.die || '?' }}]
                     - {{ unit.totalUnitTonnage }} T
                  </span>
              </div>
              <div class="roster-item-actions">
                  <button @click="editHev(unit)" class="btn btn-edit" title="Edit this HE-V">Edit</button>
                  <button @click="removeHevFromRoster(unit.id)" class="btn btn-remove-roster" title="Remove this HE-V">Remove</button>
              </div>
           </li>
         </ul>
         <p v-else class="placeholder-text">No HE-Vs added to the roster yet.</p>
      </div>
      <div class="action-buttons">
        <!-- Hidden File Input -->
        <input
            type="file"
            ref="fileInputRef"
            @change="importRosterJson"
            accept=".json,application/json"
            style="display: none;"
        />
        <!-- Import Button -->
        <button @click="triggerFileInput" class="btn btn-secondary" title="Load roster from a JSON file">
          Import Roster (JSON)
        </button>
        <!-- Export Button -->
         <button @click="exportRosterJson" :disabled="roster.length === 0 && !rosterName" class="btn btn-info" title="Save current roster to a JSON file">
          Export Roster (JSON)
        </button>
        <!-- Print Button -->
        <button @click="formatForPrint" :disabled="roster.length === 0" class="btn btn-warning" title="Open a printer-friendly version of the roster">
           Format for Print
        </button>
        <!-- REMOVED PDF Button -->
        <!--
        <button @click="downloadPdf" :disabled="roster.length === 0" class="btn btn-primary" title="Download the current roster as a PDF file">
          Download PDF
        </button>
         -->
      </div>
    </section>

    <hr class="divider">

    <!-- HE-V Customization Section -->
    <HevCustomizer
      ref="hevCustomizerRef"
      :game-rules="gameRulesData"
      @add-hev="addHevToRoster"
    />

  </div>
</template>

<!-- No <style> block, styles are in main.css -->
