# State Management Migration Plan

## Current State

Currently, the app manages state primarily in the `App.vue` component using Vue 3 refs:

```javascript
// In App.vue
const rosterName = ref('')
const roster = ref([])
const isDarkMode = ref(localStorage.getItem('isDarkMode') === 'true')
const activeTab = ref('hev')
```

This approach has limitations:
- State is not accessible to distant components without prop drilling
- Difficult to implement shared functionality across components
- Maintenance becomes challenging as the application grows
- Testing is complicated when state is embedded in components

## Migration to Pinia

### 1. Store Definitions

Create focused stores for different domains:

#### `rosterStore.js`
```javascript
// src/stores/rosterStore.js
import { defineStore } from 'pinia'

export const useRosterStore = defineStore('roster', {
  state: () => ({
    rosterName: '',
    roster: []
  }),
  
  getters: {
    totalRosterBaseTonnage: (state) => {
      // Calculation logic here
    },
    
    hevUnits: (state) => {
      return state.roster.filter(unit => !unit.isSupportAsset)
    },
    
    supportAssets: (state) => {
      return state.roster.filter(unit => unit.isSupportAsset)
    }
  },
  
  actions: {
    addHevToRoster(hevData) {
      // Logic to add HEV
    },
    
    addSupportAssetToRoster(asset) {
      // Logic to add support asset
    },
    
    removeFromRoster(unitId) {
      // Logic to remove unit
    },
    
    updateRosterName(name) {
      this.rosterName = name
    },
    
    // Import/export functions
    importRoster(data) {
      // Validation and import logic
    },
    
    exportRoster() {
      // Export logic
      return {
        rosterName: this.rosterName,
        roster: this.roster
      }
    },
    
    reorderRoster(newRosterOrder) {
      // Reordering logic
    }
  }
})
```

#### `themeStore.js`
```javascript
// src/stores/themeStore.js
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: localStorage.getItem('isDarkMode') === 'true'
  }),
  
  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('isDarkMode', this.isDarkMode)
      this.applyTheme()
    },
    
    initializeTheme() {
      // System preference detection logic
      this.applyTheme()
    },
    
    applyTheme() {
      const html = document.documentElement
      if (this.isDarkMode) {
        html.classList.add('dark-theme')
      } else {
        html.classList.remove('dark-theme')
      }
    }
  }
})
```

#### `uiStore.js`
```javascript
// src/stores/uiStore.js
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    activeTab: 'hev',
    lastAction: null,
    isLoading: false
  }),
  
  actions: {
    setActiveTab(tabId) {
      this.activeTab = tabId
    },
    
    setLoading(isLoading) {
      this.isLoading = isLoading
    },
    
    recordAction(action) {
      this.lastAction = {
        type: action,
        timestamp: Date.now()
      }
    }
  }
})
```

### 2. Migration Strategy

1. **Create the stores** without changing existing code
2. **Refactor App.vue** to use the stores instead of local state
    ```javascript
    // In App.vue
    import { useRosterStore } from './stores/rosterStore'
    import { useThemeStore } from './stores/themeStore'
    import { useUIStore } from './stores/uiStore'
    
    const rosterStore = useRosterStore()
    const themeStore = useThemeStore()
    const uiStore = useUIStore()
    
    // Update references from local state to store state
    // e.g., roster.value → rosterStore.roster
    ```
    
3. **Update child components** to use stores instead of props where appropriate
4. **Update event handlers** to call store actions instead of local methods

### 3. Benefits

- **Improved testability**: Stores can be tested in isolation
- **Better organization**: State logic is grouped by domain
- **Enhanced maintainability**: State changes are centralized and documented
- **Simplified component code**: Components focus on presentation, not state management
- **DevTools integration**: Pinia provides powerful debugging tools

### 4. Migration Timeline

| Phase | Tasks | Timeline |
|-------|-------|----------|
| 1. Setup | Create store files and define state structures | 1 day |
| 2. App.vue Refactoring | Move state from App.vue to stores | 1 day |
| 3. Component Updates | Update components to use stores | 2-3 days |
| 4. Testing | Ensure all functionality works with new state management | 1-2 days |

### 5. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes during migration | Implement and test one store at a time |
| Performance issues with new state management | Profile before and after to ensure no regression |
| Learning curve for team members | Create documentation and examples for using the stores |

## Conclusion

Migrating to Pinia will significantly improve the maintainability of the Steel Rift Builder codebase by centralizing state management and separating concerns. The migration can be done incrementally, reducing the risk of breaking changes while steadily improving the code architecture.
