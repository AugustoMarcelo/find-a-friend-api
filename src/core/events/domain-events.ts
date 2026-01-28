import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityId } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'

type DomainEventCallback = (event: DomainEvent) => void

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}
  private static markedAggregates: AggregateRoot<unknown>[] = []

  public static markAggregateForDispatch(
    aggregate: AggregateRoot<unknown>,
  ): void {
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
      this.markedAggregates = this.markedAggregates.filter(
        (a) => !a.id.equals(id),
      )
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
