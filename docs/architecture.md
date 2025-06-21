# Steel Rift Builder - Architecture Improvements

This document outlines the architectural improvements made to enhance maintainability, scalability, and testability of the Steel Rift Builder application.

## Component Decomposition Strategy

### Before
The application initially had large monolithic components:
- `hevCustomizer.vue` (920+ lines)
- `SupportAssets.vue` (similar complexity)
- `App.vue` with too many responsibilities

### After
We've implemented a multi-layered architecture:

```
┌─ UI Components ─────────┐
│ StatDisplay, Button,     │
│ FormSelect, etc.         │
└───────────────────────┬─┘
                        │
┌─ Domain Components ───▼─┐
│ HevEditor,              │
│ ChassisClassSelector,   │
│ MotiveSystemSelector,   │
│ etc.                    │
└───────────────────────┬─┘
                        │
┌─ Composables ─────────▼─┐
│ useHevConfiguration,    │
│ useFormValidation,      │
│ etc.                    │
└───────────────────────┬─┘
                        │
┌─ Services ────────────▼─┐
│ hevService,             │
│ unitValidation,         │
│ errorService            │
└───────────────────────┬─┘
                        │
┌─ Store ───────────────▼─┐
│ rosterStore,            │
│ themeStore,             │
│ etc.                    │
└───────────────────────┬─┘
                        │
┌─ Data ────────────────▼─┐
│ gameData,               │
│ constants               │
└─────────────────────────┘
```

## Architectural Principles Applied

### 1. Separation of Concerns
- **UI Components**: Focus solely on presentation
- **Domain Components**: Encapsulate domain-specific UI logic
- **Composables**: Handle reusable stateful logic
- **Services**: Implement business rules and operations
- **Stores**: Manage global application state

### 2. Single Responsibility Principle
Each component, composable, and service has one clear responsibility:
- `StatDisplay`: Display a single statistic with appropriate styling
- `ChassisClassSelector`: Select and display chassis class details
- `useHevConfiguration`: Manage the state of HE-V configuration
- `unitValidation`: Validate unit configurations
- `errorService`: Centralize error handling

### 3. Composition Over Inheritance
- Functionality is composed from smaller, focused pieces
- UI components use other UI components
- Complex logic is extracted to composables and services

### 4. Dependency Injection
- Services are provided through Vue's provide/inject system
- Dependencies are explicitly defined
- Makes testing easier through mocking

### 5. Unidirectional Data Flow
- Data flows from parent to child components via props
- Children notify parents of changes via events
- Global state is managed in stores
- Clear and predictable data flow pattern

## Testing Strategy

The new architecture enables better testing:

1. **UI Component Tests**: Focus on rendering and interactions
2. **Domain Component Tests**: Focus on integration of UI components
3. **Composable Tests**: Focus on state management and logic
4. **Service Tests**: Focus on business rules and validation
5. **Store Tests**: Focus on global state management

## Benefits of the New Architecture

1. **Improved Maintainability**:
   - Smaller, focused components are easier to understand and modify
   - Clear separation of concerns makes changes more isolated
   - Consistent patterns make the codebase more predictable

2. **Better Testability**:
   - Components can be tested in isolation
   - Business logic is extracted to services for easier testing
   - Clear dependencies make mocking straightforward

3. **Enhanced Developer Experience**:
   - Easier onboarding for new developers
   - Clear patterns to follow for new features
   - Better IDE support with smaller files

4. **Performance Improvements**:
   - More targeted component rendering
   - Better opportunities for memoization
   - Potential for code splitting and lazy loading

5. **Scalability**:
   - Architecture can accommodate growing feature set
   - Consistent patterns support team growth
   - Better module boundaries prevent code entanglement

## Conclusion

This architectural approach transforms the codebase from a collection of large, complex components into a structured, maintainable system of smaller, focused pieces that work together through clear interfaces and patterns. The result is a codebase that is easier to understand, test, and extend.
