# upgradeUtils usage

This small utility module centralizes common checks for upgrades and makes detection
robust across different data shapes (string ids vs objects with `id`).

Files:
- `src/utils/upgradeUtils.js` exports:
  - `hasUpgradeById(selectedUpgrades, id)` — returns true when the upgrades array contains `id`.
  - `hasJumpJets(selectedUpgrades, unit)` — returns true when the unit has Jump Jets (explicit flag or id 'u6').

Examples

Basic detection from a unit object:

```js
import { hasJumpJets } from '../src/utils/upgradeUtils.js'

if (hasJumpJets(unit.selectedUpgrades, unit)) {
  // show jump movement value
}
```

Detect an arbitrary upgrade id:

```js
import { hasUpgradeById } from '../src/utils/upgradeUtils.js'

if (hasUpgradeById(unit.selectedUpgrades, 'u12')) {
  // unit has upgrade u12
}
```

Notes

- The helpers accept `selectedUpgrades` arrays containing either string ids (`['u6']`) or
  objects (`[{ id: 'u6', name: 'Jump Jets' }]`).
- `hasJumpJets` also respects an explicit `unit.hasJumpJets` boolean when present.
- Prefer these helpers whenever checking for upgrades to avoid duplicated, inconsistent logic.
