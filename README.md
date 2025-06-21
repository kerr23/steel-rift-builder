# Steel Rift Builder

A web application for building and managing rosters for the Steel Rift tabletop game.

## Features

- HE-V (Heavy Environment Vehicle) customization
- Support asset configuration
- Roster management
- Print-friendly roster output
- Stats calculation and validation
- Import/export functionality

## Recent Enhancements

### Architecture & Maintainability
- Improved component architecture with clear separation of concerns
- Centralized error handling system
- Form validation composable for consistent validation
- Extracted business logic into dedicated services
- Enhanced state management with Pinia stores
- Comprehensive documentation and guidelines

### Print Display
- Enhanced Support Asset layout to match the HEV card style
- Improved display for Ultra-Light HE-V squadrons with dedicated Upgrade Pod section
- Special styling for different types of support assets
- Removed tonnage display from support assets as requested
- Fixed the "Each use expends one Limited bubble" reminder as requested
- Updated the Ultra-Light HE-V squadron display to show upgrade pods details in a separate section

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Architecture

The application follows a multi-layered architecture for better maintainability:

- **UI Components**: Reusable visual elements
- **Domain Components**: Feature-specific components
- **Composables**: Reusable stateful logic
- **Services**: Business logic and operations
- **Stores**: Global state management
- **Data**: Game data and constants

For detailed information, see the [architecture documentation](./docs/architecture.md).

## Project Structure

```
steel-rift-builder/
├── public/               # Static assets
├── src/
│   ├── assets/           # CSS and other assets
│   ├── components/       # Vue components
│   │   ├── hev/          # HE-V related components
│   │   ├── layout/       # Layout components
│   │   ├── print/        # Print-related components
│   │   ├── roster/       # Roster management components
│   │   └── ui/           # Reusable UI components
│   ├── composables/      # Vue composables
│   ├── router/           # Vue Router configuration
│   ├── services/         # Business logic services
│   ├── stores/           # Pinia stores
│   └── utils/            # Utility functions
├── docs/                 # Project documentation
└── scripts/              # Build and utility scripts
```

## Documentation

- [Architecture Overview](./docs/architecture.md)
- [Maintainability Improvements](./docs/maintainability-improvements.md)
- [Maintainability Plan](./docs/maintainability-plan.md)
- [Component API Documentation](./docs/component-api.md)
- [Testing Standards](./docs/testing-standards.md)

## Contribution Guidelines

Please follow the coding standards and architecture patterns described in [copilot-instructions.md](./copilot-instructions.md) when contributing to the project.

- Write tests for new features
- Update documentation when needed
- Use meaningful commit messages
