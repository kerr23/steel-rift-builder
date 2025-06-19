// src/gameData.js

export const traitDefinitions = {
  AP: 'Armor Penetrating: If any damage is inflicted by this Attack, apply AP(X) damage directly to the target units Structure (value depends on HE-V class).',
  Plasma: 'If any damage is inflicted by this Attack, apply Plasma(X) damage to armor. If no armor remains apply normal hits to structure',
  Blast: 'Area Effect: All units (friend or foe) within (X) of the original target must also make a Defense Roll against this Attack at -1 to the Attack Pool (to a minimum of 1).',
  Disruptive: 'If a target model suffers any damage from a weapon with this Trait, the Active Player rolls 1D6. On a 5 or 6, mark the target unit with a Redlined marker.',
  Draining: 'If a model uses this Weapon System during an activation, mark it with a Redline marker as well as an Activated token when it has completed its Orders. This does not cause Structure damage. If a model has a Redlined token when it activates, it may not use Weapon Systems with this Trait.',
  Flak: 'Reduce the number of dice in an attack from Mine Drones, Missiles, or Rocket Packs by 2 to a minimum of 1 if this model doesn\'t have a Redlined marker.',
  Frag: 'Targets are -1 to Defense Rolls from attacks with this Trait.',
  Kinetic: 'If any damage is inflicted by this attack, roll 1D6. Add +1 to the roll for each Class Size larger the Active model is than the target model. Subtract -1 from the roll for each Class Size smaller the Active model is than the target model. On a result of 4+, rotate the target model 45° away from the Active Unit, in a direction chosen by the Active Player.',
  Light: 'This attack will cause 1 damage to Armor or Structure for every 2 hits that are not evaded, rounding down.',
  Limited: 'This weapon system has a limited number of uses per battle (represented by bubbles).',
  Long: 'Weapon has a minimum effective firing distance, can only be fired at targets (X) inches or beyond.',
  Melee: 'Add (X) to the Attack Pool of this mech when it is performing a Smash Order (value depends on HE-V class). This model counts as one Class Size larger during a Smash order. This weapon System is not used in an Engage Order.',
  Smart: 'The Active Unit may use any friendly unit with a Target Designator for determining Line of Sight for attacks with this Weapon System.',
  // UL-HEV and support asset component traits
  'All-Terrain': 'Units with this trait ignore rough terrain.',
  'Close Support': 'If an HE-V of class light or larger performs an Engage or Smash order and there are friendly units with this trait within 6" of the target unit, add +1 to the damage rating of the order. (This bonus is only applied once regardless of how many friendly units are nearby.)',
  'Command': 'Units with the Command Trait issue orders to their Garrison. Once per activation, instead of performing an order itself, it can issue orders to up to (X) units within its garrison.',
  'Fortification': 'A unit with this trait will only ever perform the following orders (if eligible): Engage, Lock On, Return Fire. Units with this trait only ever pass defense rolls on a 6+. Counts as Light for purpose of Kinetics. Always targeted as if from the Front Arc.',
  'Garrison': 'A Unit with this trait contains a number of its assigned units and tokens up to (X). If this unit is destroyed, all the units and tokens assigned to it are destroyed.',
  'Infantry': 'Units with this trait do not receive orders normally and are not eligible to activate. They will instead activate as part of the order issued to their Garrison using the Command trait.',
  'Inferno Gear': 'If 50% or more of the Units in a Squadron have this trait, the Squadron ignores the effect of the Disruptive Trait.',
  'Magnetic Grapnels': 'When an enemy Unit attempts to move or jump out of contact with one or more Units with this Trait, before moving, that model rolls 1D6, adding +1 for each additional model with this Trait in contact after the first. On a 1-2 result, reduce the Speed distance that the Unit may move by 50%. On a 3-4 result, reduce the distance by 75%. On a 5-6 result, the Active Unit may only move 1" regardless of how far it would normally be allowed to go during that Order.',
  'Minefield': 'Once deployed, these Tokens operate in exactly the same way as those described in the Mine-Drone Barrage Support Asset from the Steel Rift Core Rulebook. The one exception is that the Fortification they are garrisoned-to is never affected by their Blast Trait.',
  'Minesweeper': 'Using sophisticated drone systems to detect and destroy enemy Mines, a Unit with this Trait may perform the following Order: CLEAR MINEFIELD: Target a Mine Token of any type within 8" and Line of Sight of any active Units with the Minesweeper Trait. Roll 1D6, adding +1 for each additional Unit with the Minesweeper Trait if they are in a Squadron. On a roll of 4+, the Mine Token is neutralized and removed from play.',
  'Outrider': 'If these Units are part of a mixed Squadron and the Squadron Leader is a different type of Unit from the Unit with this Trait, the range they must be deployed at and remain inside is 12" instead of 3". However, all Units with this Trait in a formation must still be within 3" of each other. All Outrider units in a formation also must perform the same Orders, and remain inside that maximum distance.',
  'Squadron': 'Squadrons move and attack as one. LoS applies to each figure. X refers to number of units that have LoS on that target. See rules for details around Smash orders and Blast damage.',
  'Scramblers': 'No Unit, regardless of its Commander, within 6" of a model equipped with a Scrambler may be targeted by an Off-Table Support Asset or Target Designator. In addition they can not be the target of Lock On orders, or weapons using the SMART Trait.',
  'Suppressive Fire': 'If an Active enemy Unit within 10" of a Unit with this Trait performs an Engage Order, the target of that Order receives +1 to their Defense Rolls.',
  'Ultra-Light': 'Units with this Trait receive a +2 on Defense Rolls versus Engage Orders, unless they have the Blast Trait, against which it only receives a +1. Regardless of modifiers, Units with this Trait targeted by a Weapon System with the Light Trait cancel the effects of that trait and will make a Defence Roll for each net success. Units with this Trait are always targeted as if from the Front Arc.',
  'Vehicle': 'Units with this Trait may never perform the Smash Order. Units with this Trait receive -1 to Defense Rolls of any type (This supercedes the bonus from ultra-light). Units with this Trait are always targeted as if from the Front Arc',
}

export const gameData = {
  classes: [
    {
      name: 'Light', baseTonnage: 20, baseSlots: 4, baseArmor: 6, baseStructure: 4, baseMovement: 12, defenseRoll: '3+',
      special: "Roll 1D6 for each point of Structure Damage it has lost during this Attack. On a 5+, the Target takes an additional point of Damage"
    },
    {
      name: 'Medium', baseTonnage: 30, baseSlots: 5, baseArmor: 8, baseStructure: 6, baseMovement: 10, defenseRoll: '4+',
    },
    {
      name: 'Heavy', baseTonnage: 40, baseSlots: 6, baseArmor: 10, baseStructure: 8, baseMovement: 8, defenseRoll: '5+',
    },
    {
      name: 'Ultra-Heavy', baseTonnage: 50, baseSlots: 7, baseArmor: 12, baseStructure: 10, baseMovement: 6, defenseRoll: '6+',
      special: "Rolls 1D6 for each point of Structure Damage it has lost during this Attack. On a 5+, the Damage is ignored"
    },
  ],
  weapons: [
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
      tonnage: { Light: 3, Medium: 4, Heavy: 5, 'Ultra-Heavy': 6 },
      damageRating: { Light: 2, Medium: 3, Heavy: 4, 'Ultra-Heavy': 5 },
      traits: [{ name: 'Blast', value: '3"' }],
      rangeCategory: 'Unlimited',
    },
    {
      id: 'w_laser',
      name: 'Laser',
      tonnage: { Light: 3, Medium: 3, Heavy: 5, 'Ultra-Heavy': 6 },
      damageRating: { Light: 2, Medium: 2, Heavy: 2, 'Ultra-Heavy': 3 },
      traits: [{ name: 'AP', value: { Light: 2, Medium: 2, Heavy: 2, 'Ultra-Heavy': 3 } }],
      rangeCategory: '18+"',
    },
    {
      id: 'w_melee_weapon',
      name: 'Melee Weapon',
      tonnage: { Light: 1, Medium: 2, Heavy: 3, 'Ultra-Heavy': 4 },
      damageRating: { Light: 0, Medium: 0, Heavy: 0, 'Ultra-Heavy': 0 }, // Damage is from trait
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
      traits: [{ name: 'Plasma', value: 2 }],
      rangeCategory: '18"',
    },
    {
      id: 'w_rail_gun',
      name: 'Rail Gun',
      tonnage: { Light: 1, Medium: 1, Heavy: 3, 'Ultra-Heavy': 4 },
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
  upgrades: [
    {
      id: 'u1',
      name: 'Ablative Armour ',
      tonnage: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 },
      description:
        'Reduce the Attack Pool for attacks using the Blast trait by 1, to a minimum of 1.',
      type: 'armor',
    },
    {
      id: 'u3',
      name: 'Anti Missile System',
      tonnage: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 },
      description:
        'This unit may not be targeted by a Weapon System using the Smart trait to Engage them from outside of Line of Sight of the Active Model.',
    },
    {
      id: 'u4',
      name: 'Electronic Countermeasures',
      tonnage: { Light: 2, Medium: 2, Heavy: 1, 'Ultra-Heavy': 1 },
      description: 'The Lock On order may not be taken against this model.',
    },
    {
      id: 'u5',
      name: 'Heavy Reactor',
      tonnage: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 },
      description:
        'Roll 1D6 when this model would take Structure damage from Redlining, on a 4+ this damage is ignored.',
    },
    {
      id: 'u6',
      name: 'Jump Jets',
      tonnage: { Light: 3, Medium: 3, Heavy: 2, 'Ultra-Heavy': 2 },
      description: 'This model may take the Jump Jet action.',
    },
    {
      id: 'u7',
      name: 'Minefield Drone Carrier System',
      tonnage: { Medium: 3, Heavy: 6, 'Ultra-Heavy': 6 },
      description:
        'ORDER: Place a Mine Drone token (as per the Support Asset ) within 3” of the Active model and not within 6” of another Mine Drone token. This Upgrade has the Limited (*/1/2/2) trait.',
      allowedClasses: ['Medium', 'Heavy', 'Ultra-Heavy'],
    },
    {
      id: 'u8',
      name: 'Mine Drone Tracking Submunitions',
      tonnage: { Light: 1, Medium: 1, Heavy: 2, 'Ultra-Heavy': 2 },
      traits: [],
      description:
        'ORDER: This model makes an immediate Engage order against a Mine Field token in range. The Commander of the target Minefield makes a Defense Roll on a 3+. If at least one point of Damage would be inflicted, remove the Token. (Model with Submunitions Only).',
    },
    {
      id: 'u9',
      name: 'Optic Camouflage',
      tonnage: { Light: 5, Medium: 4, Heavy: 3, 'Ultra-Heavy': 2 },
      description: 'Add +1 to Defense Rolls for this unit when the attacker is outside of 18”.',
    },
    {
      id: 'u10',
      name: 'Reactive Armour',
      tonnage: { Light: 1, Medium: 1, Heavy: 1, 'Ultra-Heavy': 1 },
      description:
        'Reduce the Attack Pool for Missile and Rocket Pack attacks by 1, to a minimum of 1.',
      type: 'armor',
    },
    {
      id: 'u11',
      name: 'Ceramic Plating',
      tonnage: { Light: 2, Medium: 2, Heavy: 1, 'Ultra-Heavy': 1 },
      description:
        'Each time this unit would take damage from the AP trait of a Laser Weapon System roll 1D6 - on a 5+ that damage is negated.',
      type: 'armor',
    },
    {
      id: 'u12',
      name: 'Target Designator',
      tonnage: { Light: 1, Medium: 1, Heavy: 1, 'Ultra-Heavy': 1 },
      description:
        'Once per turn, friendly models in the same force may use this vehicle to draw Line of Sight for Weapon Systems using the Smart trait. Use this model for determining the AttackPool and Line of Sight. Its use can be canceled by Electronic Counter measures.',
    },
  ],
  motiveTypes: [
    {
      id: 'm1',
      name: 'Biped',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      tonnageModifier: 0,
      slotModifier: 0,
      description: null,
    },
    {
      id: 'm2',
      name: 'Tracked',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      tonnageModifier: 0,
      slotModifier: -1,
      description:
        'Plow Through: Pivot this HE-V up to 90° and then move up to its current move speed in a straight line while ignoring Rough terrain. This HE-Vs Facing does not change at the end of this Order.',
    },
    {
      id: 'm3',
      name: 'Multi-Limbed',
      classApplicability: ['Light', 'Medium', 'Heavy', 'Ultra-Heavy'],
      tonnageModifier: 0,
      slotModifier: -1,
      description:
        "Hunker Down: Any attacks on the unit while the HE-V is 'Hunkered Down' count as being obscured by Covering Terrain. If the Hunkered Unit was already obscured by Covering Terrain it should be treated as being obscured by Blocking Terrain",
    },
  ],
  traitDefinitions,
}

// Ultra-Light HE-V weapon system definitions for print and trait key rendering
export const UL_HEV_WEAPONS = [
  {
    id: 'ul-autocannon',
    name: 'UL Autocannon',
    damage: '2 x (X)',
    range: '10"',
    traits: ['Kinetic']
  },
  {
    id: 'ul-grenades',
    name: 'UL Grenades',
    damage: '3 x (X)',
    range: '6',
    traits: ['Blast(2")', 'Light', 'Limited(1)']
  },
  {
    id: 'ul-incinerators',
    name: 'UL Incinerators',
    damage: '4 x (X)',
    range: '4',
    traits: ['Disruptive', 'Light']
  },
  {
    id: 'ul-melee',
    name: 'UL Melee Weapons',
    damage: 'N/A',
    range: 'N/A',
    traits: ['Melee (X)', 'AP1 x (X)']
  },
  {
    id: 'submunitions',
    name: 'Submunitions',
    damage: '1 x (X)',
    range: '6"',
    traits: ['Flak']
  }
]

// Ultra-Light HE-V types
export const UL_HEV_TYPES = [
  {
    id: 'ul_brawler',
    type: 'Brawler',
    speed: '7"',
    armor: 3,
    weapons: ['UL Melee Weapons', 'Submunitions'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Close Support',
      'All-Terrain',
      'Magnetic Grapnels'
    ]
  },
  {
    id: 'ul_pyro',
    type: 'Pyro',
    speed: '6"',
    armor: 3,
    weapons: ['UL Incinerators', 'Submunitions'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Close Support',
      'All-Terrain',
      'Inferno Gear'
    ]
  },
  {
    id: 'ul_commando',
    type: 'Commando',
    speed: '7"',
    armor: 3,
    weapons: ['Submunitions'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Close Support',
      'All-Terrain',
      'Scramblers',
      'Target Designator'
    ]
  },
  {
    id: 'ul_rifleman',
    type: 'Rifleman',
    speed: '6"',
    armor: 3,
    weapons: ['UL Autocannon', 'UL Grenades'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Close Support',
      'All-Terrain',
      'Suppressive Fire'
    ]
  }
]

// Ultra-Light HE-V Upgrade Pods
export const UL_HEV_UPGRADE_PODS = [
  {
    id: 'ul-upg-srm',
    name: 'Short Range Missile Pack',
    damage: '3 x (X)',
    range: '12"',
    traits: ['Smart', 'Limited(2)']
  },
  {
    id: 'ul-upg-rocket',
    name: 'Rocket Pack',
    damage: '2 x (X)',
    range: 'N/A',
    traits: ['Smart', 'Limited(2)', 'Blast(3")']
  },
  {
    id: 'ul-upg-launch',
    name: 'Launch Gear',
    damage: 'N/A',
    range: 'N/A',
    traits: [],
    description: 'Squad can Jump: +2 to their movement for jumps'
  }
]

// Off Table Support Asset Types
export const OFF_TABLE_TYPES = [
  {
    id: 'artillery-barrage',
    name: 'Artillery Barrage',
    damage: '4',
    range: 'N/A',
    traits: ['Blast(6)', 'Limited(3)'],
    targetRestriction: 'Must be within LoS of a unit with Target Designator'
  },
  {
    id: 'mass-driver',
    name: 'Mass Driver',
    damage: '6',
    range: 'N/A',
    traits: ['Kinetic', 'Limited(3)'],
    targetRestriction: 'Must be within LoS of a unit with Target Designator',
    note: 'Treat this as Ultra-Heavy for Kinetic effects.'
  },
  {
    id: 'mine-drone-barrage',
    name: 'Mine-Drone Barrage',
    damage: '4',
    range: 'N/A',
    traits: ['AP(1)','Blast(6)','Limited(3)' ],
    targetRestriction: 'Unit must be within 4" of the mine token (No LoS)',
    note: 'Before Setting up foces place your 3 mine drones not within 12" of enemy line, not within 6" of another mine token.'
  },
  {
    id: 'orbital-laser',
    name: 'Orbital Laser',
    damage: '3',
    range: 'N/A',
    traits: ['Limited(3)', 'AP(3)'],
    targetRestriction: 'Must be within LoS of a unit with Target Designator'
  }
]

// Cache for lookup functions
const classByNameCache = new Map();
const weaponByIdCache = new Map();
const upgradeByIdCache = new Map();

/**
 * Find a class by name (memoized)
 * @param {string} name - Class name to find
 * @returns {Object|null} - Class object or null if not found
 */
export const findClassByName = (name) => {
  if (!name) return null;

  // Check cache first
  if (classByNameCache.has(name)) {
    return classByNameCache.get(name);
  }

  // Not in cache, perform lookup
  const result = gameData.classes.find(c => c.name === name) || null;

  // Cache result
  classByNameCache.set(name, result);

  return result;
};

/**
 * Find a weapon by ID (memoized)
 * @param {string} id - Weapon ID to find
 * @returns {Object|null} - Weapon object or null if not found
 */
export const findWeaponById = (id) => {
  if (!id) return null;

  // Check cache first
  if (weaponByIdCache.has(id)) {
    return weaponByIdCache.get(id);
  }

  // Not in cache, perform lookup
  const result = gameData.weapons.find(w => w.id === id) || null;

  // Cache result
  weaponByIdCache.set(id, result);

  return result;
};

/**
 * Find an upgrade by ID (memoized)
 * @param {string} id - Upgrade ID to find
 * @returns {Object|null} - Upgrade object or null if not found
 */
export const findUpgradeById = (id) => {
  if (!id) return null;

  // Check cache first
  if (upgradeByIdCache.has(id)) {
    return upgradeByIdCache.get(id);
  }

  // Not in cache, perform lookup
  const result = gameData.upgrades.find(u => u.id === id) || null;

  // Cache result
  upgradeByIdCache.set(id, result);

  return result;
};

// Ultra-Light Vehicle weapon system definitions
export const ULV_WEAPONS = [
  {
    id: 'ulv-autocannon',
    name: 'Vehicle Autocannon',
    damage: '2 x (X)',
    range: '12"',
    traits: ['Kinetic']
  },
  {
    id: 'ulv-missile',
    name: 'Short Ranged Missile Pack',
    damage: '3 x (X)',
    range: '12"',
    traits: ['Smart', 'Limited(2)']
  },
  {
    id: 'ulv-rocket',
    name: 'Rocket Pack',
    damage: '2 x (X)',
    range: 'UL',
    traits: ['Smart', 'Blast(3")', 'Limited(2)']
  },
  {
    id: 'ulv-submunitions',
    name: 'Submunitions',
    damage: '1 x (X)',
    range: '6"',
    traits: ['Flak']
  }
]

// Ultra-Light Vehicle types
export const ULV_TYPES = [
  {
    id: 'ulv-recon',
    type: 'Recon',
    speed: '12"',
    armor: 1,
    weapons: ['Submunitions'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Vehicle',
      'Close Support',
      'Outrider',
      'Target Designator'
    ]
  },
  {
    id: 'ulv-fire-support',
    type: 'Fire Support',
    speed: '8"',
    armor: 2,
    weapons: ['Vehicle Autocannon', 'Rocket Pack / Missile Pack'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Vehicle',
      'Close Support'
    ]
  },
  {
    id: 'ulv-tactical',
    type: 'Tactical',
    speed: '10"',
    armor: 2,
    weapons: ['Vehicle Autocannon'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Vehicle',
      'Close Support',
      'Suppressive Fire'
    ]
  },
  {
    id: 'ulv-engineering',
    type: 'Engineering',
    speed: '8"',
    armor: 3,
    weapons: ['Submunitions'],
    traits: [
      'Ultra-Light',
      'Squadron',
      'Vehicle',
      'Close Support',
      'Minesweeper'
    ]
  }
]

// Infantry Outpost data structures
export const INFANTRY_OUTPOST_WEAPONS = [
  {
    id: 'io-auto-cannon',
    name: 'Auto-Cannon Emplacement',
    damage: '2',
    range: '12"',
    traits: ['Kinetic']
  },
  {
    id: 'io-missile-Pack',
    name: 'Missile Pack',
    damage: '3',
    range: 'Unlimited',
    traits: ['Smart', 'Limited(2)']
  },
  {
    id: 'io-rocket-Pack',
    name: 'Rocket Pack',
    damage: '2',
    range: 'Unlimited',
    traits: ['Smart', 'Blast(3")', 'Limited(2)']
  },
]

export const INFANTRY_WEAPONS = [
  {
    id: 'infantry-rifles',
    name: 'Infantry Rifles',
    damage: '2 x (X)',
    range: '6"',
    traits: ['Light']
  },
  {
    id: 'missile-pack',
    name: 'Missile Pack',
    damage: '3 x (X)',
    range: '12"',
    traits: ['Smart', 'Limited(2)']
  }
]

export const INFANTRY_TYPES = [
  {
    id: 'engineers',
    name: 'Engineers',
    speed: '3"',
    traits: ['Minesweeper'],
    weaponIds: ['infantry-rifles'],
    structure: 3
  },
  {
    id: 'rifle-squad',
    name: 'Rifle Squad',
    speed: '3"',
    traits: ['Suppressive Fire'],
    weaponIds: ['infantry-rifles'],
    structure: 3
  },
  {
    id: 'recon-squad',
    name: 'Recon Squad',
    speed: '3"',
    traits: ['Target Designator'],
    weaponIds: ['infantry-rifles'],
    structure: 3
  },
  {
    id: 'anti-tank-squad',
    name: 'Anti-Tank Squad',
    speed: '3"',
    traits: [],
    weaponIds: ['infantry-rifles', 'missile-pack'],
    structure: 3
  },
  {
    id: 'mine-drone',
    name: 'Mine Drone',
    speed: 'N/A',
    traits: ['Minefield'],
    specialRules: 'Deploy as per Mine-Drone Barrage Support Asset rules. Each drone can be deployed up to 12" away from the outpost, not within 6" of another mine token.'
  }
]
