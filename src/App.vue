<script setup>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import HevCustomizer from './components/HevCustomizer.vue'
import { gameData as importedGameData } from './gameData.js'

// --- App State ---
const rosterName = ref('')
const roster = ref([]) // Holds the array of HE-V objects
const hevCustomizerRef = ref(null) // Template ref for HevCustomizer component instance
const gameRulesData = importedGameData
const fileInputRef = ref(null)

// --- Computed Properties ---
const totalRosterTonnage = computed(() => {
  return roster.value.reduce((total, unit) => total + (unit?.totalUnitTonnage || 0), 0)
})

// --- Methods ---
const addHevToRoster = (hevData) => {
  console.log('Adding HEV to roster:', hevData)
  roster.value.push({
    ...hevData,
    // Ensure a unique ID - use timestamp + random for simple uniqueness
    id: hevData.id || Date.now() + Math.random(),
  })
  if (hevCustomizerRef.value) {
    hevCustomizerRef.value.resetForm() // Clear form after adding
  } else {
    console.warn('Could not access hevCustomizerRef to reset form.')
  }
}

// *** NEW: Remove HE-V from Roster ***
const removeHevFromRoster = (unitId) => {
  const index = roster.value.findIndex((unit) => unit.id === unitId)
  if (index !== -1) {
    roster.value.splice(index, 1)
    console.log(`Removed HE-V with ID: ${unitId}`)
  } else {
    console.warn(`Could not find HE-V with ID ${unitId} to remove.`)
  }
}

// *** NEW: Edit HE-V (Remove from list, Load into Customizer) ***
const editHev = (unitToEdit) => {
  if (!hevCustomizerRef.value) {
    console.error('Cannot edit: HevCustomizer component reference not found.')
    alert('Error: Cannot access the customizer component.')
    return
  }
  if (!unitToEdit || unitToEdit.id === undefined) {
    console.error('Cannot edit: Invalid unit data provided.', unitToEdit)
    alert('Error: Invalid unit data for editing.')
    return
  }

  console.log(`Editing HE-V with ID: ${unitToEdit.id}`)

  // 1. Load the data into the customizer component
  // Use deep copy to avoid modifying the original object if removal fails
  hevCustomizerRef.value.loadHevForEditing(JSON.parse(JSON.stringify(unitToEdit)))

  // 2. Remove the original unit from the roster
  removeHevFromRoster(unitToEdit.id)

  // 3. Optional: Scroll to the customizer?
  // hevCustomizerRef.value.$el.scrollIntoView({ behavior: 'smooth' });
}

// PDF generation helper
const calculateNthWeaponCostPdf = (weaponData, n, className) => {
  /* ... */
}
const calculateGroupWeaponTonnagePdf = (weaponData, quantity, className) => {
  /* ... */
}
const downloadPdf = () => {
  /* ... */
}

// Export/Import methods
const exportRosterJson = () => {
  /* ... */
}
const triggerFileInput = () => {
  /* ... */
}
const importRosterJson = (event) => {
  /* ... */
}
</script>

<template>
  <div id="app" class="container">
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
          <!-- *** UPDATED Roster Item Display with Buttons *** -->
          <li v-for="unit in roster" :key="unit.id" class="roster-item">
            <!-- Unit Info -->
            <div class="roster-item-info">
              <span class="roster-item-name">{{ unit.unitName || 'Unnamed HE-V' }}</span>
              <span class="roster-item-details">
                ({{ unit.selectedClass?.name || 'N/A' }} /
                {{ unit.selectedMotiveType?.name || 'Standard' }}) [A:{{
                  unit.effectiveArmorDie?.die || '?'
                }}
                S:{{ unit.effectiveStructureDie?.die || '?' }}] - {{ unit.totalUnitTonnage }} T
              </span>
            </div>
            <!-- Action Buttons for Roster Item -->
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
          @click="downloadPdf"
          :disabled="roster.length === 0"
          class="btn btn-primary"
          title="Download the current roster as a PDF file"
        >
          Download Roster as PDF
        </button>
      </div>
    </section>

    <hr class="divider" />

    <!-- HE-V Customization Section -->
    <HevCustomizer ref="hevCustomizerRef" :game-rules="gameRulesData" @add-hev="addHevToRoster" />
  </div>
</template>

<!-- No <style> block, styles are in main.css -->
