import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityId } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class TestAggregate extends AggregateRoot<{ name: string }> {
  static create(props: { name: string }, id?: UniqueEntityId): TestAggregate {
    const aggregate = new TestAggregate(props, id)
    return aggregate
  }

  triggerEvent(event: DomainEvent): void {
    this.addDomainEvent(event)
  }
}

class TestDomainEvent implements DomainEvent {
  public occurredAt: Date
  private aggregateId: UniqueEntityId

  constructor(aggregateId: UniqueEntityId) {
    this.aggregateId = aggregateId
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregateId
  }
}

describe('DomainEvents', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()
  })

  it('should register and dispatch a domain event', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(handler).toHaveBeenCalledWith(event)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should mark aggregate for dispatch when event is added', () => {
    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)

    expect(aggregate.domainEvents).toHaveLength(1)
    expect(aggregate.domainEvents[0]).toBe(event)
  })

  it('should clear events after dispatching', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(aggregate.domainEvents).toHaveLength(0)
  })

  it('should not dispatch events for unregistered aggregate', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const unrelatedId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)
    DomainEvents.dispatchEventsForAggregate(unrelatedId)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should support multiple handlers for the same event', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    DomainEvents.register(handler1, 'TestDomainEvent')
    DomainEvents.register(handler2, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(handler1).toHaveBeenCalledWith(event)
    expect(handler2).toHaveBeenCalledWith(event)
  })

  it('should dispatch multiple events from the same aggregate', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event1 = new TestDomainEvent(aggregateId)
    const event2 = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event1)
    aggregate.triggerEvent(event2)
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(1, event1)
    expect(handler).toHaveBeenNthCalledWith(2, event2)
  })

  it('should not mark the same aggregate twice', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event1 = new TestDomainEvent(aggregateId)
    const event2 = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event1)
    aggregate.triggerEvent(event2)
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should clear handlers', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    DomainEvents.clearHandlers()

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should clear marked aggregates', () => {
    const handler = vi.fn()
    DomainEvents.register(handler, 'TestDomainEvent')

    const aggregateId = new UniqueEntityId()
    const aggregate = TestAggregate.create({ name: 'test' }, aggregateId)
    const event = new TestDomainEvent(aggregateId)

    aggregate.triggerEvent(event)
    DomainEvents.clearMarkedAggregates()
    DomainEvents.dispatchEventsForAggregate(aggregateId)

    expect(handler).not.toHaveBeenCalled()
    expect(aggregate.domainEvents).toHaveLength(1)
  })
})
