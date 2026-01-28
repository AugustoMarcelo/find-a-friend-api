import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Email } from './value-objects/email'
import { Cep } from './value-objects/cep'
import { Whatsapp } from './value-objects/whatsapp'

export interface OrganizationProps {
  ownerName: string
  email: Email
  cep: Cep
  address: string
  city: string
  state: string
  whatsapp: Whatsapp
  passwordHash: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Organization extends AggregateRoot<OrganizationProps> {
  get ownerName(): string {
    return this.props.ownerName
  }

  get email(): Email {
    return this.props.email
  }

  get cep(): Cep {
    return this.props.cep
  }

  get address(): string {
    return this.props.address
  }

  get city(): string {
    return this.props.city
  }

  get state(): string {
    return this.props.state
  }

  get whatsapp(): Whatsapp {
    return this.props.whatsapp
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | null | undefined {
    return this.props.updatedAt
  }

  private touch(): void {
    this.props.updatedAt = new Date()
  }

  updateOwnerName(name: string): void {
    this.props.ownerName = name
    this.touch()
  }

  updateAddress(address: string, cep: Cep, city: string, state: string): void {
    this.props.address = address
    this.props.cep = cep
    this.props.city = city
    this.props.state = state
    this.touch()
  }

  updateWhatsapp(whatsapp: Whatsapp): void {
    this.props.whatsapp = whatsapp
    this.touch()
  }

  static create(
    props: Optional<OrganizationProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId,
  ): Organization {
    return new Organization(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )
  }
}
