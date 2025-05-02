<script setup>
// ... imports ...
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import HevCustomizer from './components/HevCustomizer.vue'
import { gameData as importedGameData } from './gameData.js'

const rosterName = ref('')
const roster = ref([])
const hevCustomizerRef = ref(null)
const gameRulesData = importedGameData

const totalRosterTonnage = computed(() => {
  /* ... */
})

const addHevToRoster = (hevData) => {
  console.log('Adding HEV to roster:', hevData) // Log received data
  roster.value.push({
    ...hevData,
    id: Date.now() + Math.random(),
  })
  if (hevCustomizerRef.value) {
    hevCustomizerRef.value.resetForm()
  } else {
    console.warn('Could not access hevCustomizerRef to reset form.')
  }
}

const calculateWeaponTonnageForPdf = (weapon, quantity) => {
  /* ... */
}

const downloadPdf = () => {
  const doc = new jsPDF()
  let yPos = 15
  const pageHeight = doc.internal.pageSize.height
  const margin = 10
  const addText = (text, size, style = 'normal', indent = 0) => {
    /* ... */
  }

  addText(`Steel Rift Roster: ${rosterName.value || 'Unnamed Roster'}`, 18, 'bold')
  yPos += 5
  addText(`Total Roster Tonnage: ${totalRosterTonnage.value}`, 14)
  yPos += 8

  roster.value.forEach((unit, index) => {
    // ... page break / separator logic ...

    addText(`Unit: ${unit.unitName || 'Unnamed HE-V'}`, 14, 'bold')
    addText(
      `Class: ${unit.selectedClass?.name || 'N/A'} (${unit.selectedMotiveType?.name || 'Standard'})`,
      11,
    )
    // *** Read from effective dice objects in roster data ***
    addText(
      `Armor Die: ${unit.effectiveArmorDie?.die || 'N/A'} | Structure Die: ${unit.effectiveStructureDie?.die || 'N/A'}`,
      11,
    )
    addText(`Unit Total Tonnage: ${unit.totalUnitTonnage}`, 11)
    yPos += 4

    addText('Weapon Systems:', 12, 'bold')
    if (unit.selectedWeapons && unit.selectedWeapons.length > 0) {
      /* ... */
    } else {
      addText('None', 10, 'italic', 5)
    }
    yPos += 4

    addText('Upgrades:', 12, 'bold')
    if (unit.selectedUpgrades && unit.selectedUpgrades.length > 0) {
      /* ... */
    } else {
      addText('None', 10, 'italic', 5)
    }
    yPos += 8
  })

  const filename = `${(rosterName.value || 'SteelRiftRoster').replace(/[^a-z0-9_-]/gi, '_')}.pdf`
  doc.save(filename)
}
</script>

<template>
  <div id="app" class="container">
    <h1>Steel Rift Force Roster & HE-V Customizer</h1>

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
            <span class="roster-item-name">{{ unit.unitName || 'Unnamed HE-V' }}</span>
            <span class="roster-item-details">
              ({{ unit.selectedClass?.name || 'N/A' }} /
              {{ unit.selectedMotiveType?.name || 'Standard' }})
              <!-- *** Read from effective dice objects *** -->
              [A:{{ unit.effectiveArmorDie?.die || '?' }} S:{{
                unit.effectiveStructureDie?.die || '?'
              }}]
            </span>
            <span class="roster-item-tonnage">{{ unit.totalUnitTonnage }} T</span>
          </li>
        </ul>
        <p v-else class="placeholder-text">No HE-Vs added to the roster yet.</p>
      </div>
      <div class="action-buttons">
        <button
          @click="downloadPdf"
          :disabled="roster.length === 0"
          class="btn btn-primary"
          title="Download..."
        >
          Download Roster as PDF
        </button>
      </div>
    </section>

    <hr class="divider" />

    <HevCustomizer ref="hevCustomizerRef" :game-rules="gameRulesData" @add-hev="addHevToRoster" />
  </div>
</template>

<!-- Global styles loaded via main.js -->
