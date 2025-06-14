<template>
  <section class="support-assets card p-5">
    <h2 class="component-title text-center text-secondary mb-5 font-medium text-2xl">Support Assets</h2>

    <!-- Support Asset Class Selection -->
    <FormSelect
      id="supportAssetClass"
      label="Support Asset Class:"
      v-model="selectedClass"
    >
      <option v-for="cls in supportAssetClasses" :key="cls.value" :value="cls.value">
        {{ cls.label }}
      </option>
    </FormSelect>

    <!-- Off Table Support Options -->
    <div v-if="selectedClass === 'off-table'" class="mb-6">
      <FormSelect
        id="offTableType"
        label="Off Table Support Type:"
        v-model="selectedOffTableType"
      >
        <option v-for="type in OFF_TABLE_TYPES" :key="type.id" :value="type.id">
          {{ type.name }}
        </option>
      </FormSelect>

      <Button
        variant="success"
        class="mt-4"
        :disabled="!selectedOffTableType"
        @click="addSupportAsset"
      >
        Add to Roster
      </Button>
    </div>

    <!-- Ultra Light HE-V Squadron Options -->
    <div v-if="selectedClass === 'ultra-light'" class="mb-6">
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
            <Button
              variant="primary"
              size="sm"
              class="ml-auto"
              :class="{
                'opacity-80': selectedUltraLightTypes.filter(v => v === type.id).length === 0,
                'opacity-50': selectedUltraLightTypes.length === 3 || selectedUltraLightTypes.filter(v => v === type.id).length >= 3
              }"
              :disabled="selectedUltraLightTypes.length === 3 || selectedUltraLightTypes.filter(v => v === type.id).length >= 3"
              @click="() => addUltraLightType(type.id)"
            >
              Add
            </Button>
          </div>
          <ul class="text-sm space-y-1">
            <li><span><strong>Speed:</strong> {{ type.speed }}</span></li>
            <li><span><strong>Armor:</strong> {{ type.armor }}</span></li>
            <li><span><strong>Weapon Systems:</strong> {{ type.weapons.join(', ') }}</span></li>
            <li><span><strong>Traits:</strong> {{ type.traits.join(', ') }}</span></li>
          </ul>
          <div v-if="selectedUltraLightTypes.filter(v => v === type.id).length > 0" class="mt-2 flex flex-wrap gap-1">
            <span v-for="(n, idx) in selectedUltraLightTypes.filter(v => v === type.id).length" :key="idx" class="inline-block px-2 py-0.5 bg-primary text-white text-xs rounded">Selected</span>
            <Button
              variant="danger"
              size="sm"
              class="ml-2"
              @click="() => removeUltraLightType(type.id)"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <FormSelect
          id="upgradePod"
          label="Select Upgrade Pod (required):"
          v-model="selectedUpgradePodId"
        >
          <option value="" disabled>Select an upgrade pod</option>
          <option v-for="pod in UL_HEV_UPGRADE_PODS" :key="pod.id" :value="pod.id">
            {{ pod.name }}
          </option>
        </FormSelect>

        <div v-if="selectedUpgradePod" class="mt-2 text-sm p-2 rounded support-pod-details">
          <strong>{{ selectedUpgradePod.name }}</strong><br>
          <span v-if="selectedUpgradePod.damage !== 'N/A'"><strong>Damage:</strong> {{ selectedUpgradePod.damage }}<br></span>
          <span v-if="selectedUpgradePod.range !== 'N/A'"><strong>Range:</strong> {{ selectedUpgradePod.range }}<br></span>
          <span v-if="selectedUpgradePod.traits && selectedUpgradePod.traits.length"><strong>Traits:</strong> {{ selectedUpgradePod.traits.join(', ') }}<br></span>
          <span v-if="selectedUpgradePod.description">{{ selectedUpgradePod.description }}</span>
        </div>
      </div>

      <div class="mt-4">
        <Button
          variant="success"
          :disabled="getUltraLightSquadron().length !== 3 || !selectedUpgradePodId"
          @click="addUltraLightSquadron"
        >
          Add Squadron to Roster
        </Button>
      </div>
    </div>

    <!-- Ultra Light Vehicle (ULV) Options -->
    <div v-if="selectedClass === 'ulv'" class="mb-6">
      <label class="block mb-2 font-medium text-text">Select Ultra-Light Vehicles for Squadron (Max 10 Armor Points Total):</label>

      <div class="flex flex-wrap gap-4 mb-4">
        <div
          v-for="type in ulvTypes"
          :key="type.id"
          class="ulhev-card border rounded-lg p-4 w-64 flex flex-col items-start relative"
          :class="selectedUlvTypes.includes(type.id) ? 'border-primary ring-2 ring-primary' : 'border-input-border'"
        >
          <div class="flex items-center w-full mb-2">
            <span class="font-semibold text-base">{{ type.type }}</span>
            <Button
              v-if="!selectedUlvTypes.includes(type.id)"
              variant="primary"
              size="sm"
              class="ml-auto"
              :disabled="totalUlvArmorPoints + type.armor > 10"
              @click="() => addUlv(type.id)"
            >
              Add
            </Button>
          </div>
          <ul class="text-sm space-y-1">
            <li><span><strong>Speed:</strong> {{ type.speed }}</span></li>
            <li><span><strong>Armor:</strong> {{ type.armor }}</span></li>
            <li><span><strong>Weapon Systems:</strong> {{ type.weapons.join(', ') }}</span></li>
            <li><span><strong>Traits:</strong> {{ type.traits.join(', ') }}</span></li>
          </ul>
          <div v-if="selectedUlvTypes.includes(type.id)" class="mt-2 flex flex-wrap gap-1 w-full">
            <div class="w-full flex items-center justify-between">
              <span class="inline-block px-2 py-0.5 bg-primary text-white text-xs rounded">Selected</span>
              <Button
                variant="danger"
                size="sm"
                @click="() => removeUlv(type.id)"
              >
                Remove
              </Button>
            </div>
            <div class="w-full mt-2">
              <label class="text-xs font-medium">Additional Armor:</label>
              <div class="flex gap-1 mt-1">
                <Button
                  v-for="n in 5"
                  :key="n"
                  size="sm"
                  :variant="(selectedUlvArmorPoints[type.id] || 0) >= n ? 'primary' : 'outline-secondary'"
                  :disabled="totalUlvArmorPoints - (selectedUlvArmorPoints[type.id] || 0) + n > 10"
                  @click="() => setUlvArmorPoints(type.id, n)"
                  class="px-2 py-0 text-xs min-w-6"
                >
                  {{ n }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm">
          <strong>Total Armor Points:</strong> <span :class="{'text-danger': totalUlvArmorPoints > 10}">{{ totalUlvArmorPoints }}/10</span>
        </div>
        <Button
          variant="success"
          :disabled="selectedUlvTypes.length === 0 || totalUlvArmorPoints > 10"
          @click="addUlvSquadron"
        >
          Add ULV Squadron to Roster
        </Button>
      </div>
    </div>

    <!-- Support Asset Preview -->
    <div class="support-asset-list">
      <div v-if="selectedClass === 'off-table' && selectedOffTableType" class="support-asset-card border border-border rounded-lg p-4 mb-4">
        <h3 class="text-lg font-semibold mb-2">{{ getOffTableAsset(selectedOffTableType).name }}</h3>
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
import { UL_HEV_UPGRADE_PODS, UL_HEV_TYPES, OFF_TABLE_TYPES, ULV_TYPES } from '../gameData.js'
import FormSelect from './ui/FormSelect.vue'
import Button from './ui/Button.vue'

const emit = defineEmits(['add-support-asset'])

// --- Support Asset Classes ---
const supportAssetClasses = [
  { value: 'off-table', label: 'Off Table Support' },
  { value: 'ultra-light', label: 'Ultra-Light HE-V' },
  { value: 'ulv', label: 'Ultra-Light Vehicle' }, // Added ULV option
  { value: 'light-vehicle', label: 'Light Vehicle' },
  { value: 'infantry-outpost', label: 'Infantry Outpost' },
]
const selectedClass = ref(supportAssetClasses[0].value)

// --- Off Table Support Types ---
// Using imported OFF_TABLE_TYPES from gameData.js
const selectedOffTableType = ref('')

// --- Ultra-Light HE-V Types ---
const ultraLightTypes = UL_HEV_TYPES
const selectedUltraLightTypes = ref([])
const selectedUpgradePodId = ref('')

const selectedUpgradePod = computed(() => UL_HEV_UPGRADE_PODS.find(p => p.id === selectedUpgradePodId.value) || null)

// --- Ultra-Light Vehicle (ULV) Types ---
const ulvTypes = ULV_TYPES
const selectedUlvTypes = ref([])
const selectedUlvArmorPoints = ref({})

const totalUlvArmorPoints = computed(() => {
  // Calculate total armor points from base armor + additional armor
  return selectedUlvTypes.value.reduce((total, typeId) => {
    const type = ulvTypes.find(t => t.id === typeId)
    if (!type) return total
    return total + type.armor + (selectedUlvArmorPoints.value[typeId] || 0)
  }, 0)
})

// --- Ultra-Light Squadron Functions ---
function getUltraLightSquadron() {
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

// --- Off Table Support Functions ---
function getOffTableAsset(typeId) {
  const asset = OFF_TABLE_TYPES.find(t => t.id === typeId)
  if (!asset) return { name: '', details: [] }

  // Format details from the structured data
  const details = [
    `<strong>Damage:</strong> ${asset.damage}`,
    `<strong>Traits:</strong> ${asset.traits.join(', ')}`,
    `<strong>Targeting Restriction:</strong> ${asset.targetRestriction}`
  ]

  // Add note if available
  if (asset.note) {
    details.push(`<strong>Note:</strong> ${asset.note}`)
  }

  // Always add tonnage as 10T
  details.push('<strong>Tonnage:</strong> 10T')

  return {
    id: asset.id,
    name: asset.name,
    details
  }
}

function addSupportAsset() {
  const asset = getOffTableAsset(selectedOffTableType.value)
  if (!asset.id && !asset.name) return
  // Emit to parent (App.vue) to add to roster
  emit('add-support-asset', {
    class: 'Off Table Support',
    type: asset.name,
    details: asset.details
  })
  // Reset selection
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

  // Reset selections
  selectedUltraLightTypes.value = []
  selectedUpgradePodId.value = ''
}

// --- Ultra-Light Vehicle Functions ---
function addUlv(typeId) {
  if (!selectedUlvTypes.value.includes(typeId)) {
    const type = ulvTypes.find(t => t.id === typeId)
    if (type && totalUlvArmorPoints.value + type.armor <= 10) {
      selectedUlvTypes.value.push(typeId)
      // Initialize with 0 additional armor points
      selectedUlvArmorPoints.value[typeId] = 0
    }
  }
}

function removeUlv(typeId) {
  const idx = selectedUlvTypes.value.indexOf(typeId)
  if (idx !== -1) {
    selectedUlvTypes.value.splice(idx, 1)
    // Remove armor points for this unit
    delete selectedUlvArmorPoints.value[typeId]
  }
}

function setUlvArmorPoints(typeId, points) {
  const type = ulvTypes.find(t => t.id === typeId)
  if (type) {
    const baseArmor = type.armor
    const otherUnitsArmor = totalUlvArmorPoints.value - baseArmor - (selectedUlvArmorPoints.value[typeId] || 0)

    // Ensure we don't exceed 10 total armor points
    if (otherUnitsArmor + baseArmor + points <= 10) {
      selectedUlvArmorPoints.value[typeId] = points
    }
  }
}

function getUlvSquadronDetails() {
  // Get all selected ULVs with their configuration
  const squadron = selectedUlvTypes.value.map(typeId => {
    const type = ulvTypes.find(t => t.id === typeId)
    if (!type) return null

    return {
      ...type,
      totalArmor: type.armor + (selectedUlvArmorPoints.value[typeId] || 0)
    }
  }).filter(Boolean)

  return squadron
}

function addUlvSquadron() {
  const squadron = getUlvSquadronDetails()
  if (squadron.length === 0 || totalUlvArmorPoints.value > 10) return

  // Generate a fun name for the squadron
  const funNames = [
    'Lightning', 'Specter', 'Phantom', 'Swift', 'Wraith', 'Ghost', 'Viper', 'Cobra', 'Talon', 'Raptor',
    'Saber', 'Razor', 'Mantis', 'Jaguar', 'Puma', 'Lynx', 'Scorpion', 'Raven', 'Hawk', 'Serpent'
  ]
  const funName = funNames[Math.floor(Math.random() * funNames.length)] + ' ULV Squadron'

  // Create the details array
  const details = [];

  // Add unit-specific details
  for (const unit of squadron) {
    details.push(`<u>${unit.type}</u>`);
    details.push(`<strong>Speed:</strong> ${unit.speed}`);
    details.push(`<strong>Armor:</strong> ${unit.totalArmor}`);
    details.push(`<strong>Weapon Systems:</strong> ${unit.weapons.join(', ')}`);
    details.push(`<strong>Traits:</strong> ${unit.traits.join(', ')}`);
  }

  // Add tonnage information as the last item
  details.push('<strong>Tonnage:</strong> 10T');

  // Create and emit the final squadron data
  emit('add-support-asset', {
    class: 'Ultra-Light Vehicle Squadron',
    type: funName,
    details: details
  })

  // Reset selections
  selectedUlvTypes.value = []
  selectedUlvArmorPoints.value = {}
}
</script>

<style scoped>
/* Use Tailwind classes instead of custom CSS when possible */

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
