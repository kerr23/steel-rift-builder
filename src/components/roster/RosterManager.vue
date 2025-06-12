<template>
  <section class="roster-manager card bg-card-bg border border-border-color rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4">Roster Management</h2>

    <div class="form-group mb-4 flex flex-col md:flex-row md:items-center gap-2">
      <input
        type="text"
        id="rosterName"
        v-model="rosterNameInput"
        placeholder="Enter Roster Name"
        class="input input-bordered w-full md:w-1/2 px-3 py-2 rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Roster Name"
      />
    </div>

    <div class="roster-summary mb-6">
      <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
        Roster Units <span class="tonnage-badge bg-primary text-white rounded px-2 py-1 text-xs">(Total: {{ totalRosterBaseTonnage }}T)</span>
      </h3>

      <ul v-show="roster.length > 0" class="space-y-2" role="list">
        <RosterItem
          v-for="unit in roster"
          :key="unit.id"
          :unit="unit"
          :gameRules="gameRules"
          @edit="onEditItem"
          @remove="onRemoveItem"
        />
      </ul>

      <p v-show="roster.length === 0" class="placeholder-text italic text-muted text-center py-4">
        No HE-Vs added to the roster yet.
      </p>
    </div>

    <div class="action-buttons flex flex-wrap gap-2">
      <input
        type="file"
        ref="fileInputRef"
        @change="importRosterJson"
        accept=".json,application/json"
        class="hidden"
        aria-label="Import roster from JSON file"
      />

      <Button
        @click="triggerFileInput"
        variant="secondary"
        title="Load roster from a JSON file"
        aria-label="Import Roster (JSON)"
      >
        Import Roster (JSON)
      </Button>

      <Button
        @click="exportRosterJson"
        :disabled="roster.length === 0 && !rosterNameInput"
        variant="info"
        title="Save current roster to a JSON file"
        aria-label="Export Roster (JSON)"
      >
        Export Roster (JSON)
      </Button>

      <Button
        @click="formatForPrint"
        :disabled="roster.length === 0"
        variant="warning"
        title="Open a printer-friendly version of the roster"
        aria-label="Format for Print"
      >
        Format for Print
      </Button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import RosterItem from './RosterItem.vue';
import Button from '../ui/Button.vue';

/**
 * Component for managing HE-V rosters, including import/export, print, edit/delete functionality
 *
 * @component
 */

const props = defineProps({
  /**
   * The name of the roster
   */
  rosterName: {
    type: String,
    default: ''
  },
  /**
   * Array of units (HE-V and support assets) in the roster
   */
  roster: {
    type: Array,
    required: true
  },
  /**
   * Game rules data containing classes, weapons, upgrades, etc.
   */
  gameRules: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:rosterName', 'edit-unit', 'remove-unit', 'import-roster', 'export-roster', 'format-print']);

const fileInputRef = ref(null);
const toast = useToast();
const rosterNameInput = ref(props.rosterName);

// Watch for roster name changes and emit to parent
watch(rosterNameInput, (newVal) => {
  emit('update:rosterName', newVal);
});

// Watch for prop changes to update local state
watch(() => props.rosterName, (newVal) => {
  rosterNameInput.value = newVal;
});

// Calculate total roster tonnage
const totalRosterBaseTonnage = computed(() => {
  return props.roster.reduce((total, unit) => total + getBaseTonnage(unit), 0);
});

/**
 * Get the base tonnage for a unit
 * @param {Object} unit - The unit to get tonnage for
 * @returns {number} - Base tonnage of the unit
 */
const getBaseTonnage = (unit) => {
  if (unit.isSupportAsset) return unit.totalUnitTonnage || 10;
  if (!unit.selectedClass) return 0;

  const cls = props.gameRules?.classes?.find(c => c.name === unit.selectedClass.name);
  return cls ? cls.baseTonnage : 0;
};

/**
 * Handle editing a unit
 * @param {Object} unit - The unit to edit
 */
const onEditItem = (unit) => {
  emit('edit-unit', unit);
};

/**
 * Handle removing a unit
 * @param {string} unitId - ID of unit to remove
 */
const onRemoveItem = (unitId) => {
  emit('remove-unit', unitId);
};

/**
 * Trigger file input click for import functionality
 */
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

/**
 * Import a roster from JSON file
 * @param {Event} event - File input change event
 */
const importRosterJson = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      // Validate data structure
      if (importedData &&
          typeof importedData === 'object' &&
          'rosterName' in importedData &&
          'roster' in importedData &&
          Array.isArray(importedData.roster)) {

        // Filter valid units
        const validUnits = importedData.roster.filter(
          (unit) => unit && typeof unit === 'object' && (
            // HE-Vs validation
            (unit.selectedClass && Array.isArray(unit.selectedWeapons) &&
             Array.isArray(unit.selectedUpgrades) &&
             typeof unit.totalUnitTonnage === 'number' &&
             unit.id !== undefined) ||
            // Support assets validation
            (unit.isSupportAsset && unit.type &&
             Array.isArray(unit.details) &&
             typeof unit.totalUnitTonnage === 'number' &&
             unit.id !== undefined)
          )
        );

        // Warn about skipped units
        if (validUnits.length !== importedData.roster.length) {
          const skippedCount = importedData.roster.length - validUnits.length;
          console.warn(`${skippedCount} unit(s) in the imported file were invalid/incomplete and were skipped.`);
          toast.warning(
            `Import Warning: ${skippedCount} unit(s) were skipped due to missing or invalid data.`,
            { timeout: 3000 }
          );
        }

        // Emit imported data to parent
        emit('import-roster', {
          rosterName: importedData.rosterName,
          roster: validUnits
        });

        toast.success(
          `Roster '${importedData.rosterName || 'Unnamed'}' imported successfully! ${validUnits.length} units loaded.`,
          { timeout: 3000 }
        );
      } else {
        throw new Error("Invalid JSON structure. Expected 'rosterName' (string) and 'roster' (array).");
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import roster: Invalid JSON or structure.', { timeout: 3000 });
    } finally {
      if (event.target) event.target.value = null;
    }
  };

  reader.onerror = () => {
    toast.error('Failed to read the selected file.', { timeout: 3000 });
    if (event.target) event.target.value = null;
  };

  reader.readAsText(file);
};

/**
 * Export roster as JSON file
 */
const exportRosterJson = () => {
  if (props.roster.length === 0 && !rosterNameInput.value) {
    toast.info('Nothing to export. Add units to your roster first.', { timeout: 3000 });
    return;
  }

  try {
    // Prepare export data
    const exportData = {
      rosterName: rosterNameInput.value || 'Unnamed Roster',
      exportDate: new Date().toISOString(),
      roster: props.roster
    };

    // Create blob and download
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${rosterNameInput.value || 'steel-rift-roster'}.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    toast.success('Roster exported successfully!', { timeout: 3000 });
    emit('export-roster', exportData);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export roster. Check console for details.', { timeout: 3000 });
  }
};

/**
 * Format roster for printing
 */
const formatForPrint = () => {
  if (props.roster.length === 0) {
    toast.info('No units to print. Add units to your roster first.', { timeout: 3000 });
    return;
  }

  // Emit the event to parent component to handle print formatting
  emit('format-print');
};
</script>
