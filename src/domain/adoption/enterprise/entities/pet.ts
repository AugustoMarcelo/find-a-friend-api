import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { PetAge } from './value-objects/pet-age'
import { PetSize } from './value-objects/pet-size'
import { EnergyLevel } from './value-objects/energy-level'
import { IndependenceLevel } from './value-objects/independence-level'
import { Environment } from './value-objects/environment'
import { PetPhotos } from './pet-photos'
import { Photo } from './photo'

export interface PetProps {
  organizationId: UniqueEntityId
  name: string
  about: string
  age: PetAge
  size: PetSize
  energyLevel: EnergyLevel
  independenceLevel: IndependenceLevel
  environment: Environment
  photos: PetPhotos
  adoptionRequirements: string[]
  city: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Pet extends AggregateRoot<PetProps> {
  get organizationId(): UniqueEntityId {
    return this.props.organizationId
  }

  get name(): string {
    return this.props.name
  }

  get about(): string {
    return this.props.about
  }

  get age(): PetAge {
    return this.props.age
  }

  get size(): PetSize {
    return this.props.size
  }

  get energyLevel(): EnergyLevel {
    return this.props.energyLevel
  }

  get independenceLevel(): IndependenceLevel {
    return this.props.independenceLevel
  }

  get environment(): Environment {
    return this.props.environment
  }

  get photos(): PetPhotos {
    return this.props.photos
  }

  get adoptionRequirements(): string[] {
    return this.props.adoptionRequirements
  }

  get city(): string {
    return this.props.city
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

  updateName(name: string): void {
    this.props.name = name
    this.touch()
  }

  updateAbout(about: string): void {
    if (about.length > 300) {
      throw new Error('About must be at most 300 characters')
    }
    this.props.about = about
    this.touch()
  }

  addPhoto(photo: Photo): void {
    this.props.photos.add(photo)
    this.touch()
  }

  removePhoto(photo: Photo): void {
    this.props.photos.remove(photo)
    this.touch()
  }

  addRequirement(requirement: string): void {
    this.props.adoptionRequirements.push(requirement)
    this.touch()
  }

  removeRequirement(requirement: string): void {
    this.props.adoptionRequirements = this.props.adoptionRequirements.filter(
      (r) => r !== requirement,
    )
    this.touch()
  }

  set photos(photos: PetPhotos) {
    this.props.photos = photos
    this.touch()
  }

  static create(
    props: Optional<
      PetProps,
      'createdAt' | 'updatedAt' | 'photos' | 'adoptionRequirements'
    >,
    id?: UniqueEntityId,
  ): Pet {
    if (props.about && props.about.length > 300) {
      throw new Error('About must be at most 300 characters')
    }

    return new Pet(
      {
        ...props,
        photos: props.photos ?? new PetPhotos(),
        adoptionRequirements: props.adoptionRequirements ?? [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )
  }
}
