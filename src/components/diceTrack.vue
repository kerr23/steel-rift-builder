<script setup>
import { computed, ref } from 'vue' // No watch needed here

// --- Props ---
const props = defineProps({
  // Label ('Armor' or 'Structure')
  label: { type: String, required: true },
  // The base die object determined by the HE-V class
  baseDie: { type: Object, default: null },
  // The currently selected modification ('stripped', 'standard', 'reinforced')
  // Used with v-model
  modification: { type: String, default: 'standard' },
  // Array of all possible die definitions from gameData
  allDice: { type: Array, required: true },
  // Max step available in allDice
  maxDieStep: { type: Number, required: true },
  // Flag to indicate if this track should show structure thresholds
  isStructureTrack: { type: Boolean, default: false },
})

// --- Emits ---
// Necessary for v-model binding on the 'modification' prop
const emit = defineEmits(['update:modification'])

// --- Local State (if needed, e.g. for internal dropdown binding) ---
// We can directly bind v-model to the prop if mutation isn't needed locally,
// but using a local ref synched with the prop is often safer if complex interactions occur.
// For simplicity here, we'll bind directly in the template.

// --- Helper: Find Die by Step ---
const findDieByStep = (step) => {
  if (!props.allDice) return null
  return props.allDice.find((d) => d.step === step)
}

// --- Computed Properties ---

// Calculate the effective die based on base and modification
const effectiveDie = computed(() => {
  if (!props.baseDie) return null
  let targetStep = props.baseDie.step

  if (props.modification === 'stripped') {
    targetStep = Math.max(0, props.baseDie.step - 1)
  } else if (props.modification === 'reinforced') {
    targetStep = Math.min(props.maxDieStep, props.baseDie.step + 1)
  }
  return findDieByStep(targetStep)
})

// Determine cost and sides from the effective die
const cost = computed(() => effectiveDie.value?.armorCost ?? 0) // Assuming armor/struct cost is same
const sides = computed(() => effectiveDie.value?.sides ?? 0)

// Determine if modification options should be disabled
const canStrip = computed(() => props.baseDie && props.baseDie.step > 0)
const canReinforce = computed(() => props.baseDie && props.baseDie.step < props.maxDieStep)

// Available modification options (could be static or computed if needed)
const modificationOptions = ref([
  { value: 'stripped', label: 'Stripped' },
  { value: 'standard', label: 'Standard' },
  { value: 'reinforced', label: 'Reinforced' },
])

// --- Structure Threshold Computations (only if isStructureTrack) ---
const structureRedZoneEnd = computed(() => {
  if (!props.isStructureTrack) return 0
  const s = sides.value
  return s > 0 ? Math.floor(s * 0.25) : 0
})
const structureOrangeZoneEnd = computed(() => {
  if (!props.isStructureTrack) return 0
  const s = sides.value
  return s > 0 ? Math.floor(s * 0.5) : 0
})
const structureYellowZoneEnd = computed(() => {
  if (!props.isStructureTrack) return 0
  const s = sides.value
  return s > 0 ? Math.floor(s * 0.75) : 0
})
// Marker Indices
const structureMarkerIndexYellow = computed(() => {
  if (!props.isStructureTrack) return 0
  const s = sides.value
  return s > 0 ? s - Math.floor(s * 0.75) + 1 : 0
})
const structureMarkerIndexOrange = computed(() => {
  if (!props.isStructureTrack) return 0
  const s = sides.value
  return s > 0 ? s - Math.floor(s * 0.5) + 1 : 0
})
const structureMarkerIndexRed = computed(() => {
  if (!props.isStructureTrack) return 0
  const s = sides.value
  return s > 0 ? s - Math.floor(s * 0.25) + 1 : 0
})

// --- Event Handler for Dropdown ---
// Emit the update event when the select value changes
const onModificationChange = (event) => {
  emit('update:modification', event.target.value)
}
</script>

<template>
  <div class="dice-control card">
    <label>{{ label }}</label>
    <div class="dice-details-line">
      <div class="bubble-display" :title="`Effective Die: ${effectiveDie?.die || 'N/A'}`">
        <!-- Structure Bubbles -->
        <template v-if="isStructureTrack">
          <template v-for="n in sides" :key="`${label}-bubble-${n}`">
            <!-- Dividers -->
            <span
              v-if="n === structureMarkerIndexYellow"
              class="threshold-divider divider-yellow"
              title="25% Damage Threshold"
            ></span>
            <span
              v-else-if="n === structureMarkerIndexOrange"
              class="threshold-divider divider-red"
              title="50% Damage Threshold"
            ></span>
            <span
              v-else-if="n === structureMarkerIndexRed"
              class="threshold-divider divider-black"
              title="75% Damage Threshold"
            ></span>
            <!-- Bubbles with color -->
            <span
              class="bubble"
              :class="{
                'bubble-black': n <= structureRedZoneEnd,
                'bubble-red': n > structureRedZoneEnd && n <= structureOrangeZoneEnd,
                'bubble-yellow': n > structureOrangeZoneEnd && n <= structureYellowZoneEnd,
              }"
            ></span>
          </template>
        </template>
        <!-- Armor Bubbles (or fallback) -->
        <template v-else>
          <span class="bubble" v-for="n in sides" :key="`${label}-bubble-${n}`"></span>
        </template>
        <!-- Placeholder if no sides -->
        <span v-if="sides === 0" class="placeholder-text-inline">N/A</span>
      </div>

      <!-- Modification Dropdown -->
      <select :value="modification" @change="onModificationChange" class="modification-select">
        <option
          v-for="opt in modificationOptions"
          :key="`${label}-mod-${opt.value}`"
          :value="opt.value"
          :disabled="
            (opt.value === 'stripped' && !canStrip) || (opt.value === 'reinforced' && !canReinforce)
          "
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Cost -->
      <span class="die-cost">({{ cost }}T)</span>
      <!-- Base Die Label (Optional) -->
      <span class="base-die-label">(Base: {{ baseDie?.die || 'N/A' }})</span>
    </div>

    <!-- Threshold Descriptions (Only for Structure) -->
    <div class="threshold-descriptions" v-if="isStructureTrack && sides > 0">
      <p v-if="structureMarkerIndexYellow > 1" class="threshold-desc-yellow">
        <strong>25% Dmg:</strong> All Move/Jump Orders -1
      </p>
      <p v-if="structureMarkerIndexOrange > 1" class="threshold-desc-red">
        <strong>50% Dmg:</strong> Weapon Damage -1 (min 1)
      </p>
      <p v-if="structureMarkerIndexRed > 1" class="threshold-desc-black">
        <strong>75% Dmg:</strong> Only 1 Order per activation
      </p>
    </div>
  </div>
</template>

<!-- Link to the SAME CSS file used by HevCustomizer, as styles are related -->
<!-- Or create a dedicated DiceTrack.css if preferred -->
<style src="./HevCustomizer.css" scoped></style>
