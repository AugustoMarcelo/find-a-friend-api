import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface PhotoProps {
  petId: UniqueEntityId
  url: string
  createdAt: Date
}

export class Photo extends Entity<PhotoProps> {
  get petId(): UniqueEntityId {
    return this.props.petId
  }

  get url(): string {
    return this.props.url
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(
    props: Optional<PhotoProps, 'createdAt'>,
    id?: UniqueEntityId,
  ): Photo {
    return new Photo(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
