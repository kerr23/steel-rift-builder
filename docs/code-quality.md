# Code Quality Tools

This project uses several tools to ensure code quality and consistency:

## Formatters

### Prettier
Prettier is the designated code formatter for this project. It automatically formats JavaScript, Vue, and other files according to a consistent style defined in `.prettierrc.json`.

- **Usage**: `npm run format`
- **Configuration**: `.prettierrc.json`

## Linters

### ESLint
ESLint checks code for potential errors and enforces coding standards. It's configured to defer formatting to Prettier.

- **Usage**: `npm run lint:eslint`
- **Configuration**: `eslint.config.js`

### Oxlint
Oxlint is a fast JavaScript linter focused on correctness issues. It complements ESLint by providing additional checks.

- **Usage**: `npm run lint:oxlint`
- **Configuration**: Used via ESLint plugin (`eslint-plugin-oxlint`)

## Workflow

1. Write your code
2. Run linting to catch potential issues: `npm run lint`
3. Format your code before committing: `npm run format`

To automatically apply all checks, you can run:
```bash
npm run lint && npm run format
```

## Editor Integration

For the best development experience, configure your editor to:
- Format on save using Prettier
- Show ESLint errors/warnings inline

Most editors (VS Code, WebStorm, etc.) have extensions/plugins that support these tools.
