// src/gameData.js

export const gameData = {
  classes: [
    {
      name: 'Light',
      baseTonnage: 30,
      baseSlots: 6,
      defaultArmorDie: 'd6',
      defaultStructureDie: 'd6',
    },
    {
      name: 'Medium',
      baseTonnage: 50,
      baseSlots: 8,
      defaultArmorDie: 'd8',
      defaultStructureDie: 'd8',
    },
    {
      name: 'Heavy',
      baseTonnage: 70,
      baseSlots: 10,
      defaultArmorDie: 'd10',
      defaultStructureDie: 'd10',
    },
    {
      name: 'Ultra-Heavy',
      baseTonnage: 90,
      baseSlots: 12,
      defaultArmorDie: 'd12',
      defaultStructureDie: 'd12',
    },
  ],
  dice: [
    // Added 'sides' property
    { step: 0, die: 'd4', sides: 4, armorCost: 1, structureCost: 1 },
    { step: 1, die: 'd6', sides: 6, armorCost: 2, structureCost: 2 },
    { step: 2, die: 'd8', sides: 8, armorCost: 4, structureCost: 4 },
    { step: 3, die: 'd10', sides: 10, armorCost: 6, structureCost: 6 },
    { step: 4, die: 'd12', sides: 12, armorCost: 8, structureCost: 8 },
    // { step: 5, die: 'd14', sides: 14, armorCost: 10, structureCost: 10 }, // Example if needed
  ],
  weapons: [
    // ... weapon data ...
    { id: 'w1', name: 'Light Cannon', tonnage: 3, slots: 1, traits: ['AP 1'] },
    { id: 'w2', name: 'Heavy Machine Gun', tonnage: 2, slots: 1, traits: ['AI', 'Suppressive'] },
    { id: 'w3', name: 'Missile Pod', tonnage: 5, slots: 2, traits: ['Indirect', 'Limited 3'] },
  ],
  upgrades: [
    // ... upgrade data ...
    { id: 'u1', name: 'Advanced Optics', tonnage: 1, slots: 1, traits: ['+1 Accuracy Ranged'] },
    { id: 'u3', name: 'Jump Jets', tonnage: 4, slots: 1, traits: ['Jump Movement'] },
    // Note: Removed 'Reinforced Armor' upgrade as we handle it via checkbox now.
    // If other upgrades modify dice, they'll need specific logic later.
  ],
  motiveTypes: [
    // ... motive type data ...
    {
      id: 'm1',
      name: 'Standard Biped',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      tonnageModifier: 0,
      slotModifier: 0,
    },
    {
      id: 'm2',
      name: 'Standard Tracked',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      tonnageModifier: 0,
      slotModifier: 0,
    },
  ],
}

// Helper function to find the maximum die step available
export const getMaxDieStep = () => {
  if (!gameData.dice || gameData.dice.length === 0) {
    console.error('gameData.dice is missing or empty!')
    return -1
  }
  return Math.max(...gameData.dice.map((d) => d.step))
}
