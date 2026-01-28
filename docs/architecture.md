# DDD Architecture Guide

A practical guide for building Node.js/TypeScript applications using Domain-Driven Design patterns.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Core Building Blocks](#2-core-building-blocks)
3. [Domain Layer](#3-domain-layer)
4. [Application Layer](#4-application-layer)
5. [Test Infrastructure](#5-test-infrastructure)
6. [Naming Conventions](#6-naming-conventions)
7. [Adding New Features](#7-adding-new-features)

---

## 1. Project Structure

```
src/
├── core/                          # Shared building blocks
│   ├── entities/
│   │   ├── entity.ts              # Base Entity class
│   │   ├── aggregate-root.ts      # Base AggregateRoot class
│   │   └── unique-entity-id.ts    # UUID wrapper
│   ├── events/
│   │   ├── domain-event.ts        # DomainEvent interface
│   │   └── domain-events.ts       # Event dispatcher
│   ├── errors/
│   │   └── resource-not-found-error.ts
│   ├── either.ts                  # Either monad for error handling
│   └── optional.ts                # Optional utility type
│
├── domain/
│   └── [subdomain]/               # e.g., catalog, stock, sales
│       ├── enterprise/            # Domain layer
│       │   ├── entities/
│       │   │   ├── [entity].ts
│       │   │   └── value-objects/
│       │   │       └── [value-object].ts
│       │   └── events/
│       │       └── [domain-event].ts
│       │
│       └── application/           # Application layer
│           ├── repositories/
│           │   └── [entity]-repository.ts
│           └── use-cases/
│               ├── [use-case].ts
│               └── [use-case].spec.ts
│
test/
├── factories/
│   └── make-[entity].ts           # Test data factories
└── repositories/
    └── in-memory-[entity]-repository.ts
```

---

## 2. Core Building Blocks

### 2.1 UniqueEntityId

Wraps UUID generation and comparison.

```typescript
// src/core/entities/unique-entity-id.ts
import { randomUUID } from 'node:crypto'

export class UniqueEntityId {
  private value: string

  constructor(value?: string) {
    this.value = value ?? randomUUID()
  }

  toValue(): string {
    return this.value
  }

  equals(id: UniqueEntityId): boolean {
    return this.value === id.toValue()
  }
}
```

### 2.2 Base Entity

All entities extend this class. Uses a generic `Props` type for type-safe property access.

```typescript
// src/core/entities/entity.ts
import { UniqueEntityId } from './unique-entity-id'

export abstract class Entity<Props> {
  private _id: UniqueEntityId
  protected props: Props

  get id(): UniqueEntityId {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityId) {
    this.props = props
    this._id = id ?? new UniqueEntityId()
  }

  equals(entity: Entity<Props>): boolean {
    if (entity === this) return true
    if (entity.id === this._id) return true
    return false
  }
}
```

### 2.3 AggregateRoot

Extends Entity with domain event capabilities. Use for entities that are consistency boundaries.

```typescript
// src/core/entities/aggregate-root.ts
import { Entity } from './entity'
import { DomainEvent } from '../events/domain-event'
import { DomainEvents } from '../events/domain-events'

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
    DomainEvents.markAggregateForDispatch(this)
  }

  public clearEvents(): void {
    this._domainEvents = []
  }
}
```

### 2.4 Domain Events

Interface and dispatcher for domain events.

```typescript
// src/core/events/domain-event.ts
import { UniqueEntityId } from '../entities/unique-entity-id'

export interface DomainEvent {
  occurredAt: Date
  getAggregateId(): UniqueEntityId
}

// src/core/events/domain-events.ts
import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityId } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'

type DomainEventCallback = (event: DomainEvent) => void

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}
  private static markedAggregates: AggregateRoot<unknown>[] = []

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>): void {
    const exists = this.markedAggregates.some((a) => a.id.equals(aggregate.id))
    if (!exists) {
      this.markedAggregates.push(aggregate)
    }
  }

  public static dispatchEventsForAggregate(id: UniqueEntityId): void {
    const aggregate = this.markedAggregates.find((a) => a.id.equals(id))
    if (aggregate) {
      aggregate.domainEvents.forEach((event) => this.dispatch(event))
      aggregate.clearEvents()
      this.markedAggregates = this.markedAggregates.filter((a) => !a.id.equals(id))
    }
  }

  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ): void {
    if (!this.handlersMap[eventClassName]) {
      this.handlersMap[eventClassName] = []
    }
    this.handlersMap[eventClassName].push(callback)
  }

  private static dispatch(event: DomainEvent): void {
    const eventClassName = event.constructor.name
    const handlers = this.handlersMap[eventClassName]
    if (handlers) {
      handlers.forEach((handler) => handler(event))
    }
  }

  public static clearHandlers(): void {
    this.handlersMap = {}
  }

  public static clearMarkedAggregates(): void {
    this.markedAggregates = []
  }
}
```

### 2.5 Either Monad

For error handling without exceptions. Functions return `Either<Error, Success>`.

```typescript
// src/core/either.ts
export type Either<L, R> = Left<L, R> | Right<L, R>

export class Left<L, R> {
  readonly value: L

  constructor(value: L) {
    this.value = value
  }

  isLeft(): this is Left<L, R> {
    return true
  }

  isRight(): this is Right<L, R> {
    return false
  }
}

export class Right<L, R> {
  readonly value: R

  constructor(value: R) {
    this.value = value
  }

  isLeft(): this is Left<L, R> {
    return false
  }

  isRight(): this is Right<L, R> {
    return true
  }
}

export const left = <L, R>(value: L): Either<L, R> => new Left(value)
export const right = <L, R>(value: R): Either<L, R> => new Right(value)
```

### 2.6 Optional Type

Makes selected properties optional.

```typescript
// src/core/types/optional.ts
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
```

---

## 3. Domain Layer

Located at `src/domain/[subdomain]/enterprise/`

### 3.1 Value Objects

Immutable objects defined by their attributes, not identity. Use static factory methods for validation.

```typescript
// src/domain/stock/enterprise/entities/value-objects/quantity.ts
export class Quantity {
  private readonly value: number

  private constructor(value: number) {
    this.value = value
  }

  static create(value: number): Quantity {
    if (value < 0) {
      throw new Error('Quantity cannot be negative')
    }
    return new Quantity(value)
  }

  getValue(): number {
    return this.value
  }

  add(quantity: Quantity): Quantity {
    return Quantity.create(this.value + quantity.getValue())
  }

  subtract(quantity: Quantity): Quantity {
    return Quantity.create(this.value - quantity.getValue())
  }

  equals(quantity: Quantity): boolean {
    return this.value === quantity.getValue()
  }
}
```

**Key characteristics:**
- Private constructor (enforce factory usage)
- Static `create()` method with validation
- Immutable (methods return new instances)
- `equals()` compares by value

### 3.2 Entities

Objects with identity that persists over time. Extend `Entity<Props>` or `AggregateRoot<Props>`.

```typescript
// src/domain/catalog/enterprise/entities/product.ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Size } from './value-objects/size'

export interface ProductProps {
  name: string
  description: string
  size: Size
  color: string
}

export class Product extends Entity<ProductProps> {
  get name(): string {
    return this.props.name
  }

  get description(): string {
    return this.props.description
  }

  get size(): Size {
    return this.props.size
  }

  get color(): string {
    return this.props.color
  }

  updateName(name: string): void {
    this.props.name = name
  }

  static create(
    props: Optional<ProductProps, 'description'>,
    id?: UniqueEntityId,
  ): Product {
    return new Product(
      {
        ...props,
        description: props.description ?? '',
      },
      id,
    )
  }
}
```

**Key characteristics:**
- Protected constructor (inherited from Entity)
- Static `create()` factory method
- Getters for property access
- Behavior methods that modify internal state
- Use `Optional<Props, 'field'>` for optional creation props

### 3.3 Aggregate Roots with Domain Events

For entities that emit domain events when important state changes occur.

```typescript
// src/domain/stock/enterprise/entities/inventory.ts
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Quantity } from './value-objects/quantity'
import { StockLevelReachedMinimum } from '../events/stock-level-reached-minimum'

export interface InventoryProps {
  productId: UniqueEntityId
  currentQuantity: Quantity
  minThreshold: Quantity
}

export class Inventory extends AggregateRoot<InventoryProps> {
  get productId(): UniqueEntityId {
    return this.props.productId
  }

  get currentQuantity(): Quantity {
    return this.props.currentQuantity
  }

  get minThreshold(): Quantity {
    return this.props.minThreshold
  }

  isLow(): boolean {
    return this.props.currentQuantity.getValue() <= this.props.minThreshold.getValue()
  }

  reduceStock(amount: Quantity): boolean {
    const wasAboveThreshold = !this.isLow()

    const newValue = this.props.currentQuantity.getValue() - amount.getValue()
    this.props.currentQuantity = Quantity.create(newValue)

    const isNowLow = this.isLow()

    // Emit event when crossing threshold
    if (wasAboveThreshold && isNowLow) {
      this.addDomainEvent(new StockLevelReachedMinimum(this))
    }

    return isNowLow
  }

  static create(props: InventoryProps, id?: UniqueEntityId): Inventory {
    return new Inventory(props, id)
  }
}
```

### 3.4 Domain Event Implementation

```typescript
// src/domain/stock/enterprise/events/stock-level-reached-minimum.ts
import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Inventory } from '../entities/inventory'

export class StockLevelReachedMinimum implements DomainEvent {
  public occurredAt: Date
  private inventory: Inventory

  constructor(inventory: Inventory) {
    this.inventory = inventory
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.inventory.id
  }

  getInventory(): Inventory {
    return this.inventory
  }
}
```

---

## 4. Application Layer

Located at `src/domain/[subdomain]/application/`

### 4.1 Repository Interfaces

Define contracts for persistence. Implementation details are in the infrastructure layer (or test doubles).

```typescript
// src/domain/catalog/application/repositories/products-repository.ts
import { Product } from '../../enterprise/entities/product'

export interface ProductsRepository {
  create(product: Product): Promise<void>
  findById(id: string): Promise<Product | null>
  findAll(): Promise<Product[]>
  save(product: Product): Promise<void>
}
```

### 4.2 Use Cases

Orchestrate domain logic. One class per use case with an `execute()` method.

```typescript
// src/domain/catalog/application/use-cases/create-product.ts
import { Either, right } from '@/core/either'
import { Product } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'
import { Size } from '../../enterprise/entities/value-objects/size'

interface CreateProductRequest {
  name: string
  description?: string
  size: string
  color: string
}

type CreateProductResponse = Either<null, { product: Product }>

export class CreateProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    const size = Size.create(request.size)

    const product = Product.create({
      name: request.name,
      description: request.description,
      size,
      color: request.color,
    })

    await this.productsRepository.create(product)

    return right({ product })
  }
}
```

**Use case with error handling:**

```typescript
// src/domain/stock/application/use-cases/notify-low-stock.ts
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InventoryRepository } from '../repositories/inventory-repository'
import { Inventory } from '../../enterprise/entities/inventory'

interface NotifyLowStockRequest {
  productId: string
}

type NotifyLowStockResponse = Either<
  ResourceNotFoundError,
  { inventory: Inventory; isLow: boolean }
>

export class NotifyLowStockUseCase {
  constructor(private inventoryRepository: InventoryRepository) {}

  async execute(request: NotifyLowStockRequest): Promise<NotifyLowStockResponse> {
    const inventory = await this.inventoryRepository.findByProductId(request.productId)

    if (!inventory) {
      return left(new ResourceNotFoundError())
    }

    const isLow = inventory.isLow()

    return right({ inventory, isLow })
  }
}
```

---

## 5. Test Infrastructure

### 5.1 Test Factories

Use Faker for realistic test data.

```typescript
// test/factories/make-product.ts
import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Product, ProductProps } from '@/domain/catalog/enterprise/entities/product'
import { Size } from '@/domain/catalog/enterprise/entities/value-objects/size'

export function makeProduct(
  override: Partial<ProductProps> = {},
  id?: UniqueEntityId,
): Product {
  return Product.create(
    {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      size: Size.create('M'),
      color: faker.color.human(),
      ...override,
    },
    id,
  )
}
```

### 5.2 In-Memory Repositories

Test doubles that implement repository interfaces.

```typescript
// test/repositories/in-memory-products-repository.ts
import { ProductsRepository } from '@/domain/catalog/application/repositories/products-repository'
import { Product } from '@/domain/catalog/enterprise/entities/product'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  async create(product: Product): Promise<void> {
    this.items.push(product)
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.find((item) => item.id.toValue() === id) ?? null
  }

  async findAll(): Promise<Product[]> {
    return this.items
  }

  async save(product: Product): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(product.id))
    if (index >= 0) {
      this.items[index] = product
    }
  }
}
```

### 5.3 Use Case Tests

```typescript
// src/domain/catalog/application/use-cases/create-product.spec.ts
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { CreateProductUseCase } from './create-product'

let productsRepository: InMemoryProductsRepository
let sut: CreateProductUseCase

describe('Create Product', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new CreateProductUseCase(productsRepository)
  })

  it('should create a product', async () => {
    const result = await sut.execute({
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt',
      size: 'M',
      color: 'Blue',
    })

    expect(result.isRight()).toBe(true)
    expect(productsRepository.items).toHaveLength(1)
    expect(productsRepository.items[0].name).toBe('Cotton T-Shirt')
  })
})
```

### 5.4 Domain Event Tests

```typescript
// src/domain/stock/enterprise/entities/inventory.spec.ts
import { DomainEvents } from '@/core/events/domain-events'
import { makeInventory } from 'test/factories/make-inventory'
import { Quantity } from './value-objects/quantity'
import { StockLevelReachedMinimum } from '../events/stock-level-reached-minimum'

describe('Inventory', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()
  })

  it('should emit StockLevelReachedMinimum when stock crosses threshold', () => {
    const inventory = makeInventory({
      currentQuantity: Quantity.create(15),
      minThreshold: Quantity.create(10),
    })

    const handler = vi.fn()
    DomainEvents.register(handler, StockLevelReachedMinimum.name)

    // Reduce stock below threshold
    inventory.reduceStock(Quantity.create(6))

    // Dispatch events
    DomainEvents.dispatchEventsForAggregate(inventory.id)

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
```

---

## 6. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Subdomains | lowercase, singular | `catalog`, `stock`, `sales` |
| Entities | PascalCase, singular | `Product`, `Inventory` |
| Value Objects | PascalCase, singular | `Quantity`, `Money` |
| Domain Events | PascalCase, past tense | `StockLevelReachedMinimum` |
| Repositories | PascalCase, plural + Repository | `ProductsRepository` |
| Use Cases | PascalCase, verb + noun | `CreateProductUseCase` |
| Factories | `make` + entity name | `makeProduct()` |
| In-memory repos | `InMemory` + repository name | `InMemoryProductsRepository` |
| Spec files | `*.spec.ts` colocated | `product.spec.ts` |

---

## 7. Adding New Features

### Step 1: Identify the Subdomain

Determine which bounded context the feature belongs to. If none exist, create a new subdomain folder.

### Step 2: Create Value Objects (if needed)

```bash
src/domain/[subdomain]/enterprise/entities/value-objects/[name].ts
src/domain/[subdomain]/enterprise/entities/value-objects/[name].spec.ts
```

### Step 3: Create or Update Entities

```bash
src/domain/[subdomain]/enterprise/entities/[name].ts
src/domain/[subdomain]/enterprise/entities/[name].spec.ts
```

### Step 4: Create Domain Events (if needed)

```bash
src/domain/[subdomain]/enterprise/events/[event-name].ts
```

### Step 5: Define Repository Interface

```bash
src/domain/[subdomain]/application/repositories/[entity]-repository.ts
```

### Step 6: Create Test Infrastructure

```bash
test/factories/make-[entity].ts
test/repositories/in-memory-[entity]-repository.ts
```

### Step 7: Implement Use Case

```bash
src/domain/[subdomain]/application/use-cases/[action]-[entity].ts
src/domain/[subdomain]/application/use-cases/[action]-[entity].spec.ts
```

### Step 8: Run Tests

```bash
npm run test
npm run lint
```

---

## Configuration Files

### tsconfig.json (path aliases)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "test"]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'test': path.resolve(__dirname, './test'),
    },
  },
})
```

### package.json (scripts)

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src test",
    "lint:fix": "eslint src test --fix"
  }
}
```

---

## Summary

This architecture provides:

- **Clear separation of concerns** through layered architecture
- **Domain isolation** via bounded contexts (subdomains)
- **Type safety** with TypeScript and generics
- **Testability** through dependency injection and in-memory repositories
- **Error handling** with Either monad (no exceptions for expected errors)
- **Event-driven design** with domain events for cross-aggregate communication
- **Immutability** in value objects
- **Factory pattern** for entity/VO creation with validation

The domain layer remains pure (no framework dependencies), making it easy to swap infrastructure implementations while keeping business logic intact.
