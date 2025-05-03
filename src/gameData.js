// src/gameData.js

export const gameData = {
  classes: [
    // Keep class names consistent (used as keys)
    {
      name: 'Light',
      baseTonnage: 30,
      baseSlots: 6,
      defaultArmorDie: 'd6',
      defaultStructureDie: 'd6',
      baseMovement: 12,
    },
    {
      name: 'Medium',
      baseTonnage: 50,
      baseSlots: 8,
      defaultArmorDie: 'd8',
      defaultStructureDie: 'd8',
      baseMovement: 10,
    },
    {
      name: 'Heavy',
      baseTonnage: 70,
      baseSlots: 10,
      defaultArmorDie: 'd10',
      defaultStructureDie: 'd10',
      baseMovement: 8,
    },
    {
      name: 'Ultra-Heavy',
      baseTonnage: 90,
      baseSlots: 12,
      defaultArmorDie: 'd12',
      defaultStructureDie: 'd12',
      baseMovement: 6,
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
    // --- Example: Auto-Cannon with class-based stats ---
    {
      id: 'w_autocannon', // Use a more descriptive ID
      name: 'Auto-Cannon',
      // Tonnage is now an object keyed by class name
      tonnage: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      // Damage Rating is also an object keyed by class name
      damageRating: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      traits: ['AP 1'],
      rangeCategory: 'Medium',
    },
    // --- Update ALL other weapons similarly ---
    {
      id: 'w_hmg',
      name: 'Heavy Machine Gun',
      tonnage: { Light: 2, Medium: 2, Heavy: 2, 'Ultra-Heavy': 3 }, // Example scaling
      damageRating: { Light: 2, Medium: 2, Heavy: 2, 'Ultra-Heavy': 3 }, // Example scaling
      traits: ['AI', 'Suppressive'],
      rangeCategory: 'Short',
    },
    {
      id: 'w_missile_pod',
      name: 'Missile Pod',
      tonnage: { Light: 5, Medium: 5, Heavy: 6, 'Ultra-Heavy': 6 }, // Example scaling
      damageRating: { Light: 4, Medium: 4, Heavy: 5, 'Ultra-Heavy': 5 }, // Example scaling
      traits: ['Indirect', 'Limited 3'],
      rangeCategory: 'Long',
    },
    {
      id: 'w_laser_lance',
      name: 'Laser Lance',
      tonnage: { Light: 4, Medium: 4, Heavy: 5, 'Ultra-Heavy': 5 }, // Example scaling
      damageRating: { Light: 4, Medium: 4, Heavy: 5, 'Ultra-Heavy': 5 }, // Example scaling
      traits: ['Melee', 'Accurate'],
      rangeCategory: 'Melee',
    },
    // ... Add ALL your weapons with the new structure ...
  ],
  upgrades: [
    // --- Ensure you have your COMPLETE list of upgrades here ---
    { id: 'u1', name: 'Advanced Optics', tonnage: 1, traits: ['+1 Accuracy Ranged'] },
    { id: 'u3', name: 'Jump Jets', tonnage: 4, traits: ['Jump Movement'] }, // Ensure this ID ('u3') is correct
    { id: 'u4', name: 'ECM Suite', tonnage: 2, traits: ['Enemy -1 Accuracy Targeting'] },
    // Add all other upgrades...
  ],
  // === UPDATED motiveTypes (tonnageModifier removed) ===
  motiveTypes: [
    {
      id: 'm1',
      name: 'Standard Biped',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: 0,
      description: null, // Or 'Standard walking movement.'
    },
    {
      id: 'm2',
      name: 'Standard Tracked',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: 0,
      description: 'Ignores movement penalties for Difficult Terrain.',
    },
    {
      id: 'm3',
      name: 'Standard Wheeled',
      classApplicability: ['Light', 'Medium', 'Heavy'],
      slotModifier: 0,
      description: '+2" Movement on roads, -2" Movement in Difficult Terrain.',
    },
    {
      id: 'bh1',
      name: 'Agile Walker (BH)',
      classApplicability: ['Light', 'Medium'],
      slotModifier: 0,
      description: '+1 bonus to Dodge attempts.', // Example benefit
    },
    {
      id: 'bh2',
      name: 'Heavy Treads (BH)',
      classApplicability: ['Heavy', 'Ultra-Heavy'],
      slotModifier: -1,
      description:
        'Ignores movement penalties for Difficult Terrain. Cannot benefit from Road movement bonus.', // Example benefit
    },
    {
      id: 'bh3',
      name: 'Grav Skimmer (BH)',
      classApplicability: ['Light', 'Medium', 'Heavy'],
      slotModifier: -1,
      description: 'Hovers. Ignores all terrain penalties & effects. Can move over water/chasms.', // Example benefit
    },
    // REMOVE tonnageModifier from all other motive types...
  ],
  // *** Trait Definitions ***
  traitDefinitions: {
    // == Weapon Traits ==
    'AP 1': "Armor Penetrating 1: Reduce the target's Armor value by 1 before rolling damage.",
    AI: 'Anti-Infantry: Gains bonuses or special effects when targeting infantry units.',
    Suppressive: 'Can make Suppressive Fire attacks, potentially pinning enemy infantry.',
    Indirect: 'Can target units outside of line of sight, often with penalties.',
    'Limited 3': 'This weapon system can only be fired 3 times per battle.',
    Melee: 'This weapon can only be used during melee combat actions.',
    Accurate:
      'Improves the chance to hit with this weapon (e.g., reroll misses, bonus to hit roll).',
    // Add ALL other weapon traits...

    // == Upgrade Traits ==
    '+1 Accuracy Ranged': 'Gain +1 Accuracy on all ranged attack Orders.',
    'Jump Movement': 'Unit gains the Jump movement type in addition to its standard motive type.',
    'Enemy -1 Accuracy Targeting': 'Enemies targeting this unit suffer -1 Accuracy.',
    // Add definitions for ALL other upgrade traits used in gameData.upgrades...

    // ... Add any other traits from weapons or upgrades ...
  },
  // *** END Trait Definitions ***
}

// Helper function to find the maximum die step available
export const getMaxDieStep = () => {
  if (!gameData.dice || gameData.dice.length === 0) {
    console.error('gameData.dice is missing or empty!')
    return -1
  }
  return Math.max(...gameData.dice.map((d) => d.step))
}
