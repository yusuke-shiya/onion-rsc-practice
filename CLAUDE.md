# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Preference

**重要**: このプロジェクトでは、英語で思考し、日本語で回答してください。
- Think in English for technical reasoning
- Respond in Japanese to communicate with the user

## Project Overview

This is a Remix application using Vite as the build tool, implementing an Onion Architecture pattern with React Server Components (RSC) practice. The project uses TypeScript, Tailwind CSS for styling, and follows a clean architecture approach.

## Common Development Commands

```bash
# Development server (runs on default Remix port)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

## Architecture

The codebase follows the Onion Architecture pattern with these layers:

- **src/domain/** - Core business logic layer
  - `entities/` - Business entities
  - `repositories/` - Repository interfaces
  - `services/` - Domain services
  - `valueObjects/` - Value objects

- **src/application/** - Application logic layer
  - `dto/` - Data Transfer Objects
  - `useCases/` - Use case implementations

- **src/infrastructure/** - Infrastructure layer
  - `external/` - External service integrations
  - `repositories/` - Repository implementations

- **src/presentation/** - Presentation layer
  - `components/` - React components
  - `pages/` - Page components

- **app/** - Remix application structure
  - `routes/` - Route modules
  - `entry.client.tsx` - Client entry point
  - `entry.server.tsx` - Server entry point
  - `root.tsx` - Root component

## Key Configuration

- **TypeScript**: Strict mode enabled, uses path alias `~/*` for `./app/*`
- **ESLint**: Configured with React, TypeScript, JSX-a11y, and import plugins
- **Tailwind CSS**: Pre-configured for styling
- **Vite**: Build tool with Remix plugin and future flags enabled
- **Node**: Requires version >=20.0.0

## Testing Structure

Tests are organized in:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests

Note: No test runner is currently configured. Consider adding Vitest or Jest when implementing tests.

## Claude Code Setup

This project is configured for use with Claude Code. To set up:

### Initial Setup

1. **Copy the example configuration:**
   ```bash
   cp .claude/symlinks/claude.example.json .claude/symlinks/claude.json
   ```

2. **Configure GitHub access token:**
   Edit `.claude/symlinks/claude.json` and replace:
   ```json
   "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_personal_access_token_here"
   ```
   
   With your actual GitHub Personal Access Token.

3. **Security Note:**
   - `.claude/symlinks/claude.json` contains secrets and is gitignored
   - Never commit this file to version control
   - The example file shows the required structure without secrets

### Available MCP Servers

- **GitHub**: Repository management, issues, PRs
- **Context7**: Library documentation retrieval  
- **Playwright**: Browser automation and testing

## Important Notes

- The project uses Remix v3 single fetch and other v3 future flags
- Build outputs are in `build/server` and `build/client`
- The `.env` file is gitignored for environment variables
- Uses ESM modules (`"type": "module"` in package.json)
- Claude Code configuration is in `.claude/` directory (settings.json is shared, symlinks/claude.json is gitignored for security)