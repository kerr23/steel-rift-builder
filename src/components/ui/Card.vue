<template>
  <div
    class="card bg-card-bg border border-border-color rounded-lg shadow-md p-6"
    :class="{ 'mb-8': bottomMargin }"
  >
    <h2 v-if="title" class="text-xl font-semibold mb-4">{{ title }}</h2>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  bottomMargin: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.card {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
</style>
