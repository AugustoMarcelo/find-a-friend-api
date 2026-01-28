import { Either, right } from '@/core/either'
import { Pet } from '../../enterprise/entities/pet'
import { PetsRepository } from '../repositories/pets-repository'
import { PetAge } from '../../enterprise/entities/value-objects/pet-age'
import { PetSize } from '../../enterprise/entities/value-objects/pet-size'
import { EnergyLevel } from '../../enterprise/entities/value-objects/energy-level'
import { IndependenceLevel } from '../../enterprise/entities/value-objects/independence-level'
import { Environment } from '../../enterprise/entities/value-objects/environment'

interface FilterPetsRequest {
  city: string
  age?: string
  size?: string
  energyLevel?: string
  independenceLevel?: string
  environment?: string
}

type FilterPetsResponse = Either<null, { pets: Pet[] }>

export class FilterPetsUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute(request: FilterPetsRequest): Promise<FilterPetsResponse> {
    const pets = await this.petsRepository.findManyByFilters({
      city: request.city,
      age: request.age ? PetAge.create(request.age) : undefined,
      size: request.size ? PetSize.create(request.size) : undefined,
      energyLevel: request.energyLevel
        ? EnergyLevel.create(request.energyLevel)
        : undefined,
      independenceLevel: request.independenceLevel
        ? IndependenceLevel.create(request.independenceLevel)
        : undefined,
      environment: request.environment
        ? Environment.create(request.environment)
        : undefined,
    })

    return right({ pets })
  }
}
