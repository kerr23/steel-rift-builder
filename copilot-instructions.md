# Copilot Instructions

## General Coding Guidelines
- Use Tailwind CSS utility classes for all styling.
- Follow the existing file and folder structure.
- Write clear, maintainable, and well-documented code.
- Prefer modular, composable components and utilities.
- Add JSDoc comments to all components and functions.
- Follow established memoization patterns for expensive operations.

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

## File Organization
- Place Vue components in `src/components/`, using subfolders as needed:
  - `ui/` for reusable UI components
  - `roster/` for roster-related components
  - `print/` for print-related components
  - `layout/` for layout components
  - `icons/` for icon components
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

## Additional Notes
- Use Vite for development and builds.
- Refer to `README.md` for setup and contribution instructions.
- For questions about project structure or conventions, check existing files for examples.
