<template>
  <div class="test-components p-4 border border-gray-300 rounded-lg">
    <h2 class="text-lg font-bold mb-4">Component Test Page</h2>

    <div class="mb-6">
      <h3 class="text-md font-semibold mb-2">BubbleDisplay Component:</h3>
      <BubbleDisplay label="Armor" :value="8" />
      <BubbleDisplay label="Structure" :value="6" :isStructure="true" />
    </div>

    <div class="mb-6">
      <h3 class="text-md font-semibold mb-2">FormSelect Component:</h3>
      <FormSelect
        id="test-select"
        label="Test Select:"
        v-model="selectedOption"
      >
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </FormSelect>
      <p class="mt-2">Selected: {{ selectedOption }}</p>
    </div>

    <div class="mb-6">
      <h3 class="text-md font-semibold mb-2">Button Component:</h3>
      <Button @click="clickCount++" variant="primary" class="mr-2">Primary Button</Button>
      <Button @click="clickCount++" variant="success" class="mr-2">Success Button</Button>
      <Button @click="clickCount++" variant="danger">Danger Button</Button>
      <p class="mt-2">Click count: {{ clickCount }}</p>
    </div>

    <div class="mb-6">
      <h3 class="text-md font-semibold mb-2">Card Component:</h3>
      <Card title="Test Card">
        <p>This is content inside a card component.</p>
      </Card>
    </div>

    <div class="mb-6">
      <h3 class="text-md font-semibold mb-2">SelectedItem Component:</h3>
      <ul class="border border-gray-200 rounded">
        <SelectedItem
          name="Autocannon"
          stats="(Damage: 4, Range: Medium)"
          traits="Traits: [AP(3)]"
          @remove="removeItem"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BubbleDisplay from './BubbleDisplay.vue'
import FormSelect from './FormSelect.vue'
import Button from './Button.vue'
import Card from './Card.vue'
import SelectedItem from './SelectedItem.vue'

const selectedOption = ref('option1')
const clickCount = ref(0)

function removeItem() {
  alert('Remove item clicked')
}
</script>
