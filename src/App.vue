<script setup>
import { ref, computed, watchEffect } from 'vue'
import HevCustomizer from './components/hevCustomizer.vue'
import { gameData as importedGameData } from './gameData.js'
import { generatePrintHtml } from './printUtils.js'
import { useToast } from 'vue-toastification'

// --- App State ---
const rosterName = ref('')
const roster = ref([])
const hevCustomizerRef = ref(null)
const gameRulesData = importedGameData
const fileInputRef = ref(null)
const versionTag = import.meta.env.VITE_GIT_COMMIT_SHA || 'dev'
const isDarkMode = ref(false)
const toast = useToast()

// --- Computed Properties ---
const getBaseTonnage = (unit) => {
  if (!unit.selectedClass) return 0
  const cls = findClassByName(unit.selectedClass.name)
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
    id: hevData.id || generateUniqueId(),
  })
  if (hevCustomizerRef.value) {
    hevCustomizerRef.value.resetForm()
    toast.success('HE-V added to roster!', { timeout: 1000 })
  } else {
    console.warn('Could not access hevCustomizerRef to reset form.')
    toast.warning('Could not reset customizer form.', { timeout: 1000 })
  }
}

// --- Roster Manipulation ---
const removeHevFromRoster = (unitId, showToast = true) => {
  const index = roster.value.findIndex((unit) => unit.id === unitId)
  if (index !== -1) {
    roster.value.splice(index, 1)
    if (showToast) toast.info('HE-V removed from roster.', { timeout: 1000 })
  } else {
    console.warn(`Could not find HE-V with ID ${unitId} to remove.`)
  }
}

const editHev = (unitToEdit) => {
  if (!hevCustomizerRef.value) {
    console.error('Cannot edit: HevCustomizer ref not found.')
    toast.error('Error: Cannot access customizer.', { timeout: 1000 })
    return
  }
  if (!unitToEdit || unitToEdit.id === undefined) {
    console.error('Cannot edit: Invalid unit data.', unitToEdit)
    toast.error('Error: Invalid unit data.', { timeout: 1000 })
    return
  }
  hevCustomizerRef.value.loadHevForEditing(JSON.parse(JSON.stringify(unitToEdit)))
  removeHevFromRoster(unitToEdit.id, false) // Don't show toast when editing
  toast.info('HE-V loaded for editing.', { timeout: 1000 })
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
    const fullHtml = generatePrintHtml({
      roster: roster.value,
      rosterName: rosterName.value,
      totalRosterBaseTonnage: totalRosterBaseTonnage.value,
      getBaseTonnage,
      findDieObjectPrint,
      generateBubbleHtml,
      getModificationText,
      formatPrintTrait,
      gameRulesData
    })
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(fullHtml)
      printWindow.document.close()
      toast.success('Print view opened in new tab.', { timeout: 1000 })
    } else {
      toast.error("Could not open print window. Please check your browser's popup blocker settings.", { timeout: 1000 })
    }
  } catch {
    toast.error('Failed to format roster for printing. Check console for details.', { timeout: 1000 })
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
    toast.success('Roster exported successfully.', { timeout: 1000 })
  } catch {
    showError('Failed to export roster. Check console for details.')
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function isValidJsonFile(file) {
  return file && file.type === 'application/json'
}

const importRosterJson = (event) => {
  const file = event.target.files ? event.target.files[0] : null
  if (!isValidJsonFile(file)) {
    showError(`Invalid file type (${file ? file.type : 'none'}). Please select a .json file.`, false)
    if (event.target) event.target.value = null
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
          showError(
            `Import Warning: ${skippedCount} unit(s) were skipped due to missing or invalid data.`,
            false
          )
        }
        rosterName.value = importedData.rosterName
        roster.value = validUnits
        console.log(`Roster imported successfully. ${validUnits.length} units loaded.`)
        toast.success(
          `Roster '${importedData.rosterName || 'Unnamed'}' imported successfully! ${validUnits.length} units loaded.`,
          { timeout: 1000 }
        )
      } else {
        throw new Error(
          "Invalid JSON structure. Expected 'rosterName' (string) and 'roster' (array).",
        )
      }
    } catch {
      showError('Failed to import roster: Invalid JSON or structure.')
    } finally {
      if (event.target) event.target.value = null
    }
  }
  reader.onerror = () => {
    showError('Failed to read the selected file.')
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

// --- Helper Functions ---
function findClassByName(name) {
  return gameRulesData?.classes?.find((c) => c.name === name) || null
}
function generateUniqueId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// --- Error Handling Helper ---
function showError(message, log = true) {
  if (log) console.error(message)
  toast.error(message, { timeout: 1000 })
}
</script>

<template>
  <div id="app" class="container px-4 py-6 max-w-5xl min-h-screen mx-auto relative">
    <div class="absolute top-4 right-4 flex flex-col items-end gap-2 z-50">
      <button
        class="dark-mode-toggle btn bg-card-bg text-primary border border-border-color rounded px-4 py-1 text-base cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-white shadow"
        :aria-pressed="isDarkMode"
        aria-label="Toggle dark mode"
        @click="toggleDarkMode"
        title="Toggle dark mode"
        role="button"
      >
        <span v-if="isDarkMode">☀️ Light Mode</span>
        <span v-else>🌙 Dark Mode</span>
      </button>
    </div>
    <h1 class="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
      Steel Rift Force Builder
      <span class="text-xs text-muted font-mono">(v{{ versionTag }})</span>
    </h1>

    <!-- Roster Management Section -->
    <section class="roster-manager card bg-card-bg border border-border-color rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Roster Management</h2>
      <div class="form-group mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input type="text" id="rosterName" v-model="rosterName" placeholder="Enter Roster Name" class="input input-bordered w-full md:w-1/2 px-3 py-2 rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Roster Name" />
      </div>
      <div class="roster-summary mb-6">
        <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
          Roster Units <span class="tonnage-badge bg-primary text-white rounded px-2 py-1 text-xs">(Total: {{ totalRosterBaseTonnage }}T)</span>
        </h3>
        <ul v-show="roster.length > 0" class="space-y-2" role="list">
          <li v-for="unit in roster" :key="unit.id" class="roster-item flex flex-col md:flex-row md:items-center justify-between bg-light-grey border border-border-color rounded p-3" role="listitem">
            <div class="roster-item-info flex flex-col md:flex-row md:items-center gap-2">
              <span class="roster-item-name font-semibold">{{ unit.unitName || 'Unnamed HE-V' }}</span>
              <span class="roster-item-details text-sm text-muted">
                ({{ unit.selectedClass?.name || 'N/A' }} - {{ unit.totalUnitTonnage ?? '?' }}T / {{ getBaseTonnage(unit) ?? '?' }}T)
              </span>
            </div>
            <div class="roster-item-actions flex gap-2 mt-2 md:mt-0">
              <button @click="editHev(unit)" class="btn btn-edit bg-secondary text-white px-3 py-1 rounded hover:bg-primary transition" title="Edit this HE-V" aria-label="Edit {{ unit.unitName || 'Unnamed HE-V' }}" role="button">
                Edit
              </button>
              <button
                @click="removeHevFromRoster(unit.id)"
                class="btn btn-remove-roster bg-danger text-white px-3 py-1 rounded hover:bg-black transition"
                title="Remove this HE-V"
                aria-label="Remove {{ unit.unitName || 'Unnamed HE-V' }}"
                role="button"
              >
                Remove
              </button>
            </div>
          </li>
        </ul>
        <p v-show="roster.length === 0" class="placeholder-text italic text-muted text-center py-4">No HE-Vs added to the roster yet.</p>
      </div>
      <div class="action-buttons flex flex-wrap gap-2">
        <input
          type="file"
          ref="fileInputRef"
          @change="importRosterJson"
          accept=".json,application/json"
          class="hidden"
          aria-label="Import roster from JSON file"
        />
        <button
          @click="triggerFileInput"
          class="btn btn-secondary bg-secondary text-white px-4 py-2 rounded hover:bg-primary transition"
          title="Load roster from a JSON file"
          aria-label="Import Roster (JSON)"
          role="button"
        >
          Import Roster (JSON)
        </button>
        <button
          @click="exportRosterJson"
          :disabled="roster.length === 0 && !rosterName"
          class="btn btn-info bg-info text-white px-4 py-2 rounded hover:bg-primary transition disabled:opacity-50"
          title="Save current roster to a JSON file"
          aria-label="Export Roster (JSON)"
          role="button"
        >
          Export Roster (JSON)
        </button>
        <button
          @click="formatForPrint"
          :disabled="roster.length === 0"
          class="btn btn-warning bg-warning text-black px-4 py-2 rounded hover:bg-primary hover:text-white transition disabled:opacity-50"
          title="Open a printer-friendly version of the roster"
          aria-label="Format for Print"
          role="button"
        >
          Format for Print
        </button>
      </div>
    </section>

    <hr class="divider my-8 border-t border-border-color" />

    <HevCustomizer ref="hevCustomizerRef" :game-rules="gameRulesData" @add-hev="addHevToRoster" />
  </div>
</template>
