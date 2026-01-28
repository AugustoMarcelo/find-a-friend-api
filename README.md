# FindAFriend API

A REST API for a pet adoption system, built as a study project to practice **Domain-Driven Design (DDD)**, **Clean Architecture**, **Clean Code**, and **SOLID principles**.

## About

This project implements a pet adoption platform where organizations (ORGs) can register pets available for adoption, and users can search for pets by city and filter by characteristics.

## Features

- **Pet registration** - Add new pets to the system
- **City-based listing** - List pets available for adoption in a specific city
- **Advanced filtering** - Filter pets by age, size, energy level, independence level, and environment
- **Pet details** - View comprehensive information about a specific pet
- **ORG registration** - Register organizations responsible for pets
- **ORG authentication** - Secure login for organizations

## Project Structure

```
src/
├── core/                     # Shared building blocks (Entity, AggregateRoot, Either, etc.)
└── domain/
    └── adoption/
        ├── enterprise/       # Domain layer (entities, value objects)
        └── application/      # Application layer (use cases, repositories)

test/
├── factories/                # Test data factories
└── repositories/             # In-memory repository implementations
```

## Tech Stack

- TypeScript
- Vitest (testing)
- ESLint

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
