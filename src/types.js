/**
 * @typedef {Object} HEVClass
 * @property {string} name - The name of the HE-V class
 * @property {number} baseTonnage - Base tonnage for this class
 * @property {number} baseSlots - Base equipment slots for this class
 * @property {number} baseArmor - Base armor value for this class
 * @property {number} baseStructure - Base structure value for this class
 * @property {number} baseMovement - Base movement speed in inches
 * @property {string} defenseRoll - Defense roll value (e.g., "4+")
 * @property {string} [special] - Optional special rule for this class
 */

/**
 * @typedef {Object} MotiveType
 * @property {string} id - Unique identifier for the motive type
 * @property {string} name - Name of the motive type
 * @property {string[]} classApplicability - Array of class names this motive type can be used with
 * @property {number} tonnageModifier - Modifier to tonnage for this motive type
 * @property {number} slotModifier - Modifier to available slots for this motive type
 * @property {string} [description] - Optional description of special abilities
 */

/**
 * @typedef {Object} Weapon
 * @property {string} id - Unique identifier for the weapon
 * @property {string} name - Name of the weapon
 * @property {Object.<string, number>|number} tonnage - Tonnage cost by class or flat value
 * @property {Object.<string, number>|number} damageRating - Damage rating by class or flat value
 * @property {Array<WeaponTrait>} traits - Array of traits for this weapon
 * @property {string} rangeCategory - Range category for this weapon
 */

/**
 * @typedef {Object} WeaponTrait
 * @property {string} name - Name of the trait
 * @property {string|number|Object.<string, number|string>} [value] - Optional value for the trait
 */

/**
 * @typedef {Object} Upgrade
 * @property {string} id - Unique identifier for the upgrade
 * @property {string} name - Name of the upgrade
 * @property {Object.<string, number>|number} tonnage - Tonnage cost by class or flat value
 * @property {string} [description] - Optional description of the upgrade
 * @property {string} [type] - Optional categorization (e.g., "armor")
 * @property {string[]} [allowedClasses] - Optional list of classes that can use this upgrade
 * @property {Array<WeaponTrait>} [traits] - Optional array of traits for this upgrade
 */

/**
 * @typedef {Object} HEVUnit
 * @property {string} unitName - Name of the HE-V unit
 * @property {string} id - Unique identifier for this unit
 * @property {HEVClass} selectedClass - The selected class for this unit
 * @property {MotiveType} selectedMotiveType - The selected motive type for this unit
 * @property {number} effectiveArmor - Effective armor value after modifications
 * @property {number} effectiveStructure - Effective structure value after modifications
 * @property {Weapon[]} selectedWeapons - Array of selected weapons
 * @property {Upgrade[]} selectedUpgrades - Array of selected upgrades
 * @property {number} totalUnitTonnage - Total tonnage used by this unit
 * @property {number} usedSlots - Number of slots used
 * @property {number} maxSlots - Maximum available slots
 */

/**
 * @typedef {Object} SupportAsset
 * @property {string} id - Unique identifier for this asset
 * @property {boolean} isSupportAsset - Flag indicating this is a support asset
 * @property {string} type - Type of support asset
 * @property {string} [class] - Class of support asset (for squadron types)
 * @property {string[]} details - Array of detail strings for the asset
 * @property {number} totalUnitTonnage - Tonnage value for the asset (typically 10)
 * @property {Object} [squadronData] - Optional raw squadron data for editing
 */

/**
 * @typedef {Object} Roster
 * @property {string} rosterName - Name of the roster
 * @property {Array<HEVUnit|SupportAsset>} roster - Array of units in the roster
 */

// Export for use in other files
export {};
