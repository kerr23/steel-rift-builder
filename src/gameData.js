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
  ],
  weapons: [
    // Weapon traits are now objects { name: 'TraitName', value?: X | { L:Y, M:Z ... } }
    {
      id: 'w_autocannon',
      name: 'Auto-Cannon',
      tonnage: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      damageRating: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      traits: [{ name: 'Kinetic' }],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_howitzer',
      name: 'Howitzer',
      tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
      damageRating: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 },
      traits: [{ name: 'Blast', value: '3"' }, { name: 'Kinetic' }],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_laser',
      name: 'Laser',
      tonnage: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 7 },
      damageRating: { Light: 2, Medium: 2, Heavy: 2, 'Ultra-Heavy': 2 },
      traits: [
        { name: 'AP', value: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 3 } },
        { name: 'Draining' },
      ],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_melee_weapon',
      name: 'Melee Weapon',
      tonnage: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 },
      damageRating: { Light: 0, Medium: 0, Heavy: 0, 'Ultra-Heavy': 0 },
      traits: [{ name: 'Melee', value: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 } }],
      rangeCategory: 'N/A',
    },
    {
      id: 'w_missiles',
      name: 'Missiles',
      tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
      damageRating: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 },
      traits: [{ name: 'Smart' }, { name: 'Limited', value: 3 }],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_particle_cannon',
      name: 'Particle Cannon',
      tonnage: { Light: 2, Medium: 3, Heavy: 5, 'Ultra-Heavy': 6 },
      damageRating: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 },
      traits: [{ name: 'Draining' }, { name: 'Disruptive' }],
      rangeCategory: '18"',
    },
    {
      id: 'w_rail_gun',
      name: 'Rail Gun',
      tonnage: { Light: 2, Medium: 2, Heavy: 4, 'Ultra-Heavy': 5 },
      damageRating: { Light: 1, Medium: 1, Heavy: 1, 'Ultra-Heavy': 1 },
      traits: [
        { name: 'AP', value: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 3 } },
        { name: 'Kinetic' },
      ],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_rocket_pack',
      name: 'Rocket Pack',
      tonnage: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
      damageRating: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 },
      traits: [{ name: 'Smart' }, { name: 'Blast', value: '3"' }, { name: 'Limited', value: 2 }],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_rotary_cannon',
      name: 'Rotary Cannon',
      tonnage: { Light: 2, Medium: 4, Heavy: 6, 'Ultra-Heavy': 8 },
      damageRating: { Light: 5, Medium: 7, Heavy: 11, 'Ultra-Heavy': 13 },
      traits: [{ name: 'Light' }],
      rangeCategory: '12"',
    },
    {
      id: 'w_shot_cannon',
      name: 'Shot Cannon',
      tonnage: { Light: 2, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      damageRating: { Light: 6, Medium: 8, Heavy: 10, 'Ultra-Heavy': 12 },
      traits: [{ name: 'Light' }, { name: 'Frag' }],
      rangeCategory: '6"',
    },
    {
      id: 'w_submunitions',
      name: 'Submunitions',
      tonnage: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 },
      damageRating: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 },
      traits: [{ name: 'Flak' }],
      rangeCategory: '6"',
    },
  ],
  // === UPDATED Upgrades (Traits Removed) ===
  upgrades: [
    {
      id: 'u1',
      name: 'Advanced Optics',
      tonnage: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 },
      // traits: REMOVED
      description: 'Provides +1 Accuracy to all ranged attacks.',
      // allowedClasses: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'] // Example: Allowed for all (or omit this line)
    },
    {
      id: 'u3',
      name: 'Jump Jets',
      tonnage: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      // traits: REMOVED
    },
    {
      id: 'u4',
      name: 'ECM Suite',
      tonnage: { Light: 2, Medium: 2, Heavy: 3, 'Ultra-Heavy': 3 },
      // traits: REMOVED
    },
    // REMOVE traits property from ALL upgrades
  ],
  // === END UPDATED Upgrades ===
  motiveTypes: [
    {
      id: 'm1',
      name: 'Standard Biped',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: 0,
      description: null,
    },
    {
      id: 'm2',
      name: 'Tracked',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: -1,
      description:
        'PLOW THROUGH: Pivot this HE-V up to 90° and then move up to its current move speed in a straight line while ignoring Rough terrain. This HE-Vs Facing does not change at the end of this Order.',
    },
    {
      id: 'm3',
      name: 'Multi-Limbed',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      slotModifier: -1,
      description:
        'HUNKERD DOWN:  While this HE-V is ‘Hunkered Down’ any attacks on this Unit originating from attackers within Line of Sight must count the Hunkered Unit as being obscured by Covering Terrain. If the Hunkered Unit was already obscured by Covering Terrain, it must be treated as being obscured by Blocking Terrain',
    },
  ],
  // === UPDATED Trait Definitions (Removed upgrade-only traits) ===
  traitDefinitions: {
    // == Weapon Traits ==
    AP: 'Armor Penetrating: If any damage is inflicted by this Attack, apply AP(X) damage directly to the target units Structure (value depends on HE-V class).',
    Blast:
      'Area Effect: All units (friend or foe) within (X) of the original target must also make a Defense Roll against this Attack at -1 to the Attack Pool (to a minimum of 1).',
    Disruptive:
      'If a target model suffers any damage from a weapon with this Trait, the Active Player rolls 1D6. On a 5 or 6, mark the target unit with a Redlined marker.',
    Draining:
      'If a model uses this Weapon System during an activation, mark it with a Redline marker as well as an Activated token when it has completed its Orders. This does not cause Structure damage. If a model has a Redlined token when it activates, it may not use Weapon Systems with this Trait.',
    Flak: 'Reduce the number of dice in an attack from Mine Drones (Missiles or Rocket Packs by 2) to a minimum of 1 if this model doesn’t have a Redlined marker.',
    Frag: 'Targets are -1 to Defense Rolls from attacks with this Trait.',
    Kinetic:
      'If any damage is inflicted by this attack, roll 1D6. Add +1 to the roll for each Class Size larger the Active model is than the target model. Subtract -1 from the roll for each Class Size smaller the Active model is than the target model. On a result of 4+, rotate the target model 45° away from the Active Unit, in a direction chosen by the Active Player.',
    Light:
      'This attack will cause 1 damage to Armor or Structure for every 2 hits that are not evaded, rounding down.',
    Limited: 'This weapon system can only be fired (X) times per battle.',
    Melee:
      'Add (X) to the Attack Pool of this mech when it is performing a Smash Order (value depends on HE-V class). This model counts as one Class Size larger during a Smash order. This weapon System is not used in an Engage Order.',
    Smart:
      'The Active Unit may use any friendly unit with a Target Designator for determining Line of Sight for attacks with this Weapon System.',
    // Remove any definitions that were ONLY used by upgrades here
  },
  // === END Trait Definitions ===
}

// Helper function to find the maximum die step available
export const getMaxDieStep = () => {
  if (!gameData.dice || gameData.dice.length === 0) {
    console.error('gameData.dice is missing or empty!')
    return -1
  }
  return Math.max(...gameData.dice.map((d) => d.step))
}
