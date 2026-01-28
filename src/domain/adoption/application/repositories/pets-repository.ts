import { Pet } from '../../enterprise/entities/pet'
import { PetAge } from '../../enterprise/entities/value-objects/pet-age'
import { PetSize } from '../../enterprise/entities/value-objects/pet-size'
import { EnergyLevel } from '../../enterprise/entities/value-objects/energy-level'
import { IndependenceLevel } from '../../enterprise/entities/value-objects/independence-level'
import { Environment } from '../../enterprise/entities/value-objects/environment'

export interface PetFilters {
  city: string
  age?: PetAge
  size?: PetSize
  energyLevel?: EnergyLevel
  independenceLevel?: IndependenceLevel
  environment?: Environment
}

export interface PetsRepository {
  create(pet: Pet): Promise<void>
  findById(id: string): Promise<Pet | null>
  findManyByCity(city: string): Promise<Pet[]>
  findManyByFilters(filters: PetFilters): Promise<Pet[]>
  findManyByOrganizationId(organizationId: string): Promise<Pet[]>
  save(pet: Pet): Promise<void>
  delete(pet: Pet): Promise<void>
}
