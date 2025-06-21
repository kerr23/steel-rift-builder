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

## File Organization
- Place Vue components in `src/components/`, using subfolders as needed:
  - `ui/` for reusable UI components
  - `hev/` for HE-V related components
  - `roster/` for roster management
  - `print/` for print-related components
- Store utility functions in `src/utils/`.
- Keep CSS in `src/assets/` or alongside components.
- Use the `public/` directory for static assets.

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

## Additional Notes
- Use Vite for development and builds.
- Refer to `README.md` for setup and contribution instructions.
- For questions about project structure or conventions, check existing files for examples.
