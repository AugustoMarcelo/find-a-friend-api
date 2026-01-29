# FindAFriend API

A REST API for a pet adoption system, built as a study project to practice **Domain-Driven Design (DDD)**, **Clean Architecture**, **Clean Code**, and **SOLID principles**.

## About

This project implements a pet adoption platform where organizations (ORGs) can register pets available for adoption, and users can search for pets by city and filter by characteristics.

## Features

- **Pet registration** - Add new pets to the system
- **City-based listing** - List pets available for adoption in a specific city
- **Advanced filtering** - Filter pets by age, size, energy level, independence level, and environment
- **Pet details** - View comprehensive information about a specific pet
- **Pet photos** - Upload and manage photos for pets
- **ORG registration** - Register organizations responsible for pets
- **ORG authentication** - Secure login for organizations

## Project Structure

```
src/
├── @types/                   # TypeScript type declarations
├── core/                     # Shared building blocks
│   ├── entities/             # Entity, AggregateRoot, UniqueEntityId
│   ├── errors/               # Common domain errors
│   ├── events/               # Domain events infrastructure
│   └── types/                # Utility types (Optional, Either)
├── domain/
│   └── adoption/
│       ├── enterprise/       # Domain layer (entities, value objects)
│       └── application/      # Application layer (use cases, repositories, cryptography interfaces)
└── infra/                    # Infrastructure layer
    ├── cryptography/         # JWT and bcrypt implementations
    ├── database/
    │   └── prisma/           # Prisma client, mappers, and repositories
    ├── env/                  # Environment configuration
    └── http/                 # HTTP layer (Fastify)
        ├── controllers/      # Route handlers
        ├── middlewares/      # Auth middleware (JWT verification)
        └── presenters/       # Response formatters

test/
├── cryptography/             # Cryptography test doubles
├── factories/                # Test data factories
└── repositories/             # In-memory repository implementations
```

## Tech Stack

- TypeScript
- Fastify (HTTP framework)
- Prisma (ORM)
- PostgreSQL
- Zod (validation)
- JWT (authentication)
- bcryptjs (password hashing)
- Vitest (testing)
- Docker
- ESLint + Husky (code quality)

## Running Tests

```bash
npm install
npm test
```

## Business Rules

- City is required to list pets
- Every pet must be linked to an organization
- Organizations must provide address and WhatsApp contact
- Only authenticated organizations can register/edit pets
