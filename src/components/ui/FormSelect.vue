<template>
  <div class="form-group" :class="{ 'mb-3': marginBottom }">
    <label v-if="label" :for="id" class="block mb-2 font-medium text-text">{{ label }}</label>
    <select
      :id="id"
      :value="valueForSelect"
      @change="handleChange($event)"
      :disabled="disabled"
      :required="required"
      class="block w-full px-3 py-2 text-base font-normal text-text bg-input-bg border border-input-border rounded focus:outline-none focus:border-primary"
    >
      <slot></slot>
    </select>
    <slot name="error"></slot>
    <slot name="help"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number, Object],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  marginBottom: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const valueForSelect = computed(() => {
  // If the model value is an object, we need to stringify it for comparison
  if (typeof props.modelValue === 'object' && props.modelValue !== null) {
    return JSON.stringify(props.modelValue)
  }
  return props.modelValue
})

function handleChange(event) {
  try {
    // Try to parse as JSON first in case it's an object or array
    const parsedValue = JSON.parse(event.target.value)
    emit('update:modelValue', parsedValue)
  } catch {
    // If it's not valid JSON, try to parse as number if appropriate
    const value = event.target.value;
    // Check if it's a valid number and not a string that starts with 0 (which would be treated as octal)
    if (!isNaN(value) && !isNaN(parseFloat(value)) && (value.length === 1 || value[0] !== '0')) {
      emit('update:modelValue', Number(value))
    } else {
      // Otherwise emit as string
      emit('update:modelValue', value)
    }
  }
}
</script>
