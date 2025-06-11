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
    <div v-if="selectedClass === 'ultra-light'" class="form-group mb-6">
      <label class="block mb-2 font-medium text-text">Select 3 Ultra-Light HE-Vs for Squadron:</label>
      <div class="flex flex-wrap gap-4 mb-4">
        <div
          v-for="type in ultraLightTypes"
          :key="type.id"
          class="ulhev-card border rounded-lg p-4 w-64 flex flex-col items-start relative"
          :class="selectedUltraLightTypes.includes(type.id) ? 'border-primary ring-2 ring-primary' : 'border-input-border'"
        >
          <div class="flex items-center w-full mb-2">
            <span class="font-semibold text-base">{{ type.type }}</span>
            <button
              type="button"
              class="ml-auto px-3 py-1 rounded bg-primary text-white font-semibold text-xs"
              :class="{
                'opacity-80': selectedUltraLightTypes.filter(v => v === type.id).length === 0,
                'opacity-50': selectedUltraLightTypes.length === 3 || selectedUltraLightTypes.filter(v => v === type.id).length >= 3
              }"
              :disabled="selectedUltraLightTypes.length === 3 || selectedUltraLightTypes.filter(v => v === type.id).length >= 3"
              @click="() => addUltraLightType(type.id)"
            >
              Add
            </button>
          </div>
          <ul class="text-sm space-y-1">
            <li><span><strong>Speed:</strong> {{ type.speed }}</span></li>
            <li><span><strong>Armor:</strong> {{ type.armor }}</span></li>
            <li><span><strong>Weapon Systems:</strong> {{ type.weapons.join(', ') }}</span></li>
            <li><span><strong>Traits:</strong> {{ type.traits.join(', ') }}</span></li>
          </ul>
          <div v-if="selectedUltraLightTypes.filter(v => v === type.id).length > 0" class="mt-2 flex flex-wrap gap-1">
            <span v-for="(n, idx) in selectedUltraLightTypes.filter(v => v === type.id).length" :key="idx" class="inline-block px-2 py-0.5 bg-primary text-white text-xs rounded">Selected</span>
            <button
              v-if="selectedUltraLightTypes.filter(v => v === type.id).length > 0"
              class="ml-2 px-2 py-0.5 rounded bg-red-500 text-white text-xs"
              @click="() => removeUltraLightType(type.id)"
              type="button"
            >Remove</button>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label class="block mb-2 font-medium text-text">Select Upgrade Pod (required):</label>
        <select v-model="selectedUpgradePodId" class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary">
          <option value="" disabled>Select an upgrade pod</option>
          <option v-for="pod in UL_HEV_UPGRADE_PODS" :key="pod.id" :value="pod.id">
            {{ pod.name }}
          </option>
        </select>
        <div v-if="selectedUpgradePod" class="mt-2 text-sm p-2 rounded support-pod-details">
          <strong>{{ selectedUpgradePod.name }}</strong><br>
          <span v-if="selectedUpgradePod.damage !== 'N/A'"><strong>Damage:</strong> {{ selectedUpgradePod.damage }}<br></span>
          <span v-if="selectedUpgradePod.range !== 'N/A'"><strong>Range:</strong> {{ selectedUpgradePod.range }}<br></span>
          <span v-if="selectedUpgradePod.traits && selectedUpgradePod.traits.length"><strong>Traits:</strong> {{ selectedUpgradePod.traits.join(', ') }}<br></span>
          <span v-if="selectedUpgradePod.description">{{ selectedUpgradePod.description }}</span>
        </div>
      </div>
      <div class="mt-4">
        <button
          class="btn btn-success px-4 py-2 rounded bg-success text-white font-semibold"
          :disabled="getUltraLightSquadron().length !== 3 || !selectedUpgradePodId"
          @click="addUltraLightSquadron"
        >
          Add Squadron to Roster
        </button>
      </div>
    </div>
    <div class="support-asset-list">
      <div v-if="selectedClass === 'off-table' && selectedOffTableType" class="support-asset-card border border-border-color rounded-lg p-4 mb-4">
        <h3 class="text-lg font-semibold mb-2">{{ getOffTableAsset(selectedOffTableType).label }}</h3>
        <ul class="text-sm mb-2">
          <li v-for="line in getOffTableAsset(selectedOffTableType).details" :key="line"><span v-html="line"></span></li>
        </ul>
        <p class="text-xs text-muted italic">Add this Support Asset to your force.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UL_HEV_UPGRADE_PODS, UL_HEV_TYPES } from '../gameData.js'

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

const ultraLightTypes = UL_HEV_TYPES
const selectedUltraLightTypes = ref([])
const selectedUpgradePodId = ref('')

const selectedUpgradePod = computed(() => UL_HEV_UPGRADE_PODS.find(p => p.id === selectedUpgradePodId.value) || null)

function getUltraLightSquadron() {
  // Use id instead of value
  const squadron = selectedUltraLightTypes.value.map(val => ultraLightTypes.find(t => t.id === val)).filter(Boolean)
  return squadron
}

function addUltraLightType(typeId) {
  const currentTypeCount = selectedUltraLightTypes.value.filter(v => v === typeId).length
  if (selectedUltraLightTypes.value.length < 3 && currentTypeCount < 3) {
    selectedUltraLightTypes.value.push(typeId)
  }
}
function removeUltraLightType(typeId) {
  const idx = selectedUltraLightTypes.value.lastIndexOf(typeId)
  if (idx !== -1) {
    selectedUltraLightTypes.value.splice(idx, 1)
  }
}

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

function addUltraLightSquadron() {
  const squadron = getUltraLightSquadron()
  if (squadron.length !== 3 || !selectedUpgradePodId.value) return
  // Generate a random fun name for the squadron
  const funNames = [
    'Ghostrider', 'Thunderbolt', 'Vanguard', 'Ironclad', 'Firefly', 'Spectre', 'Blitz', 'Nova', 'Warden', 'Phantom',
    'Sentinel', 'Tempest', 'Falcon', 'Titan', 'Shadow', 'Peregrine', 'Basilisk', 'Gryphon', 'Manticore', 'Hydra'
  ]
  const funName = funNames[Math.floor(Math.random() * funNames.length)] + ' Squadron'
  // Use new structure for details
  emit('add-support-asset', {
    class: 'Ultra-Light HE-V Squadron',
    type: funName, // Use the fun name for the roster list
    details: [
      ...squadron.flatMap(u => [
        `<u>${u.type}</u>`,
        `<strong>Speed:</strong> ${u.speed}`,
        `<strong>Armor:</strong> ${u.armor}`,
        `<strong>Weapon Systems:</strong> ${u.weapons.join(', ')}`,
        `<strong>Traits:</strong> ${u.traits.join(', ')}`
      ]),
      '<strong>Tonnage:</strong> 10T'
    ],
    upgradePodId: selectedUpgradePodId.value
  })
  selectedUltraLightTypes.value = []
  selectedUpgradePodId.value = ''
}
</script>

<style scoped>
/* Dark mode specific styles */
.support-pod-details {
  background: var(--light-grey);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.ulhev-card {
  background-color: var(--card-bg-color) !important;
  border-color: var(--border-color);
  color: var(--text-color);
}

.support-asset-card {
  background-color: var(--card-bg-color) !important;
  border-color: var(--border-color);
  color: var(--text-color);
}
</style>
