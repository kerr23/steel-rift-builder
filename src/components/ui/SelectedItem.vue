<template>
  <li
    class="selected-item single-line-item flex justify-between items-center gap-2 border-b border-medium-grey px-3 py-2 text-[0.85rem]"
  >
    <div class="item-info-line flex flex-wrap items-baseline gap-2 flex-grow overflow-hidden">
      <span class="item-name font-medium text-dark-grey whitespace-nowrap mr-1">{{ name }}</span>
      <span v-if="stats" class="item-stats text-[0.85em] text-secondary whitespace-nowrap mr-1">{{ stats }}</span>
      <span v-if="traits" class="item-traits text-[0.8em] text-text-muted whitespace-normal">{{ traits }}</span>
    </div>
    <button
      @click="$emit('remove')"
      class="btn btn-remove bg-danger text-white rounded-full w-5 h-5 leading-[18px] text-center font-bold cursor-pointer p-0 ml-2 flex-shrink-0 hover:bg-[#a71d2a]"
      title="Remove"
    >
      X
    </button>
  </li>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  stats: {
    type: String,
    default: ''
  },
  traits: {
    type: String,
    default: ''
  }
})

defineEmits(['remove'])
</script>

<style scoped>
.item-info-line {
  max-width: calc(100% - 30px);
}

.item-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-stats,
.item-traits {
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove {
  min-width: 20px;
  min-height: 20px;
}
</style>
