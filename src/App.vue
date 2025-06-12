// filepath: /var/home/dmk/projects/steel-rift-builder/src/App.vue
<script setup>
import { ref, computed, watchEffect, nextTick } from 'vue'
import HevCustomizer from './components/hevCustomizer.vue'
import SupportAssets from './components/SupportAssets.vue'
import RosterManager from './components/roster/RosterManager.vue'
import TabNavigation from './components/ui/TabNavigation.vue'
import DarkModeToggle from './components/ui/DarkModeToggle.vue'
import Footer from './components/layout/Footer.vue'
import { gameData as importedGameData, UL_HEV_WEAPONS, UL_HEV_UPGRADE_PODS } from './gameData.js'
import { useToast } from 'vue-toastification'

// --- App State ---
const rosterName = ref('')
const roster = ref([])
const hevCustomizerRef = ref(null)
// Add UL_HEV_WEAPONS and UL_HEV_UPGRADE_PODS to gameRulesData for print display
const gameRulesData = {
  ...importedGameData,
  UL_HEV_WEAPONS,
  UL_HEV_UPGRADE_PODS
}
const versionTag = import.meta.env.VITE_GIT_COMMIT_SHA || 'dev'
// Load dark mode preference from localStorage, default to false if not set
const isDarkMode = ref(localStorage.getItem('isDarkMode') === 'true')
const toast = useToast()
const activeTab = ref('hev')

// Tab configuration for the TabNavigation component
const tabs = [
  { id: 'hev', label: 'HE-V Configuration' },
  { id: 'support', label: 'Support Assets' }
]

// --- Computed Properties with Memoization ---
/**
 * Gets base tonnage for a unit
 * @param {Object} unit - The unit to calculate tonnage for
 * @returns {number} - The base tonnage value
 */
const getBaseTonnage = (unit) => {
  if (unit.isSupportAsset) return unit.totalUnitTonnage || 10
  if (!unit.selectedClass) return 0
  const cls = findClassByName(unit.selectedClass.name)
  return cls ? cls.baseTonnage : 0
}

/**
 * Memoized computation for total roster base tonnage
 * @returns {number} - Total base tonnage of all units in roster
 */
const totalRosterBaseTonnage = computed(() => {
  return roster.value.reduce((total, unit) => total + getBaseTonnage(unit), 0)
})

// --- Methods ---
/**
 * Add an HE-V unit to the roster
 * @param {Object} hevData - The HE-V data to add
 */
const addHevToRoster = (hevData) => {
  if (!hevData) {
    console.error('Cannot add HEV: Invalid data provided')
    return
  }

  console.log('Adding HEV to roster:', hevData)
  roster.value.push({
    ...hevData,
    id: hevData.id || generateUniqueId(),
  })

  // Always show success toast
  toast.success('HE-V added to roster!', { timeout: 1000 })

  // Make this safer for tests
  try {
    if (hevCustomizerRef.value && typeof hevCustomizerRef.value.resetForm === 'function') {
      hevCustomizerRef.value.resetForm()
    } else if (import.meta.env.MODE !== 'test') {
      // Only log warning in non-test environments
      console.warn('Could not access hevCustomizerRef to reset form.')
    }
  } catch (error) {
    if (import.meta.env.MODE !== 'test') {
      // Only log warning in non-test environments
      console.warn('Error resetting form:', error)
    }
  }
}

/**
 * Add a support asset to the roster
 * @param {Object} asset - The support asset data to add
 */
function addSupportAssetToRoster(asset) {
  roster.value.push({
    ...asset,
    id: generateUniqueId(),
    isSupportAsset: true,
    totalUnitTonnage: 10 // Always 10T for support assets
  })
  toast.success('Support Asset added to roster!', { timeout: 1000 })
}

/**
 * Remove a unit from the roster
 * @param {string} unitId - ID of the unit to remove
 * @param {boolean} showToast - Whether to show a toast notification
 */
const removeHevFromRoster = (unitId, showToast = true) => {
  const index = roster.value.findIndex((unit) => unit.id === unitId)
  if (index !== -1) {
    roster.value.splice(index, 1)
    if (showToast) toast.info('Unit removed from roster.', { timeout: 1000 })
  } else {
    console.warn(`Could not find unit with ID ${unitId} to remove.`)
  }
}

/**
 * Edit an HE-V unit
 * @param {Object} unitToEdit - The unit to edit
 */
const editHev = (unitToEdit) => {
  if (!unitToEdit || unitToEdit.id === undefined) {
    console.error('Cannot edit: Invalid unit data.', unitToEdit)
    toast.error('Error: Invalid unit data.', { timeout: 1000 })
    return
  }

  // First switch to HE-V tab
  activeTab.value = 'hev'

  // Use nextTick to ensure the component is rendered before accessing it
  nextTick(() => {
    if (!hevCustomizerRef.value) {
      console.error('Cannot edit: HevCustomizer ref not found.')
      toast.error('Error: Cannot access customizer.', { timeout: 1000 })
      return
    }

    hevCustomizerRef.value.loadHevForEditing(JSON.parse(JSON.stringify(unitToEdit)))
    removeHevFromRoster(unitToEdit.id, false) // Don't show toast when editing
    toast.info('HE-V loaded for editing.', { timeout: 1000 })
  })
}

/**
 * Handle import of roster from JSON
 * @param {Object} importData - The imported roster data
 */
const handleImportRoster = (importData) => {
  if (importData && importData.rosterName && Array.isArray(importData.roster)) {
    rosterName.value = importData.rosterName;
    roster.value = importData.roster;
    console.log(`Roster imported successfully. ${importData.roster.length} units loaded.`);
  } else {
    showError('Failed to import roster: Invalid or incomplete data structure');
  }
}

/**
 * Handle export of roster to JSON
 * @param {Object} exportData - The exported roster data
 */
const handleExportRoster = (exportData) => {
  console.log('Roster exported:', exportData);
}

/**
 * Format roster for printing
 */
const formatForPrint = () => {
  if (roster.value.length === 0) {
    toast.info('No units to print. Add units to your roster first.', { timeout: 2000 });
    return;
  }

  try {
    // Import generatePrintHtml function from printUtils
    import('./printUtils.js').then(({ generatePrintHtml }) => {
      const fullHtml = generatePrintHtml({
        roster: roster.value,
        rosterName: rosterName.value,
        totalRosterBaseTonnage: totalRosterBaseTonnage.value,
        getBaseTonnage,
        generateBubbleHtml,
        formatPrintTrait,
        gameRulesData
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        toast.success('Print view opened in new tab.', { timeout: 2000 });
      } else {
        toast.error("Could not open print window. Please check your browser's popup blocker settings.", { timeout: 2000 });
      }
    }).catch(error => {
      console.error('Error loading print utilities:', error);
      toast.error('Failed to load print formatting module.', { timeout: 2000 });
    });
  } catch (error) {
    console.error('Error preparing print view:', error);
    toast.error('Failed to format roster for printing.', { timeout: 2000 });
  }
}

/**
 * Initialize dark mode based on system preference if no saved preference exists
 */
const initializeDarkMode = () => {
  // If localStorage already has a saved preference, we'll use that (handled in the ref initialization)
  // If no saved preference, check for system preference
  if (localStorage.getItem('isDarkMode') === null) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    localStorage.setItem('isDarkMode', prefersDark)
  }

  // Add listener for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // Only update if user hasn't explicitly set a preference
      if (localStorage.getItem('isDarkMode') === null) {
        isDarkMode.value = e.matches
        localStorage.setItem('isDarkMode', e.matches)
      }
    })
  }
}

/**
 * Toggle dark mode state
 */
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  // Save preference to localStorage
  localStorage.setItem('isDarkMode', isDarkMode.value)
}

// Call on component mount
initializeDarkMode()

// Watch for dark mode changes and apply the appropriate class
watchEffect(() => {
  const html = document.documentElement
  if (isDarkMode.value) {
    html.classList.add('dark-theme')
  } else {
    html.classList.remove('dark-theme')
  }
})

// --- Helper Functions ---
/**
 * Find a class by name in the game rules data
 * @param {string} name - The name of the class to find
 * @returns {Object|null} - The class object or null if not found
 */

// Expose for testing
defineExpose({
  toggleDarkMode,
  formatForPrint,
  isDarkMode
});
function findClassByName(name) {
  return gameRulesData?.classes?.find((c) => c.name === name) || null
}

/**
 * Generate bubble HTML for displaying armor/structure tracks with memoization
 * @param {number} sides - Number of bubbles to generate
 * @param {boolean} isStructureTrack - Whether this is a structure track (for color coding)
 * @returns {string} - HTML string for bubble display
 */
// Cache for memoized bubble HTML generation
const bubbleHtmlCache = new Map();

const generateBubbleHtml = (sides, isStructureTrack = false) => {
  // Create a cache key based on parameters
  const cacheKey = `${sides}-${isStructureTrack}`;

  // Check if we've already generated this exact bubble display
  if (bubbleHtmlCache.has(cacheKey)) {
    return bubbleHtmlCache.get(cacheKey);
  }

  // Not in cache, generate the HTML
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

  const result = `<div class="bubble-display">${bubblesHtml}</div>`;

  // Store the result in cache for future use
  bubbleHtmlCache.set(cacheKey, result);

  return result;
}

/**
 * Generate HTML for limited trait bubbles
 * @param {number} count - Number of bubbles
 * @returns {string} - HTML string
 */
const generateLimitedTraitBubbleHtml = (count) => {
  if (count <= 0) return ''
  let bubbles = ''
  for (let i = 0; i < count; i++) {
    bubbles += `<span class="print-trait-bubble"></span>`
  }
  return `(${bubbles})`
}

/**
 * Format trait for print display with memoization
 * @param {Object|string} traitObj - Trait object or string
 * @param {string} forClassName - Class name for context-specific traits
 * @returns {string} - Formatted trait string
 */
// Cache for trait formatting
const traitFormatCache = new Map();

const formatPrintTrait = (traitObj, forClassName) => {
  // For string type traits, just return immediately
  if (typeof traitObj === 'string') return traitObj
  if (!traitObj || !traitObj.name) return 'Unknown Trait'

  // Create a cache key
  const cacheKey = `${JSON.stringify(traitObj)}-${forClassName || ''}`;

  // Check if we've already formatted this trait
  if (traitFormatCache.has(cacheKey)) {
    return traitFormatCache.get(cacheKey);
  }

  // Not in cache, format the trait
  let result;

  if (traitObj.name === 'Limited' && traitObj.value !== undefined) {
    result = `Limited${generateLimitedTraitBubbleHtml(traitObj.value)}`;
  }
  else if (typeof traitObj.value === 'object' && traitObj.value !== null) {
    if (forClassName && traitObj.value[forClassName] !== undefined) {
      result = `${traitObj.name} ${traitObj.value[forClassName]}`;
    } else {
      const classValues = Object.entries(traitObj.value)
        .map(([k, v]) => `${k[0]}:${v}`)
        .join('/');
      result = `${traitObj.name} (${classValues})`;
    }
  }
  else if (traitObj.value === true) {
    // Boolean true value should just show the trait name
    result = traitObj.name;
  }
  else if (traitObj.value !== undefined) {
    result = `${traitObj.name} ${traitObj.value}`;
  }
  else {
    result = traitObj.name;
  }

  // Store the formatted result in cache
  traitFormatCache.set(cacheKey, result);

  return result;
}

/**
 * Generate a unique ID for roster items
 * @returns {string} - A unique ID string
 */
function generateUniqueId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Show an error message to the user
 * @param {string} message - Error message to display
 * @param {boolean} log - Whether to log to console
 */
function showError(message, log = true) {
  if (log) console.error(message)
  toast.error(message, { timeout: 1000 })
}
</script>

<template>
  <div id="app" class="container px-4 py-6 max-w-5xl min-h-screen mx-auto relative">
    <div class="absolute top-4 right-4 flex flex-col items-end gap-2 z-50">
      <DarkModeToggle v-model="isDarkMode" />
    </div>

    <h1 class="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
      Steel Rift Force Builder
      <span class="text-xs text-muted font-mono">(v{{ versionTag }})</span>
    </h1>

    <!-- Roster Management Section -->
    <RosterManager
      v-model:rosterName="rosterName"
      :roster="roster"
      :gameRules="gameRulesData"
      @edit-unit="editHev"
      @remove-unit="removeHevFromRoster"
      @import-roster="handleImportRoster"
      @export-roster="handleExportRoster"
      @format-print="formatForPrint"
    />

    <hr class="divider my-8 border-t border-border-color" />

    <TabNavigation
      :tabs="tabs"
      v-model:activeTab="activeTab"
    >
      <HevCustomizer
        v-if="activeTab === 'hev'"
        ref="hevCustomizerRef"
        :game-rules="gameRulesData"
        @add-hev="addHevToRoster"
      />
      <SupportAssets
        v-if="activeTab === 'support'"
        @add-support-asset="addSupportAssetToRoster"
      />
    </TabNavigation>

    <!-- Footer with disclaimer -->
    <Footer :versionTag="versionTag" />
  </div>
</template>
