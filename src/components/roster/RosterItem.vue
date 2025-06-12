<template>
  <li class="roster-item flex flex-col md:flex-row md:items-center justify-between bg-light-grey border border-border-color rounded p-3" role="listitem">
    <div class="roster-item-info flex flex-col md:flex-row md:items-center gap-2">
      <template v-if="unit.isSupportAsset">
        <span class="roster-item-name font-semibold">{{ unit.type }}</span>
        <span class="roster-item-details text-sm text-muted">(Support Asset - {{ unit.totalUnitTonnage }}T)</span>
      </template>
      <template v-else>
        <span class="roster-item-name font-semibold">{{ unit.unitName || 'Unnamed HE-V' }}</span>
        <span class="roster-item-details text-sm text-muted">
          ({{ unit.selectedClass?.name || 'N/A' }} - {{ unit.totalUnitTonnage ?? '?' }}T / {{ baseTonnage ?? '?' }}T)
        </span>
      </template>
    </div>
    <div class="roster-item-actions flex gap-2 mt-2 md:mt-0">
      <Button
        v-if="!unit.isSupportAsset"
        @click="$emit('edit', unit)"
        variant="secondary"
        :title="`Edit this HE-V`"
        :aria-label="`Edit ${unit.unitName || 'Unnamed HE-V'}`"
      >
        Edit
      </Button>
      <Button
        @click="$emit('remove', unit.id)"
        variant="danger"
        :title="`Remove this item`"
        :aria-label="`Remove ${unit.unitName || unit.type || 'Unnamed'}`"
      >
        Remove
      </Button>
    </div>
  </li>
</template>

<script setup>
import Button from '../ui/Button.vue';
import { computed } from 'vue';

const props = defineProps({
  unit: {
    type: Object,
    required: true
  },
  gameRules: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'remove']);

const baseTonnage = computed(() => {
  if (props.unit.isSupportAsset) return props.unit.totalUnitTonnage || 10;
  if (!props.unit.selectedClass) return 0;

  const cls = props.gameRules?.classes?.find(c => c.name === props.unit.selectedClass.name);
  return cls ? cls.baseTonnage : 0;
});
</script>
