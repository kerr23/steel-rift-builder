# Copilot Instructions

## General Coding Guidelines
- Use Tailwind CSS utility classes for all styling.
- Follow the existing file and folder structure.
- Write clear, maintainable, and well-documented code.
- Prefer modular, composable components and utilities.
- Add JSDoc comments to all components and functions.
- Follow established memoization patterns for expensive operations.
- Use the centralized error handling system via `errorService`.
- Validate data with the appropriate validation services.

## Architecture Guidelines
- Follow the established multi-layered architecture:
  1. UI Components (generic, reusable)
  2. Domain Components (feature-specific)
  3. Composables (reusable stateful logic)
  4. Services (business logic)
  5. Stores (global state)
  6. Data (constants, game data)
- Place components in appropriate folders:
  - `/components/ui/` for reusable UI components
  - `/components/hev/` for HE-V related components
  - `/components/roster/` for roster management
  - `/components/print/` for print-related components
- Place business logic in services under `/services/`
- Use composables for reusable component logic
- Manage application state through Pinia stores

## Vue 3 Component Architecture
- Use the Composition API with `<script setup>` syntax.
- Leverage Vue 3 features like `ref`, `computed`, `watch`, and `nextTick`.
- Extract reusable logic into composable functions when appropriate.
- Organize component code in this order:
  1. Imports
  2. Props/Emits
  3. Refs and reactive state
  4. Computed properties
  5. Methods
  6. Watchers
  7. Lifecycle hooks/setup logic

## State Management
- Use Pinia for global state management.
- Keep component state local when possible.
- Use props/emits for parent-child communication.
- Follow the established pattern of using `ref` and `computed` for reactive data.
- Use watchers to react to state changes and sync with external services.

## Testing
- Generate tests for all new features and components.
- Place tests in the appropriate `__tests__` directory.
- Ensure all tests pass after making changes (run `vitest`).
- Use descriptive test names and cover edge cases.
- Follow existing test patterns for consistent test structure.
- Mock external dependencies (localStorage, toast notifications, etc.).

## Testing Guidelines
- Each component, composable, and service should have corresponding tests.
- Structure test files to mirror source file structure (e.g., `/components/ui/__tests__/`).
- Test components for:
  1. Correct rendering of UI elements
  2. Proper handling of props
  3. Event emissions
  4. User interactions
- Test composables for:
  1. State management
  2. Logic correctness
  3. Response to input changes
- Test services for:
  1. Business logic correctness
  2. Validation rules
  3. Error handling
- Use mocks for external dependencies.
- Keep tests focused on behavior, not implementation details.
- Maintain test coverage for critical paths.

## Print Component Testing
- Test each print component individually in `printComponents.spec.js`
- Verify the HTML structure contains expected elements
- Test with both minimal and complete data scenarios
- Test integration with `printService.js` to ensure proper delegation
- When adding a new unit type:
  1. Create specific test cases for the new unit type
  2. Ensure trait definitions are properly rendered
  3. Test armor/structure bubbles are correctly displayed
  4. Verify proper handling of special attributes
  5. Test integration with the full print HTML generation

## File Organization
- Place Vue components in `src/components/`, using subfolders as needed:
  - `ui/` for reusable UI components
  - `hev/` for HE-V related components
  - `roster/` for roster management
  - `print/` for print-related components
- Store utility functions in `src/utils/`.
- Keep CSS in `src/assets/` or alongside components.
- Use the `public/` directory for static assets.

## Print System Architecture
The print system follows a modular component-based architecture:

1. **Core Structure**
   - `printService.js`: Coordinates print rendering by delegating to the appropriate component
   - `printUtils.js`: Re-exports from individual components for backward compatibility
   - `printHelpers.js`: Shared utility functions for print rendering

2. **Unit-Specific Print Components**
   - `HevPrintable.js`: Renders standard HE-V units
   - `SupportAssetPrintable.js`: Renders support assets and weapon systems
   - `UltraLightSquadronPrintable.js`: Renders Ultra-Light Squadron units
   - `InfantryOutpostPrintable.js`: Renders Infantry Outpost and Bunker units
   - Each component exports a main rendering function (e.g., `generateHevHtml`)

3. **Component Integration**
   - `PrintableRoster.vue`: Vue component wrapper for the print system
   - All components share common formatting helpers via `printHelpers.js`
   - Components can be tested independently via `printComponents.spec.js`

4. **Extension Pattern**
   - To add a new unit type, follow the "Adding New Unit Types" section below
   - Reuse shared helpers where possible
   - Maintain consistent HTML structure for proper CSS styling

5. **Documentation Requirements**
   - Maintain comprehensive JSDoc comments for all print-related functions
   - Update the print system architecture documentation when adding new components
   - Document the expected data structures for each unit type
   - Include examples of correct HTML output in test files
   - Keep README.md updated with any user-facing print system changes
   - Document any special handling or edge cases for specific unit types

## Tailwind CSS
- Use Tailwind utility classes for all styling.
- Leverage the component classes in `src/assets/components.css`.
- Avoid custom CSS unless necessary; extend Tailwind via configuration.
- Keep Tailwind config changes in `tailwind.config.js`.
- Use CSS variables for theming (dark mode support).

## Performance Optimizations
- Use memoization for expensive calculations and lookups.
- Create and use cached functions similar to existing patterns in `gameData.js`.
- Use the `MemoizedTraitFormatter` component for formatting traits.
- Implement lazy loading for components when appropriate.
- Generate and cache HTML strings only when necessary.
- Follow the optimization guidelines in `src/optimization-summary.md`.

## Performance Guidelines
- Use computed properties with appropriate dependencies.
- Implement memoization for expensive operations.
- Keep component hierarchies shallow when possible.
- Use `v-for` with `key` for list rendering.
- Consider lazy loading for large components.

## Project-Specific Guidelines
- Use the existing game data structure in `gameData.js`.
- Follow the HE-V, Support Asset, and UL-HEV/ULV modeling patterns.
- Respect tonnage, slot, and other game mechanics calculations.
- Maintain the print functionality with proper formatting.
- Keep roster import/export logic consistent.
- Support dark mode through the established theming system.

## Adding New Unit Types
When implementing a new unit type, follow this pattern:

1. **Print Functionality**
   - Create a dedicated print component in `src/components/print/` (e.g., `NewUnitTypePrintable.js`)
   - Follow the existing pattern with a main export function like `generateNewUnitTypeHtml`
   - Use shared helper functions from `printHelpers.js` for common elements (bubbles, trait lists, etc.)
   - Import and register the new component in `printService.js`
   - Update conditional rendering in `generatePrintHtml` function to detect and render the new unit type
   - Re-export the new component in `printUtils.js` for backward compatibility
   - Add tests in `src/__tests__/printComponents.spec.js`

2. **Unit Data Structure**
   - Document the expected data structure as JSDoc comments in the print component
   - Use consistent property naming conventions (e.g., `type`, `details`, `traits`, etc.)
   - Provide unit type detection logic in the print service

3. **UI Components**
   - Create appropriate editor components in corresponding folders
   - Implement validators for the new unit type properties
   - Add roster item rendering support

4. **Testing**
   - Write tests for the new print component
   - Include tests for edge cases (missing data, extreme values)
   - Test integration with the print service
   - Verify visual rendering with snapshot tests when appropriate

5. **Documentation**
   - Update JSDoc comments for any modified parsing or rendering functions
   - Document the detection logic for specialized unit types (e.g., Engineers, Specialists)
   - Maintain a list of supported infantry types in the component documentation
   - Ensure test cases cover all supported unit types
   - Document any special formatting requirements for unique unit types

## Error Handling
- Use toast notifications for user feedback.
- Add appropriate error handling for data operations.
- Include validation for user inputs.
- Provide informative error messages.

## Error Handling Guidelines
- Use the `errorService` for all error handling.
- Categorize errors appropriately (validation, network, runtime, etc.).
- Provide context when reporting errors.
- Handle errors at the appropriate level:
  - UI interaction errors in components
  - Business logic errors in services
  - Global errors in error boundaries
- Display user-friendly error messages via toast notifications.
- Log detailed errors for debugging.

## Documentation Guidelines
- Update documentation whenever code changes affect functionality, APIs, or architecture.
- Keep JSDoc comments in sync with code changes to ensure accurate API documentation.
- When adding new features, update the following documentation as appropriate:
  - README.md for user-facing changes and setup instructions
  - Component and function JSDoc comments
  - Architecture diagrams or descriptions
  - Print system documentation when modifying print components
  - Unit type documentation when adding/modifying game units
- Create dedicated documentation files for complex subsystems in their respective directories.
- Document edge cases, limitations, and workarounds for known issues.
- Include examples for non-obvious usage patterns.
- Ensure documentation is clear, concise, and accessible to new developers.
- Follow the established documentation style for consistency.

## Additional Notes
- Use Vite for development and builds.
- Refer to `README.md` for setup and contribution instructions.
- For questions about project structure or conventions, check existing files for examples.
