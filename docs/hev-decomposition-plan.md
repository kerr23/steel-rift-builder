# HE-V Customizer Decomposition Plan

## Current Issues
- Component is too large (900+ lines)
- Handles too many responsibilities
- Difficult to maintain and test
- Complex state management

## Recommended Structure

1. **Main Component: hevCustomizer.vue**
   - Orchestrates subcomponents
   - Provides core state management
   - Handles form submission
   - Injects context to child components

2. **Subcomponents:**

   ### `HevBasicInfo.vue`
   - Handles unit name and basic info
   - Manages class selection
   - Manages motive type selection
   
   ### `HevDefenseEditor.vue`
   - Manages armor and structure modifications
   - Displays defense bubbles
   - Shows damage thresholds
   
   ### `HevWeaponSelector.vue`
   - Handles weapon selection
   - Manages weapon list
   - Calculates weapon tonnage
   
   ### `HevUpgradeSelector.vue`
   - Handles upgrade selection
   - Manages upgrade list
   - Calculates upgrade tonnage
   
   ### `HevSummary.vue`
   - Displays unit summary
   - Shows tonnage usage
   - Shows slot usage
   - Warns about tonnage/slot issues

3. **Composables:**

   ### `useHevWeaponCost.js`
   ```javascript
   export function useHevWeaponCost(selectedClass, gameRules) {
     // Memoized weapon cost calculation
     const weaponCostCache = new Map();
     
     const calculateNthWeaponCost = (weaponData, n, className) => {
       // Implementation of the weapon cost calculation logic
     };
     
     const calculateTotalWeaponCost = (weapons) => {
       // Calculate total cost of all weapons
     };
     
     return {
       calculateNthWeaponCost,
       calculateTotalWeaponCost
     };
   }
   ```

   ### `useHevValidator.js`
   ```javascript
   export function useHevValidator(unit, maxTonnage, maxSlots) {
     // Validation functions for HE-V data
     const validateTonnage = () => unit.totalUnitTonnageUsed <= maxTonnage;
     const validateSlots = () => unit.usedSlots <= maxSlots;
     const validateRequiredFields = () => !!unit.selectedClass && !!unit.selectedMotiveType;
     
     return {
       validateTonnage,
       validateSlots,
       validateRequiredFields,
       isValid: () => validateTonnage() && validateSlots() && validateRequiredFields()
     };
   }
   ```

## Implementation Strategy
1. Create composables first to extract reusable logic
2. Create the subcomponents one by one
3. Update the main component to use the subcomponents
4. Update tests to match the new structure

## Benefits
- Improved component focus and cohesion
- Better testability
- Easier maintenance
- Clearer dependency flow
- Reusable logic through composables
