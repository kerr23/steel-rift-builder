<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :title="title"
    :class="[
      'btn',
      `btn-${variant}`,
      {'btn-sm': size === 'sm'},
      {'opacity-60 cursor-not-allowed': disabled}
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'outline-secondary'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>

<style scoped>
/* Base button styles */
.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

/* Size variants */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.2rem;
}

/* Button variants */
.btn-primary {
  color: #fff;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
.btn-primary:hover:not(:disabled) {
  filter: brightness(90%);
}

.btn-secondary {
  color: #fff;
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}
.btn-secondary:hover:not(:disabled) {
  filter: brightness(90%);
}

.btn-success {
  color: #fff;
  background-color: var(--success-color);
  border-color: var(--success-color);
}
.btn-success:hover:not(:disabled) {
  filter: brightness(90%);
}

.btn-danger {
  color: #fff;
  background-color: var(--danger-color);
  border-color: var(--danger-color);
}
.btn-danger:hover:not(:disabled) {
  filter: brightness(90%);
}

.btn-warning {
  color: #000;
  background-color: var(--warning-color);
  border-color: var(--warning-color);
}
.btn-warning:hover:not(:disabled) {
  filter: brightness(90%);
}

.btn-info {
  color: #000;
  background-color: var(--info-color);
  border-color: var(--info-color);
}
.btn-info:hover:not(:disabled) {
  filter: brightness(90%);
}

.btn-outline-secondary {
  color: var(--secondary-color);
  background-color: transparent;
  border-color: var(--secondary-color);
}
.btn-outline-secondary:hover:not(:disabled) {
  color: #fff;
  background-color: var(--secondary-color);
}
</style>
