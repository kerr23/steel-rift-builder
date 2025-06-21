# Testing Standards for Steel Rift Builder

## Overview

This document outlines the testing standards for the Steel Rift Builder project to ensure consistent, maintainable tests. Following these standards helps maintain high code quality and reduces regression bugs.

## Test Organization

### File Structure

- Test files should be placed in `__tests__` folders adjacent to the code being tested
- Test file names should mirror the source file name with `.spec.js` appended
- For UI components: `ComponentName.spec.js`
- For services and utilities: `serviceName.spec.js`

### Test File Template

```javascript
// Import test libraries
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'

// Import the component/module to test
import ComponentName from '../ComponentName.vue'

describe('ComponentName', () => {
  // Test setup
  let wrapper
  
  beforeEach(() => {
    // Common setup before each test
  })
  
  afterEach(() => {
    // Common cleanup after each test
    vi.clearAllMocks()
  })
  
  // Group tests by functionality
  describe('rendering', () => {
    it('renders correctly with default props', () => {
      // Test implementation
    })
    
    // More rendering tests...
  })
  
  describe('user interactions', () => {
    it('responds to user click events', async () => {
      // Test implementation
    })
    
    // More interaction tests...
  })
})
```

## Testing Practices

### Component Testing

1. **Mount or ShallowMount**
   - Use `shallowMount` for isolated component testing
   - Use `mount` when child component interaction is important
   - Be consistent within a test suite

2. **Props Testing**
   - Test default prop values
   - Test component behavior with different prop values
   - Test prop validation if implemented

3. **Event Testing**
   - Verify events are emitted with correct payloads
   - Test event handlers modify component state correctly

4. **Slot Testing**
   - Test default slot content
   - Test named slots render correctly

5. **Conditional Rendering**
   - Test that conditional UI elements appear/hide based on props/state

### Service Testing

1. **Function Testing**
   - Test function inputs and outputs
   - Test edge cases and error conditions
   - Test side effects when applicable

2. **Mocking Dependencies**
   - Mock external services using `vi.mock()`
   - Create and use mock factories for complex objects

3. **State Management Testing**
   - Test store actions modify state correctly
   - Test getters return expected values
   - Mock store when testing components that use store

## Mocking Strategies

### Common Mocking Patterns

```javascript
// Mock localStorage
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    },
    writable: true
  })
})

// Mock toast notifications
beforeEach(() => {
  vi.mock('vue-toastification', () => ({
    useToast: () => ({
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    })
  }))
})
```

### Test Data Factories

Create helper functions that generate consistent test data:

```javascript
// In testHelpers.js
export function createMockHev(overrides = {}) {
  return {
    id: 'test-hev-1',
    unitName: 'Test HE-V',
    selectedClass: { name: 'Light', baseTonnage: 20, baseSlots: 4, baseArmor: 6, baseStructure: 4 },
    selectedWeapons: [],
    selectedUpgrades: [],
    totalUnitTonnage: 20,
    ...overrides
  }
}

export function createMockSupportAsset(overrides = {}) {
  return {
    id: 'test-support-1',
    isSupportAsset: true,
    type: 'Artillery Barrage',
    details: ['<strong>Damage:</strong> 4'],
    totalUnitTonnage: 10,
    ...overrides
  }
}
```

## Assertions

### Preferred Assertion Styles

```javascript
// Component existence
expect(wrapper.find('.class-name').exists()).toBe(true)

// Text content
expect(wrapper.text()).toContain('Expected text')

// Props
expect(wrapper.props('propName')).toBe(expectedValue)

// Events
expect(wrapper.emitted('event-name')).toBeTruthy()
expect(wrapper.emitted('event-name')[0][0]).toEqual(expectedPayload)

// Component state
expect(wrapper.vm.stateProperty).toBe(expectedValue)
```

## Integration with CI

Tests should be integrated with the CI pipeline to ensure they run on every PR. The following scripts should be added to package.json:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Writing Maintainable Tests

1. **Keep tests focused**: Each test should verify a single behavior
2. **Use descriptive test names**: Names should describe what's being tested
3. **Avoid test interdependence**: Tests should not depend on other tests
4. **Clean up after tests**: Use afterEach for cleanup
5. **Document complex test setups**: Add comments for non-obvious setups

## Example Test Files

### Component Test Example

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import BubbleDisplay from '../BubbleDisplay.vue'

describe('BubbleDisplay', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(BubbleDisplay, {
      props: {
        label: 'Armor',
        value: 6
      }
    })
  })

  it('renders the correct number of bubbles', () => {
    const bubbles = wrapper.findAll('.bubble')
    expect(bubbles.length).toBe(6)
  })

  it('displays the label', () => {
    const label = wrapper.find('.bubble-label')
    expect(label.text()).toBe('Armor')
  })

  it('applies structure styling when isStructure=true', async () => {
    await wrapper.setProps({ isStructure: true })
    const bubbles = wrapper.findAll('.bubble')
    expect(bubbles[0].attributes('data-struct')).toBe('1')
  })
})
```

### Service Test Example

```javascript
import { describe, it, expect, vi } from 'vitest'
import { calculateNthWeaponCost, createHevUnit } from '../hevService'

describe('hevService', () => {
  describe('calculateNthWeaponCost', () => {
    it('calculates cost correctly for first weapon', () => {
      const weaponData = {
        id: 'test-weapon',
        tonnage: { Light: 3, Medium: 4 }
      }
      
      expect(calculateNthWeaponCost(weaponData, 1, 'Light')).toBe(3)
      expect(calculateNthWeaponCost(weaponData, 1, 'Medium')).toBe(4)
    })
    
    it('applies progressive penalty for additional weapons', () => {
      const weaponData = {
        id: 'test-weapon',
        tonnage: { Light: 3 }
      }
      
      expect(calculateNthWeaponCost(weaponData, 2, 'Light')).toBe(4) // 3 + 1
      expect(calculateNthWeaponCost(weaponData, 3, 'Light')).toBe(5) // 3 + 2
    })
  })
})
```
