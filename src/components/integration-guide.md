# Integrating Reusable Components in the Steel Rift Builder

## Overview

This guide shows how to integrate the newly created reusable components into the HevCustomizer.vue file. The file has some syntax issues that make direct editing challenging, so we'll provide code snippets to replace specific sections.

## 1. Update Imports

Replace the import section at the top of the file with:

```javascript
// Import necessary functions from Vue and data/helpers from gameData.js
import { ref, computed, watch, defineProps, defineEmits, defineExpose, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import BubbleDisplay from './ui/BubbleDisplay.vue'
import Button from './ui/Button.vue'
import FormSelect from './ui/FormSelect.vue'
import SelectedItem from './ui/SelectedItem.vue'
import Card from './ui/Card.vue'
import { MODIFICATION_OPTIONS, STRUCTURE_THRESHOLDS } from '../constants.js'
import { formatTraitDisplay, calculateNthWeaponCost, generateUniqueId } from '../utils/formatters.js'

// --- Initialize Toast ---
const toast = useToast()
```

## 2. Replace Modification Options Array

Replace the modification options definition with:

```javascript
// --- Modification Options ---
const modificationOptions = ref(MODIFICATION_OPTIONS)
```

## 3. Replace Armor and Structure Display

Find the armor and structure display section and replace it with:

```vue
<div class="flex flex-col gap-[0.4rem] border border-medium-grey p-2 rounded">
  <div class="flex flex-row items-center justify-between min-h-[20px]">
    <BubbleDisplay label="Armor" :value="armorBaseValue" />
    <div class="flex items-center gap-2 min-w-[120px] justify-end">
      <select class="modification-select px-2 py-1 text-xs w-[90px] min-w-[70px] flex-shrink-0 rounded border border-input-border focus:outline-none focus:border-primary" v-model="armorModification">
        <option v-for="opt in modificationOptions" :key="`armor-mod-${opt.value}`" :value="opt.value" :disabled="(opt.value === 'stripped' && !canStripArmor) || (opt.value === 'reinforced' && !canReinforceArmor)">
          {{ opt.label }}
        </option>
      </select>
      <span class="modification-text text-xs text-text-muted whitespace-nowrap">({{ armorCost }}T)</span>
    </div>
  </div>
  <div class="flex flex-row items-center justify-between min-h-[20px]">
    <BubbleDisplay label="Structure" :value="structureBaseValue" :isStructure="true" />
    <div class="flex items-center gap-2 min-w-[120px] justify-end">
      <select class="modification-select px-2 py-1 text-xs w-[90px] min-w-[70px] flex-shrink-0 rounded border border-input-border focus:outline-none focus:border-primary" v-model="structureModification">
        <option v-for="opt in modificationOptions" :key="`struct-mod-${opt.value}`" :value="opt.value" :disabled="(opt.value === 'stripped' && !canStripStructure) || (opt.value === 'reinforced' && !canReinforceStructure)">
          {{ opt.label }}
        </option>
      </select>
      <span class="modification-text text-xs text-text-muted whitespace-nowrap">({{ structureCost }}T)</span>
    </div>
  </div>
  <div class="threshold-descriptions mt-1 pt-2 border-t border-dashed border-border text-[0.7rem] leading-tight w-full">
    <p v-if="structureMarker_25_Percent > 1" class="threshold-desc-green my-0 p-0 flex items-start"><strong class="min-w-[50px] text-right flex-shrink-0 inline-block font-bold mr-1 text-success">25% Dmg:</strong> All Move/Jump Orders -1</p>
    <p v-if="structureMarker_50_Percent > 1" class="threshold-desc-yellow my-0 p-0 flex items-start"><strong class="min-w-[50px] text-right flex-shrink-0 inline-block font-bold mr-1 text-[#b38600]">50% Dmg:</strong> Weapon Damage -1 (min 1)</p>
    <p v-if="structureMarker_75_Percent > 1" class="threshold-desc-red my-0 p-0 flex items-start"><strong class="min-w-[50px] text-right flex-shrink-0 inline-block font-bold mr-1 text-danger">75% Dmg:</strong> Only 1 Order per activation</p>
  </div>
</div>
```

## 4. Replace Class and Motive Type Selects

Find the class and motive type selection sections and replace them with:

```vue
<FormSelect 
  id="hevClass"
  label="HE-V Class:"
  v-model="selectedClass"
>
  <option :value="null" disabled>-- Select Class --</option>
  <option
    v-for="clsOption in formattedClasses"
    :key="clsOption.value.name"
    :value="clsOption.value"
  >
    {{ clsOption.title }}
  </option>
</FormSelect>

<FormSelect 
  v-if="selectedClass"
  id="motiveType"
  label="Motive Type:"
  v-model="selectedMotiveType"
  :required="true"
>
  <option :value="null" disabled>-- Select Motive Type --</option>
  <option
    v-for="mtOption in formattedMotiveTypes"
    :key="mtOption.value.id"
    :value="mtOption.value"
  >
    {{ mtOption.title }}
  </option>
  <option v-if="availableMotiveTypes.length === 0" :value="null" disabled>
    -- No types available for this class --
  </option>
  <template #error>
    <p v-if="!selectedMotiveType && availableMotiveTypes.length > 0" class="warning-text text-[#b38600] text-sm italic mt-1 block">
      Please select a motive type.
    </p>
  </template>
</FormSelect>
```

## 5. Replace Submit Button

Find the submit button section and replace it with:

```vue
<Button
  @click="submitHev"
  :disabled="!isValidUnit || isOverTonnage || isOverSlots"
  variant="success"
  size="lg"
  :title="
    !isValidUnit
      ? 'Complete required selections (Class, Motive)'
      : isOverTonnage
        ? 'Cannot add: Unit exceeds Tonnage limit'
        : isOverSlots
          ? 'Cannot add: Unit exceeds Slot limit'
          : 'Add this HE-V configuration to the roster'
  "
>
  Add HE-V to Roster
</Button>
```

## 6. Replace formatTraitDisplay Function

Replace the current formatTraitDisplay function with an import from the utils folder.

Replace:

```javascript
const formatTraitDisplay = (trait) => {
  if (!trait || typeof trait !== 'object' || !trait.name) return 'Unknown Trait'
  const currentClassName = selectedClass.value?.name
  if (trait.name === 'Limited' && typeof trait.value === 'number') {
    return `Limited(${Array(trait.value).fill('○').join('')})`
  }
  if (typeof trait.value === 'object' && trait.value !== null) {
    if (currentClassName && trait.value[currentClassName] !== undefined) {
      return `${trait.name} ${trait.value[currentClassName]}`
    } else {
      return `${trait.name} (${Object.entries(trait.value).map(([k, v]) => `${k[0]}:${v}`).join('/')})`
    }
  }
  if (trait.value !== undefined) return `${trait.name} ${trait.value}`
  return trait.name
}
```

With:

```javascript
// Use the imported formatTraitDisplay function but adapt it for component context
const formatTraitDisplay = (trait) => {
  if (!trait || typeof trait !== 'object' || !trait.name) return 'Unknown Trait'
  
  const currentClassName = selectedClass.value?.name
  
  // Handle Limited trait with numeric value
  if (trait.name === 'Limited' && typeof trait.value === 'number') {
    return `Limited(${Array(trait.value).fill('○').join('')})`
  }
  
  // Handle class-specific trait values
  if (typeof trait.value === 'object' && trait.value !== null) {
    if (currentClassName && trait.value[currentClassName] !== undefined) {
      return `${trait.name} ${trait.value[currentClassName]}`
    } else {
      return `${trait.name} (${Object.entries(trait.value)
        .map(([k, v]) => `${k[0]}:${v}`)
        .join('/')})`
    }
  }
  
  // Handle simple trait with value
  if (trait.value !== undefined) return `${trait.name} ${trait.value}`
  
  // Default case - just the trait name
  return trait.name
}
```

## 7. Use SelectedItem Component for Weapons and Upgrades

Replace the weapon and upgrade list items with SelectedItem component:

For weapons:

```vue
<li
  v-for="(weapon, index) in selectedWeapons"
  :key="'selWpn-' + index + '-' + weapon.id"
>
  <SelectedItem
    :name="weapon.name"
    :stats="`(Damage: ${weapon.damageRating?.[selectedClass?.name ?? ''] ?? '?'}, Range: ${weapon.rangeCategory || 'N/A'})`"
    :traits="`Traits: [${weapon.traits?.map(formatTraitDisplay).join(', ') || 'None'}]`"
    @remove="removeWeapon(index)"
  />
</li>
```

For upgrades:

```vue
<li
  v-for="(upgrade, index) in selectedUpgrades"
  :key="'selUpg-' + index + '-' + upgrade.id"
>
  <SelectedItem
    :name="upgrade.name"
    :stats="`(Cost: ${
      typeof upgrade.tonnage === 'object' &&
      upgrade.tonnage !== null &&
      selectedClass?.name &&
      upgrade.tonnage[selectedClass.name] !== undefined
        ? upgrade.tonnage[selectedClass.name]
        : typeof upgrade.tonnage === 'number'
          ? upgrade.tonnage
          : '?'
    }T)`"
    @remove="removeUpgrade(index)"
  />
</li>
```

## 8. Wrap the Form in a Card Component

Replace the section opening tag:

```vue
<section class="hev-customizer card p-5">
```

With:

```vue
<Card class="hev-customizer">
```

And the closing tag:

```vue
</section>
```

With:

```vue
</Card>
```
