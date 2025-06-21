# Steel Rift Builder Component API Documentation

This document provides standardized API documentation for all reusable components in the Steel Rift Builder application, making them easier to use consistently throughout the codebase.

## UI Components

### `BubbleDisplay.vue`

A component that renders a series of bubbles to represent armor or structure points.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `''` | Label to display next to bubbles |
| `value` | `Number` | `0` | Number of bubbles to display |
| `isStructure` | `Boolean` | `false` | Whether to style as structure (red) vs armor (blue) |

**Example**
```vue
<BubbleDisplay label="Armor" :value="6" />
<BubbleDisplay label="Structure" :value="4" :isStructure="true" />
```

### `Button.vue`

A standardized button component with consistent styling.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `String` | `'primary'` | Button style variant: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, or `outline-secondary` |
| `size` | `String` | `'normal'` | Size variant: `small`, `normal`, or `large` |
| `disabled` | `Boolean` | `false` | Whether the button is disabled |
| `type` | `String` | `'button'` | HTML button type |

**Slots**
| Name | Description |
|------|-------------|
| default | Button content |

**Events**
| Name | Description |
|------|-------------|
| `click` | Emitted when button is clicked |

**Example**
```vue
<Button variant="success" @click="saveForm">Save HE-V</Button>
<Button variant="danger" :disabled="isNotRemovable">Remove</Button>
```

### `Card.vue`

A container component with consistent card styling.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | `null` | Optional card title |
| `hasHeader` | `Boolean` | `false` | Whether to show a header section |
| `hasFooter` | `Boolean` | `false` | Whether to show a footer section |

**Slots**
| Name | Description |
|------|-------------|
| default | Main card content |
| header | Card header content (if `hasHeader` is true) |
| footer | Card footer content (if `hasFooter` is true) |

**Example**
```vue
<Card title="HE-V Summary">
  <div>Card content here</div>
</Card>

<Card :hasHeader="true" :hasFooter="true">
  <template #header>
    <h3>Custom Header</h3>
  </template>
  <div>Main content</div>
  <template #footer>
    <Button>Action</Button>
  </template>
</Card>
```

### `FormSelect.vue`

A standardized form select field with consistent styling.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `String` | required | Unique ID for the select element |
| `label` | `String` | required | Label text for the select |
| `modelValue` | `any` | `null` | Value for v-model binding |
| `required` | `Boolean` | `false` | Whether the field is required |
| `disabled` | `Boolean` | `false` | Whether the field is disabled |

**Slots**
| Name | Description |
|------|-------------|
| default | Select options content (usually `<option>` elements) |
| help | Optional help text displayed below the select |

**Events**
| Name | Description |
|------|-------------|
| `update:modelValue` | Emitted when value changes |

**Example**
```vue
<FormSelect 
  id="hevClass"
  label="HE-V Class:"
  v-model="selectedClass"
>
  <option :value="null" disabled>-- Select Class --</option>
  <option v-for="cls in classes" :key="cls.id" :value="cls">
    {{ cls.name }}
  </option>
</FormSelect>
```

### `SelectedItem.vue`

A component that displays a selected item with a remove button.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | required | Primary label for the item |
| `details` | `String` | `''` | Optional details text |
| `disabled` | `Boolean` | `false` | Whether the remove button is disabled |

**Slots**
| Name | Description |
|------|-------------|
| default | Additional content to display |

**Events**
| Name | Description |
|------|-------------|
| `remove` | Emitted when the remove button is clicked |

**Example**
```vue
<SelectedItem
  label="Auto-Cannon"
  details="(Cost: 3T)"
  @remove="removeWeapon(index)"
/>
```

### `MemoizedTraitFormatter.vue`

A component providing optimized trait formatting.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `String` | `''` | Class name for context-specific trait values |

**Methods**
| Name | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `formatTraitDisplay` | `(trait: Object)` | `String` | Formats a trait for display with memoization |

**Example**
```vue
<template>
  <div>
    <MemoizedTraitFormatter ref="formatter" :className="selectedClass?.name" />
    <div v-for="trait in weapon.traits">
      {{ formatter.formatTraitDisplay(trait) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MemoizedTraitFormatter from './ui/MemoizedTraitFormatter.vue'

const formatter = ref(null)

onMounted(() => {
  // Can access formatTraitDisplay method after component is mounted
  if (formatter.value) {
    const formatted = formatter.value.formatTraitDisplay(someTrait)
    console.log(formatted)
  }
})
</script>
```

### `TabNavigation.vue`

A component for tab-based navigation.

**Props**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Array` | required | Array of tab objects `{ id, label }` |
| `activeTab` | `String` | required | Currently active tab ID |

**Events**
| Name | Description |
|------|-------------|
| `update:activeTab` | Emitted when active tab changes, with new tab ID |

**Slots**
| Name | Description |
|------|-------------|
| default | Content area for tab panels |

**Example**
```vue
<TabNavigation
  :tabs="[{ id: 'hev', label: 'HE-V Configuration' }, { id: 'support', label: 'Support Assets' }]"
  v-model:activeTab="activeTab"
>
  <HevCustomizer v-if="activeTab === 'hev'" />
  <SupportAssets v-if="activeTab === 'support'" />
</TabNavigation>
```

## Form Layout Patterns

### Standard Form Group

Standard pattern for form controls:

```vue
<div class="form-group">
  <label for="inputId" class="form-label">Label Text:</label>
  <input id="inputId" class="form-control" />
</div>
```

### Two Column Form Layout

```vue
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div class="form-group">
    <!-- Left column form control -->
  </div>
  <div class="form-group">
    <!-- Right column form control -->
  </div>
</div>
```

### Section Headers

```vue
<h3 class="section-title">Section Name</h3>
```

## Custom CSS Classes

See `src/assets/components.css` for all available helper classes:

- `.btn` variants: primary, secondary, success, danger, warning, info, outline-secondary
- `.card` for card containers
- `.form-control` for form inputs
- `.section-title` for section headers
- `.item-list` and `.selected-item` for item lists
- `.summary-item` for summary displays
- `.defense-row` for defense displays
