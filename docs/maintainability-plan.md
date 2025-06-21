# Steel Rift Builder - Maintainability Improvement Plan

This document outlines the key changes to improve maintainability for the Steel Rift Builder application.

## 1. State Management

### Current Issues
- App state is scattered between App.vue and the partially implemented Pinia stores
- Validation logic is duplicated across components
- No clear structure for managing global application state

### Improvements
- Complete migration to Pinia stores
- Implement a consistent store pattern using the Composition API
- Create dedicated stores for different domains:
  - `rosterStore` - managing roster data and operations
  - `themeStore` - managing UI theme preferences
  - `gameDataStore` - managing game rules and reference data

## 2. Component Structure

### Current Issues
- Large, complex components like hevCustomizer.vue (920+ lines) and SupportAssets.vue
- Mixed responsibilities in components (UI, validation, data fetching)
- Inconsistent interface between components

### Improvements
- Break down large components into smaller, focused components
- Extract reusable UI components (StatDisplay, FormField, etc.)
- Implement consistent component interfaces
- Use composables for shared logic
- Create dedicated validation services

## 3. Testing Strategy

### Current Issues
- Inconsistent testing patterns
- Some tests directly manipulate DOM while others use component APIs
- Repetitive test setup code
- Some test failures in the current suite

### Improvements
- Standardize test structure with consistent patterns
- Implement test utilities for common test operations
- Increase test coverage for core functionality
- Focus on testing public component APIs rather than implementation details

## 4. Code Organization

### Current Issues
- Mixed file organization (some flat, some nested)
- Inconsistent file naming conventions
- Coupling between components and business logic

### Improvements
- Create clear separation between:
  - Components (UI)
  - Services (business logic)
  - Stores (state management)
  - Utils (reusable helpers)
  - Types (type definitions)
- Establish consistent naming conventions
- Group related files together

## 5. Error Handling

### Current Issues
- Inconsistent error handling patterns
- Some errors are silently ignored
- Toast notifications are created in different ways

### Improvements
- Implement centralized error handling
- Create consistent error reporting through stores
- Add error boundaries for component failures
- Standardize user notifications

## 6. Performance Optimizations

### Current Issues
- Potential for unnecessary re-renders with complex nested data
- No clear memoization strategy
- Large component trees may cause performance issues

### Improvements
- Use computed properties consistently
- Implement proper memoization for expensive operations
- Consider code splitting for large components
- Add performance monitoring

## Implementation Tasks

1. ✅ Complete the migration of the `rosterStore` to use the Composition API pattern
2. ✅ Create reusable UI components like `StatDisplay`  
3. ✅ Implement a validation service (`unitValidation.js`)
4. ✅ Create form validation composable (`useFormValidation`)
5. Extract HE-V configuration logic into a composable
6. Break down hevCustomizer.vue into smaller components
7. Break down SupportAssets.vue into smaller components
8. Standardize the error handling approach
9. Update tests to match the new architecture
10. Document component APIs and usage patterns

## Benefits

- Reduced cognitive load when working with the codebase
- Easier onboarding for new developers
- More reliable testing
- Better separation of concerns
- Improved performance through targeted optimizations
- More consistent user experience
