import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Pet, PetProps } from '@/domain/adoption/enterprise/entities/pet'
import { PetAge } from '@/domain/adoption/enterprise/entities/value-objects/pet-age'
import { PetSize } from '@/domain/adoption/enterprise/entities/value-objects/pet-size'
import { EnergyLevel } from '@/domain/adoption/enterprise/entities/value-objects/energy-level'
import { IndependenceLevel } from '@/domain/adoption/enterprise/entities/value-objects/independence-level'
import { Environment } from '@/domain/adoption/enterprise/entities/value-objects/environment'

export function makePet(
  override: Partial<PetProps> = {},
  id?: UniqueEntityId,
): Pet {
  return Pet.create(
    {
      organizationId: new UniqueEntityId(),
      name: faker.animal.dog(),
      about: faker.lorem.sentence(),
      age: PetAge.adult(),
      size: PetSize.medium(),
      energyLevel: EnergyLevel.medium(),
      independenceLevel: IndependenceLevel.medium(),
      environment: Environment.mediumSpace(),
      city: faker.location.city(),
      ...override,
    },
    id,
  )
}
