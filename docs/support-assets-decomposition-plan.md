# Support Assets Decomposition Plan

## Current Issues
- Component handles multiple different asset types
- Logic is intermixed for different asset categories
- Difficult to maintain and extend
- Complex state management

## Recommended Structure

1. **Main Component: SupportAssets.vue**
   - Handles asset type selection
   - Switches between specific asset type components
   - Provides shared state (if needed)

2. **Subcomponents by Asset Type:**

   ### `OffTableSupport.vue`
   - Handles off-table support asset creation
   - Manages off-table support types
   - Manages targeted vs. non-targeted options
   
   ### `UltraLightHev.vue`
   - Manages UL-HEV type selection
   - Handles upgrade pods
   - Generates squad details
   
   ### `UltraLightVehicle.vue`
   - Manages ULV type selection and counts
   - Calculates armor points
   - Generates squad details
   
   ### `InfantryOutpost.vue`
   - Manages bunker configurations
   - Handles infantry type selection
   - Manages weapon selection

3. **Shared Components:**

   ### `AssetTypeSelector.vue`
   ```vue
   <template>
     <div class="asset-type-selector">
       <FormSelect 
         id="supportAssetClass"
         label="Support Asset Class:"
         v-model="modelValue"
       >
         <option v-for="cls in assetClasses" :key="cls.value" :value="cls.value">
           {{ cls.label }}
         </option>
       </FormSelect>
     </div>
   </template>
   
   <script setup>
   import { defineProps, defineEmits } from 'vue'
   import FormSelect from '../ui/FormSelect.vue'
   
   const props = defineProps({
     modelValue: String,
     assetClasses: Array
   })
   
   const emit = defineEmits(['update:modelValue'])
   </script>
   ```

   ### `AssetDetailsList.vue`
   - Reusable component for displaying asset details
   - Handles formatting of traits, stats, etc.

## Implementation Strategy
1. Extract the common selection component first
2. Create individual components for each asset type
3. Update the main component to use the subcomponents
4. Reuse UI components (Button, FormSelect, etc.) consistently
5. Update tests to match the new structure

## Benefits
- Clear separation between different asset types
- Easier to add new asset types in the future
- More focused, smaller components
- Better testability
- Improved maintenance experience
