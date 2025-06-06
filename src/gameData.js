// src/gameData.js

export const traitDefinitions = {
  AP: 'Armor Penetrating: If any damage is inflicted by this Attack, apply AP(X) damage directly to the target units Structure (value depends on HE-V class).',
  Plasma: 'If any damage is inflicted by this Attack, apply Plasma(X) damage to armor. If no armor remains apply normal hits to structure',
  Blast: 'Area Effect: All units (friend or foe) within (X) of the original target must also make a Defense Roll against this Attack at -1 to the Attack Pool (to a minimum of 1).',
  Disruptive: 'If a target model suffers any damage from a weapon with this Trait, the Active Player rolls 1D6. On a 5 or 6, mark the target unit with a Redlined marker.',
  Draining: 'If a model uses this Weapon System during an activation, mark it with a Redline marker as well as an Activated token when it has completed its Orders. This does not cause Structure damage. If a model has a Redlined token when it activates, it may not use Weapon Systems with this Trait.',
  Flak: 'Reduce the number of dice in an attack from Mine Drones (Missiles or Rocket Packs by 2) to a minimum of 1 if this model doesn’t have a Redlined marker.',
  Frag: 'Targets are -1 to Defense Rolls from attacks with this Trait.',
  Kinetic: 'If any damage is inflicted by this attack, roll 1D6. Add +1 to the roll for each Class Size larger the Active model is than the target model. Subtract -1 from the roll for each Class Size smaller the Active model is than the target model. On a result of 4+, rotate the target model 45° away from the Active Unit, in a direction chosen by the Active Player.',
  Light: 'This attack will cause 1 damage to Armor or Structure for every 2 hits that are not evaded, rounding down.',
  Limited: 'This weapon system has a limited number of uses per battle (represented by bubbles).',
  Long: 'Weapon has a minimum effective firing distance, can only be fired at targets (X) inches or beyond.',
  Melee: 'Add (X) to the Attack Pool of this mech when it is performing a Smash Order (value depends on HE-V class). This model counts as one Class Size larger during a Smash order. This weapon System is not used in an Engage Order.',
  Smart: 'The Active Unit may use any friendly unit with a Target Designator for determining Line of Sight for attacks with this Weapon System.',
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

export const findClassByName = (name) => gameData.classes.find(c => c.name === name) || null
export const findWeaponById = (id) => gameData.weapons.find(w => w.id === id) || null
export const findUpgradeById = (id) => gameData.upgrades.find(u => u.id === id) || null
