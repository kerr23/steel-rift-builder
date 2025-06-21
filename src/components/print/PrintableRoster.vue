<template>
  <div class="printable-roster">
    <button class="print-button" @click="printRoster">Print Roster</button>
    <div v-if="rosterHtml" v-html="rosterHtml"></div>
  </div>
</template>

<script>
import { prepareRosterForPrint } from '@/services/printService.js';

export default {
  name: 'PrintableRoster',
  props: {
    roster: {
      type: Array,
      required: true
    },
    rosterName: {
      type: String,
      default: ''
    },
    totalRosterBaseTonnage: {
      type: Number,
      default: 0
    },
    getBaseTonnageFunc: {
      type: Function,
      required: true
    },
    formatHelpersObj: {
      type: Object,
      required: true
    },
    gameRulesObj: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      rosterHtml: ''
    };
  },
  created() {
    this.generateRosterHtml();
  },
  watch: {
    roster: {
      deep: true,
      handler() {
        this.generateRosterHtml();
      }
    },
    rosterName() {
      this.generateRosterHtml();
    },
    totalRosterBaseTonnage() {
      this.generateRosterHtml();
    }
  },
  methods: {
    generateRosterHtml() {
      if (!this.roster || this.roster.length === 0) {
        this.rosterHtml = '<p>No units in roster</p>';
        return;
      }

      this.rosterHtml = prepareRosterForPrint(
        this.roster,
        this.rosterName,
        this.totalRosterBaseTonnage,
        this.getBaseTonnageFunc,
        this.formatHelpersObj,
        this.gameRulesObj
      );
    },
    printRoster() {
      window.print();
    }
  }
};
</script>

<style scoped>
.printable-roster {
  padding: 1rem;
}

.print-button {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.print-button:hover {
  background-color: #45a049;
}

@media print {
  .print-button {
    display: none;
  }
}
</style>
