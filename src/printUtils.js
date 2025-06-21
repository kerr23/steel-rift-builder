// Re-export print components for backward compatibility
// This file will help transition from the monolithic approach to modular components
// without breaking existing code

export { generateHevHtml } from './components/print/HevPrintable.js';
export { generateSupportAssetHtml } from './components/print/SupportAssetPrintable.js';
export { generateUltraLightSquadronHtml } from './components/print/UltraLightSquadronPrintable.js';
export { generateInfantryOutpostHtml } from './components/print/InfantryOutpostPrintable.js';
export { generatePrintHtml } from './services/printService.js';
export { 
  generateStructureBubbleHtml, 
  renderLimitedTraitWithBubbles 
} from './components/print/printHelpers.js';
