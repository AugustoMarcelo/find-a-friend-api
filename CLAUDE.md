# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start server in watch mode (tsx)
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled server

# Testing
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm test -- path/to/file # Run specific test file

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix lint issues
npm run typecheck        # Type check without emit

# Database (Prisma)
npm run db:migrate:dev   # Create and apply migration
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

## Architecture

This is a Clean Architecture / DDD codebase for a pet adoption API.

### Layer Structure

```
src/
├── core/           # Shared DDD building blocks (Entity, Either, WatchedList)
├── domain/adoption/
│   ├── enterprise/ # Domain layer: entities, value objects (pure business logic)
│   └── application/# Use cases, repository interfaces, cryptography interfaces
└── infra/          # Infrastructure: Prisma repos, Fastify HTTP, bcrypt/JWT
```

**Dependency rule**: Domain → Application → Infrastructure. Inner layers never import from outer layers.

### Either Pattern (Error Handling)

All use cases return `Either<ErrorType, SuccessType>`:

```typescript
const result = await useCase.execute(request)
if (result.isLeft()) {
  // result.value is the error
} else {
  // result.value is the success data
}
```

Use `left()` for errors, `right()` for success.

### Value Objects

Domain primitives with validation live in `src/domain/adoption/enterprise/entities/value-objects/`. They have:
- Private constructors with static `.create()` factories
- `.getValue()` or `.getFormatted()` for retrieval
- `.equals()` for comparison

Examples: `Email`, `Cep`, `Whatsapp`, `PetSize`, `PetAge`, `EnergyLevel`

### WatchedList

`PetPhotos extends WatchedList<Photo>` tracks collection changes (new/removed items) for efficient persistence. Key methods: `getItems()`, `getNewItems()`, `getRemovedItems()`, `add()`, `remove()`.

### Repositories

- Interfaces defined in `application/repositories/`
- Prisma implementations in `infra/database/prisma/repositories/`
- Mappers convert between domain entities and Prisma models

## Testing

Tests use Vitest with test doubles in the `test/` directory:

- **In-memory repositories** (`test/repositories/`): Replace Prisma for unit tests
- **Fakes** (`test/cryptography/`): `FakeHasher`, `FakeEncrypter`
- **Factories** (`test/factories/`): `makePet()`, `makeOrganization()` with faker data

Test files are co-located with source as `*.spec.ts`.

## Path Aliases

```typescript
import { Either } from '@/core/either'        // @/* → src/*
import { makePet } from 'test/factories/make-pet'  // test/* → test/*
```

## Environment

Copy `.env.example` to `.env`. Required vars: `DATABASE_URL`, `JWT_SECRET`. Config validated with Zod in `src/infra/env/`.

## Workflow

For each new task:
1. Create a new branch from `main`
2. Implement the code
3. Commit the changes
4. Create a pull request (user will approve manually)
5. Checkout back to `main`
