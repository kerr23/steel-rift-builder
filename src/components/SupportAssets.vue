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
          :class="selectedUlvTypeCounts[type.id] ? 'border-primary ring-2 ring-primary' : 'border-input-border'"
        >
          <div class="flex items-center w-full mb-2">
            <span class="font-semibold text-base">{{ type.type }}</span>
            <Button
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
          <div v-if="selectedUlvTypeCounts[type.id]" class="mt-2 flex flex-wrap gap-1 w-full">
            <div class="w-full flex items-center justify-between">
              <div class="flex flex-wrap gap-1">
                <span v-for="n in selectedUlvTypeCounts[type.id]" :key="n" class="inline-block px-2 py-0.5 bg-primary text-white text-xs rounded">
                  {{ n }}
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                @click="() => removeUlv(type.id)"
              >
                Remove
              </Button>
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
          :disabled="Object.keys(selectedUlvTypeCounts).length === 0 || totalUlvArmorPoints > 10"
          @click="addUlvSquadron"
        >
          Add ULV Squadron to Roster
        </Button>
      </div>
    </div>

    <!-- Infantry Outpost Options -->
    <div v-if="selectedClass === 'infantry-outpost'" class="mb-6">
      <label class="block mb-2 font-medium text-text">Configure Infantry Outpost with 2 Bunkers:</label>

      <!-- Container for both bunkers -->
      <div class="flex flex-col md:flex-row gap-4 mb-4">

        <!-- Bunker 1 -->
        <div class="border rounded-lg p-4 flex-1 bg-card-bg">
          <h3 class="text-lg font-semibold mb-3">Bunker 1</h3>

          <!-- Weapon System Selection -->
          <FormSelect
            id="bunker1Weapon"
            label="Select Weapon System:"
            v-model="bunker1.selectedWeaponId"
          >
            <option value="" disabled>Select a weapon system</option>
            <option v-for="weapon in INFANTRY_OUTPOST_WEAPONS" :key="weapon.id" :value="weapon.id">
              {{ weapon.name }}
            </option>
          </FormSelect>

          <!-- Infantry Selection -->
          <div class="mt-4">
            <label class="block mb-2 font-medium text-text">Infantry Garrison (1-6 units, max 2 Mine Drones):</label>

            <div v-for="infantry in INFANTRY_TYPES" :key="infantry.id" class="mb-3 p-2 border rounded-lg">
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ infantry.name }}</span>
                <div class="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    :disabled="bunker1.infantry[infantry.id] <= 0 || getTotalInfantryCount(bunker1.infantry) <= 1 && bunker1.infantry[infantry.id] === 1"
                    @click="adjustInfantryCount(1, infantry.id, -1)"
                  >
                    −
                  </Button>
                  <span class="w-6 text-center">{{ bunker1.infantry[infantry.id] || 0 }}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    :disabled="
                      getTotalInfantryCount(bunker1.infantry) >= 6 ||
                      (infantry.id === 'mine-drone' && bunker1.infantry[infantry.id] >= 2) ||
                      getTotalInfantryCount(bunker1.infantry) + getTotalInfantryCount(bunker2.infantry) >= 12
                    "
                    @click="adjustInfantryCount(1, infantry.id, 1)"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div class="mt-1 text-xs">
                <div><strong>Speed:</strong> {{ infantry.speed }}</div>
                <div><strong>Traits:</strong> {{ infantry.traits.join(', ') }}</div>
              </div>
            </div>
          </div>

          <!-- Bunker 1 Validation -->
          <div class="mt-3 text-sm">
            <div :class="{'text-danger': !isBunkerValid(1)}">
              <strong>Status:</strong>
              {{ isBunkerValid(1) ? "Valid Configuration" : "Invalid Configuration" }}
            </div>
            <div v-if="!isBunkerValid(1)" class="text-danger text-xs mt-1">
              Each bunker must have a weapon and at least one infantry unit.
            </div>
          </div>
        </div>

        <!-- Bunker 2 -->
        <div class="border rounded-lg p-4 flex-1 bg-card-bg">
          <h3 class="text-lg font-semibold mb-3">Bunker 2</h3>

          <!-- Weapon System Selection -->
          <FormSelect
            id="bunker2Weapon"
            label="Select Weapon System:"
            v-model="bunker2.selectedWeaponId"
          >
            <option value="" disabled>Select a weapon system</option>
            <option v-for="weapon in INFANTRY_OUTPOST_WEAPONS" :key="weapon.id" :value="weapon.id">
              {{ weapon.name }}
            </option>
          </FormSelect>

          <!-- Infantry Selection -->
          <div class="mt-4">
            <label class="block mb-2 font-medium text-text">Infantry Garrison (1-6 units, max 2 Mine Drones):</label>

            <div v-for="infantry in INFANTRY_TYPES" :key="infantry.id" class="mb-3 p-2 border rounded-lg">
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ infantry.name }}</span>
                <div class="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    :disabled="bunker2.infantry[infantry.id] <= 0 || getTotalInfantryCount(bunker2.infantry) <= 1 && bunker2.infantry[infantry.id] === 1"
                    @click="adjustInfantryCount(2, infantry.id, -1)"
                  >
                    −
                  </Button>
                  <span class="w-6 text-center">{{ bunker2.infantry[infantry.id] || 0 }}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    :disabled="
                      getTotalInfantryCount(bunker2.infantry) >= 6 ||
                      (infantry.id === 'mine-drone' && bunker2.infantry[infantry.id] >= 2) ||
                      getTotalInfantryCount(bunker1.infantry) + getTotalInfantryCount(bunker2.infantry) >= 12
                    "
                    @click="adjustInfantryCount(2, infantry.id, 1)"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div class="mt-1 text-xs">
                <div><strong>Speed:</strong> {{ infantry.speed }}</div>
                <div><strong>Traits:</strong> {{ infantry.traits.join(', ') }}</div>
              </div>
            </div>
          </div>

          <!-- Bunker 2 Validation -->
          <div class="mt-3 text-sm">
            <div :class="{'text-danger': !isBunkerValid(2)}">
              <strong>Status:</strong>
              {{ isBunkerValid(2) ? "Valid Configuration" : "Invalid Configuration" }}
            </div>
            <div v-if="!isBunkerValid(2)" class="text-danger text-xs mt-1">
              Each bunker must have a weapon and at least one infantry unit.
            </div>
          </div>
        </div>
      </div>

      <!-- Summary and Add to Roster Button -->
      <div class="mt-4">
        <div class="flex justify-between items-center mb-4">
          <div class="text-sm">
            <div><strong>Total Infantry:</strong> {{ getTotalInfantryCount(bunker1.infantry) + getTotalInfantryCount(bunker2.infantry) }}/12</div>
            <div v-if="getTotalInfantryCount(bunker1.infantry) + getTotalInfantryCount(bunker2.infantry) > 12" class="text-danger">
              Maximum infantry count exceeded!
            </div>
          </div>
        </div>

        <Button
          variant="success"
          :disabled="!isOutpostValid()"
          @click="addInfantryOutpost"
        >
          Add Infantry Outpost to Roster
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
import { UL_HEV_UPGRADE_PODS, UL_HEV_TYPES, OFF_TABLE_TYPES, ULV_TYPES, INFANTRY_OUTPOST_WEAPONS, INFANTRY_TYPES, INFANTRY_WEAPONS } from '../gameData.js'
import FormSelect from './ui/FormSelect.vue'
import Button from './ui/Button.vue'

const emit = defineEmits(['add-support-asset'])

// --- Support Asset Classes ---
const supportAssetClasses = [
  { value: 'off-table', label: 'Off Table Support' },
  { value: 'ultra-light', label: 'Ultra-Light HE-V' },
  { value: 'ulv', label: 'Ultra-Light Vehicle' }, // Added ULV option
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
// Store a count of each ULV type instead of just IDs
const selectedUlvTypeCounts = ref({})

const totalUlvArmorPoints = computed(() => {
  // Calculate total armor points from all selected ULVs
  return Object.entries(selectedUlvTypeCounts.value).reduce((total, [typeId, count]) => {
    const type = ulvTypes.find(t => t.id === typeId)
    if (!type) return total
    return total + (type.armor * count)
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
  const type = ulvTypes.find(t => t.id === typeId)
  if (type) {
    // Check if adding this ULV would exceed the 10 armor point limit
    if (totalUlvArmorPoints.value + type.armor <= 10) {
      // Initialize or increment the count for this type
      selectedUlvTypeCounts.value[typeId] = (selectedUlvTypeCounts.value[typeId] || 0) + 1
    }
  }
}

function removeUlv(typeId) {
  if (selectedUlvTypeCounts.value[typeId]) {
    // Decrease count by 1
    selectedUlvTypeCounts.value[typeId] -= 1

    // Remove the key if count reaches zero
    if (selectedUlvTypeCounts.value[typeId] <= 0) {
      delete selectedUlvTypeCounts.value[typeId]
    }
  }
}

function getUlvSquadronDetails() {
  // Get all selected ULVs with their counts
  const squadron = []

  Object.entries(selectedUlvTypeCounts.value).forEach(([typeId, count]) => {
    const type = ulvTypes.find(t => t.id === typeId)
    if (type) {
      // Add each ULV instance to the squadron
      for (let i = 0; i < count; i++) {
        squadron.push({
          ...type
        })
      }
    }
  })

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
    details.push(`<strong>Armor:</strong> ${unit.armor}`);
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
  selectedUlvTypeCounts.value = {}
}

// --- Infantry Outpost Functions ---
const bunker1 = ref({
  selectedWeaponId: '',
  infantry: {}
})

const bunker2 = ref({
  selectedWeaponId: '',
  infantry: {}
})

/**
 * Adjust infantry count in a bunker
 * @param {number} bunkerNum - Bunker number (1 or 2)
 * @param {string} infantryId - ID of infantry type
 * @param {number} delta - Amount to adjust by (+1 or -1)
 */
function adjustInfantryCount(bunkerNum, infantryId, delta) {
  const bunker = bunkerNum === 1 ? bunker1.value : bunker2.value

  // Initialize if needed
  if (!bunker.infantry[infantryId]) {
    bunker.infantry[infantryId] = 0
  }

  // Adjust count
  bunker.infantry[infantryId] += delta

  // Remove if zero
  if (bunker.infantry[infantryId] <= 0) {
    delete bunker.infantry[infantryId]
  }
}

/**
 * Get total infantry count in a bunker
 * @param {Object} infantryMap - Map of infantry id to count
 * @returns {number} - Total infantry count
 */
function getTotalInfantryCount(infantryMap) {
  return Object.values(infantryMap).reduce((sum, count) => sum + count, 0)
}

/**
 * Check if a bunker configuration is valid
 * @param {number} bunkerNum - Bunker number (1 or 2)
 * @returns {boolean} - Whether the bunker is valid
 */
function isBunkerValid(bunkerNum) {
  const bunker = bunkerNum === 1 ? bunker1.value : bunker2.value

  // Bunker must have a weapon
  if (!bunker.selectedWeaponId) {
    return false
  }

  // Bunker must have at least one infantry unit
  if (getTotalInfantryCount(bunker.infantry) < 1) {
    return false
  }

  // Bunker must have at most 6 infantry units
  if (getTotalInfantryCount(bunker.infantry) > 6) {
    return false
  }

  // Bunker must have at most 2 mine drones
  if (bunker.infantry['mine-drone'] && bunker.infantry['mine-drone'] > 2) {
    return false
  }

  return true
}

/**
 * Check if the entire outpost configuration is valid
 * @returns {boolean} - Whether the outpost is valid
 */
function isOutpostValid() {
  // Both bunkers must be valid
  if (!isBunkerValid(1) || !isBunkerValid(2)) {
    return false
  }

  // Total infantry count must not exceed 12
  const totalInfantry = getTotalInfantryCount(bunker1.value.infantry) + getTotalInfantryCount(bunker2.value.infantry)
  if (totalInfantry > 12) {
    return false
  }

  return true
}

/**
 * Get formatted details for a bunker
 * @param {Object} bunker - Bunker configuration
 * @returns {Array} - Formatted details for the bunker
 */
function getBunkerDetails(bunker) {
  const details = []
  const weapon = INFANTRY_OUTPOST_WEAPONS.find(w => w.id === bunker.selectedWeaponId)

  if (weapon) {
    details.push(`<u>${weapon.name}</u>`)
    details.push(`<strong>Damage:</strong> ${weapon.damage}`)
    details.push(`<strong>Range:</strong> ${weapon.range}`)
    details.push(`<strong>Traits:</strong> ${weapon.traits.join(', ')}`)
    details.push('') // Add spacing
  }

  // Group infantry by type
  const infantryGroups = {}
  Object.entries(bunker.infantry).forEach(([id, count]) => {
    infantryGroups[id] = count
  })

  // Add infantry details
  Object.entries(infantryGroups).forEach(([id, count]) => {
    const infantryType = INFANTRY_TYPES.find(i => i.id === id)
    if (!infantryType) return

    details.push(`<u>${count}x ${infantryType.name}</u>`)
    details.push(`<strong>Speed:</strong> ${infantryType.speed}`)
    details.push(`<strong>Traits:</strong> ${infantryType.traits.join(', ')}`)

    // Store infantry type weapons (to avoid repeating for each unit)
    let infantryWeapons = []
    if (id !== 'mine-drone' && infantryType.weaponIds) {
      infantryType.weaponIds.forEach(weaponId => {
        const weapon = INFANTRY_WEAPONS.find(w => w.id === weaponId)
        if (weapon) {
          infantryWeapons.push({
            name: weapon.name,
            damage: weapon.damage,
            range: weapon.range,
            traits: weapon.traits.join(', ')
          })
        }
      })
    }

    // For each individual unit, add a marker with type-specific data
    for (let i = 0; i < count; i++) {
      if (id === 'mine-drone') {
        details.push(`<strong>UNIT_START:MINE_DRONE</strong>`) // Marker for print processing
        details.push(`<strong>Mine Drone (${i+1}):</strong> ${infantryType.specialRules}`)
        details.push(`<strong>UNIT_END</strong>`) // End marker for print processing
      } else {
        details.push(`<strong>UNIT_START:INFANTRY</strong>`) // Marker for print processing
        details.push(`<strong>Infantry Unit ${i+1}</strong>`)
        details.push(`<strong>Structure:</strong> ${infantryType.structure || 1}`)

        // Add weapon data
        infantryWeapons.forEach(weapon => {
          details.push(`<strong>WEAPON:</strong> ${weapon.name}|${weapon.damage}|${weapon.range}|${weapon.traits}`)
        })

        details.push(`<strong>UNIT_END</strong>`) // End marker for print processing
      }
    }
    details.push('') // Add spacing between infantry types
  })

  return details
}

/**
 * Add Infantry Outpost to roster
 */
function addInfantryOutpost() {
  if (!isOutpostValid()) return

  // Generate formatted details
  const bunker1Details = getBunkerDetails(bunker1.value)
  const bunker2Details = getBunkerDetails(bunker2.value)

  const details = [
    '<u><strong>Bunker 1</strong></u>',
    ...bunker1Details,
    '<u><strong>Bunker 2</strong></u>',
    ...bunker2Details,
    '<strong>Traits:</strong> Fortification, Garrison(6), Command(2)',
    '<strong>Tonnage:</strong> 10T'
  ]

  emit('add-support-asset', {
    class: 'Infantry Outpost',
    type: 'Infantry Outpost',
    details: details,
    // Store the raw data for potential editing
    bunker1Config: JSON.parse(JSON.stringify(bunker1.value)),
    bunker2Config: JSON.parse(JSON.stringify(bunker2.value))
  })

  // Reset bunker configurations
  bunker1.value.selectedWeaponId = ''
  bunker1.value.infantry = {}
  bunker2.value.selectedWeaponId = ''
  bunker2.value.infantry = {}
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
