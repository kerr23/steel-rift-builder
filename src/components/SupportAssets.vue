<template>
  <section class="support-assets card p-5">
    <h2 class="component-title text-center text-secondary mb-5 font-medium text-2xl">Support Assets</h2>
    <div class="form-group mb-6">
      <label for="supportAssetClass" class="block mb-2 font-medium text-text">Support Asset Class:</label>
      <select id="supportAssetClass" v-model="selectedClass" class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary">
        <option v-for="cls in supportAssetClasses" :key="cls.value" :value="cls.value">
          {{ cls.label }}
        </option>
      </select>
    </div>
    <div v-if="selectedClass === 'off-table'" class="form-group mb-6">
      <label for="offTableType" class="block mb-2 font-medium text-text">Off Table Support Type:</label>
      <select id="offTableType" v-model="selectedOffTableType" class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary">
        <option v-for="type in offTableTypes" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>
      <button
        class="btn btn-success mt-4 px-4 py-2 rounded bg-success text-white font-semibold"
        :disabled="!selectedOffTableType"
        @click="addSupportAsset"
      >
        Add to Roster
      </button>
    </div>
    <div class="support-asset-list">
      <div v-if="selectedClass === 'off-table' && selectedOffTableType" class="support-asset-card border border-border-color rounded-lg p-4 mb-4 bg-light-grey">
        <h3 class="text-lg font-semibold mb-2">{{ getOffTableAsset(selectedOffTableType).label }}</h3>
        <ul class="text-sm mb-2">
          <li v-for="line in getOffTableAsset(selectedOffTableType).details" :key="line"><span v-html="line"></span></li>
        </ul>
        <p class="text-xs text-muted italic">Add this Support Asset to your force. Each use expends one Limited bubble.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-support-asset'])

const supportAssetClasses = [
  { value: 'off-table', label: 'Off Table Support' },
  { value: 'ultra-light', label: 'Ultra-Light HE-V' },
  { value: 'light-vehicle', label: 'Light Vehicle' },
  { value: 'infantry-outpost', label: 'Infantry Outpost' },
]
const selectedClass = ref(supportAssetClasses[0].value)

const offTableTypes = [
  {
    value: 'artillery-barrage',
    label: 'Artillery Barrage',
    details: [
      '<strong>Damage:</strong> 4',
      '<strong>Traits:</strong> Blast(6), Limited(3)',
      '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>'
    ]
  },
  {
    value: 'mass-driver',
    label: 'Mass Driver',
    details: [
      '<strong>Damage:</strong> 6',
      '<strong>Traits:</strong> Kinetic, Limited(3)',
      '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>',
      '<strong>Note:</strong> Treat this as Ultra-Heavy for Kinetic effects.'
    ]
  },
  {
    value: 'mine-drone-barrage',
    label: 'Mine-Drone Barrage',
    details: [
      '<strong>Damage:</strong> 3',
      '<strong>Traits:</strong> Blast(6), Limited(2), Smart',
      '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>'
    ]
  },
  {
    value: 'orbital-laser',
    label: 'Orbital Laser',
    details: [
      '<strong>Damage:</strong> 6',
      '<strong>Traits:</strong> Limited(1), AP(4)',
      '<strong>Targeting Restriction:</strong> Must be within LoS of a unit with <em>Target Designator</em>'
    ]
  }
]
const selectedOffTableType = ref('')

function getOffTableAsset(typeValue) {
  const asset = offTableTypes.find(t => t.value === typeValue)
  if (!asset) return { label: '', details: [] }
  // Always add tonnage as 10T
  return {
    ...asset,
    details: [
      ...asset.details,
      '<strong>Tonnage:</strong> 10T'
    ]
  }
}

function addSupportAsset() {
  const asset = getOffTableAsset(selectedOffTableType.value)
  if (!asset.value && !asset.label) return
  // Emit to parent (App.vue) to add to roster
  emit('add-support-asset', {
    class: 'Off Table Support',
    type: asset.label,
    details: asset.details
  })
  // Optionally reset selection
  selectedOffTableType.value = ''
}
</script>

<style scoped>
.support-assets {
  margin-top: 2rem;
}
.support-asset-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
</style>
