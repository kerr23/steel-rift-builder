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
      traits: ['Kinetic'],
      rangeCategory: 'Unlimited',
    },
    // --- Update ALL other weapons similarly ---
    {
      id: 'w_howitzer',
      name: 'Howitzer',
      tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 }, // Example scaling
      damageRating: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 }, // Example scaling
      traits: ['Blast (3")', 'Kinetic'],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_laser',
      name: 'Laser',
      tonnage: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 7 }, // Example scaling
      damageRating: { Light: 2, Medium: 2, Heavy: 2, 'Ultra-Heavy': 2 }, // Example scaling
      traits: ['AP(1/1/2/3)', 'Draining'],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_melee_weapon',
      name: 'Melee Weapon',
      tonnage: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 }, // Example scaling
      damageRating: { Light: 0, Medium: 0, Heavy: 0, 'Ultra-Heavy': 0 }, // Example scaling
      traits: ['Melee (1/1/2/2)'],
      rangeCategory: 'N/A',
    },
    {
      id: 'w_missiles',
      name: 'Missiles',
      tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 }, // Example scaling
      damageRating: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 }, // Example scaling
      traits: ['Smart', 'Limited (3)'],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_particle_cannon',
      name: 'Particle Cannon',
      tonnage: { Light: 2, Medium: 3, Heavy: 5, 'Ultra-Heavy': 6 }, // Example scaling
      damageRating: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 }, // Example scaling
      traits: ['Draining', 'Disruptive'],
      rangeCategory: '18"',
    },
    {
      id: 'w_rail_gun',
      name: 'Rail Gun',
      tonnage: { Light: 2, Medium: 2, Heavy: 4, 'Ultra-Heavy': 5 }, // Example scaling
      damageRating: { Light: 1, Medium: 1, Heavy: 1, 'Ultra-Heavy': 1 }, // Example scaling
      traits: ['AP(1/1/2/3)', 'Kinetic'],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_rocket_pack',
      name: 'Rocket Pack',
      tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 }, // Example scaling
      damageRating: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 }, // Example scaling
      traits: ['Smart', 'Blast (3")', 'Limited (2)'],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_rotary_cannon',
      name: 'Rotary Cannon',
      tonnage: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 }, // Example scaling
      damageRating: { Light: 5, Medium: 7, Heavy: 11, 'Ultra-Heavy': 13 }, // Example scaling
      traits: ['Light'],
      rangeCategory: '12"',
    },
    {
      id: 'w_shot_cannon',
      name: 'Shot Cannon',
      tonnage: { Light: 2, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 }, // Example scaling
      damageRating: { Light: 6, Medium: 8, Heavy: 10, 'Ultra-Heavy': 12 }, // Example scaling
      traits: ['Light', 'Frag'],
      rangeCategory: '6"',
    },
    {
      id: 'w_submunitions',
      name: 'Submunitions',
      tonnage: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 }, // Example scaling
      damageRating: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 }, // Example scaling
      traits: ['Flak'],
      rangeCategory: '6"',
    },
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
      name: 'Tracked',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: -1,
      description: 'PLOW THROUGH: Pivot this HE-V up to 90° and then move up to its current move speed in a straight line while ignoring Rough terrain. This HE-Vs Facing does not change at the end of this Order.',
    },
    {
      id: 'm3',
      name: 'Multi-Limbed',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: -1,
      description: 'HUNKERD DOWN:  While this HE-V is ‘Hunkered Down’ any attacks on this Unit originating from attackers within Line of Sight must count the Hunkered Unit as being obscured by Covering Terrain. If the Hunkered Unit was already obscured by Covering Terrain, it must be treated as being obscured by Blocking Terrain',
    },
  ],
  // *** Trait Definitions ***
  traitDefinitions: {
    // == Weapon Traits ==
    'AP(1/1/2/3)': 'If any damage is inflicted by this Attack, apply AP(L/M/H/UH) damage directly to the target units Structure.',
    'Blast (3")': 'All units (friend or foe) within (x”) of the original target must also make a Defense Roll against this Attack at -1 to the Attack Pool (to a minimum of 1).',
    'Disruptive': 'If a target model suffers any damage from a weapon with this Trait, the Active Player rolls 1D6. On a 5 or 6, mark the target unit with a Redlined marker.',
    'Draining': 'If a model uses this Weapon System during an activation, mark it with a Redline marker as well as an Activated token when it has completed its Orders. This does not cause Structure damage. If a model has a Redlined token when it activates, it may not use Weapon Systems with this Trait.',
    'Flak': 'Reduce the number of dice in an attack from Mine Drones (Missiles or Rocket Packs by 2) to a minimum of 1 if this model doesn’t have a Redlined marker.',
    'Frag': 'Targets are -1 to Defense Rolls from attacks with this Trait.',
    'Kinetic': 'If any damage is inflicted by this attack, roll 1D6. Add +1 to the roll for each Class Size larger the Active model is than the target model. Subtract -1 from the roll for each Class Size smaller the Active model is than the target model. On a result of 4+, rotate the target model 45° away from the Active Unit, in a direction chosen by the Active Player.',
    'Light': 'This attack will cause 1 damage to Armor or Structure for every 2 hits that are not evaded, rounding down.',
    'Limited (2)': 'This weapon system can only be fired 2 times per battle.',
    'Limited (3)': 'This weapon system can only be fired 3 times per battle.',
    'Melee (1/1/2/2)': 'Add (1/1/2/2) to the Attack Pool of this mech when it is performing a Smash Order. This model counts as one Class Size larger during a Smash order. This weapon System is not used in an Engage Order.',
    'Smart': 'The Active Unit may use any friendly unit with a Target Designator for determining Line of Sight for attacks with this Weapon System.',

    // == Upgrade Traits ==
    'Ablative Armour': 'Gain +1 Accuracy on all ranged attack Orders.',
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
