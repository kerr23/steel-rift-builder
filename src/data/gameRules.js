// Simplified example - needs complete data population based on sources
export const HEV_CLASSES = {
  Light: { baseTonnage: 20, armourDie: 'D6', structureDie: 'D6', slots: 4 },
  Medium: { baseTonnage: 30, armourDie: 'D8', structureDie: 'D8', slots: 5 },
  Heavy: { baseTonnage: 40, armourDie: 'D10', structureDie: 'D10', slots: 6 },
  UltraHeavy: { baseTonnage: 50, armourDie: 'D12', structureDie: 'D12', slots: 7 },
}

export const WEAPON_SYSTEMS = {
  LaserCannon: {
    name: 'Laser Cannon',
    cost: { Light: 3, Medium: 4, Heavy: 5, UltraHeavy: 6 },
    traits: ['Beam'],
    damage: {
      /*...*/
    },
  },
  MissilePod: {
    name: 'Missile Pod',
    cost: { Light: 4, Medium: 5, Heavy: 6, UltraHeavy: 7 },
    traits: ['Limited (3)', 'Blast'],
    damage: {
      /*...*/
    },
  },
  // ... many more weapons
}

export const UPGRADES = {
  AdvancedTargeting: {
    name: 'Advanced Targeting',
    cost: { Light: 2, Medium: 2, Heavy: 3, UltraHeavy: 3 },
    rules: '...',
    restrictions: ['Once'],
  },
  ReinforcedPlating: {
    name: 'Reinforced Plating',
    cost: { Light: 1, Medium: 2, Heavy: 2, UltraHeavy: 3 },
    rules: '...',
    restrictions: ['Once', 'ArmourOrPlating'],
  },
  // ... many more upgrades
}

export const SUPPORT_ASSETS = {
  ArtilleryBarrage: {
    name: 'Artillery Barrage',
    baseCost: 10,
    maxCost: 20,
    type: 'OffTable',
    rules: '...',
  },
  ULHevSquadron: {
    name: 'Ultra-Light HE-V Squadron',
    baseCost: 15,
    type: 'OnTable',
    units: [
      /*...*/
    ],
    rules: '...',
  },
  // ... other assets
}

export const MISSION_SIZES = {
  Recon: { budget: 100, supportTypes: 1, teams: [{ type: 'Any', size: 2, count: 1 }], agendas: 1 },
  Strike: {
    budget: 150,
    supportTypes: 2,
    teams: [
      { type: 'Any', size: 2, count: 2 },
      { type: 'Any', size: 3, count: 2 },
    ],
    agendas: 2,
  },
  Battle: {
    budget: 200,
    supportTypes: 3,
    teams: [
      { type: 'Any', size: 2, count: 2 },
      { type: 'Any', size: 3, count: 2 },
      { type: 'Any', size: 4, count: 1 },
    ],
    agendas: 3,
  },
  // Note: Team rules are more complex (type limits, Tactical size 3 min) - needs refinement
}

// Add data for Traits, Factions, Perks, Teams, Agendas, Requisitions, Pilot Skills etc.
