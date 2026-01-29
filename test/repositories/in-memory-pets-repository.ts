import {
  PetsRepository,
  PetFilters,
} from '@/domain/adoption/application/repositories/pets-repository'
import { Pet } from '@/domain/adoption/enterprise/entities/pet'
import { InMemoryPetPhotosRepository } from './in-memory-pet-photos-repository'

export class InMemoryPetsRepository implements PetsRepository {
  public items: Pet[] = []

  constructor(private petPhotosRepository?: InMemoryPetPhotosRepository) {}

  async create(pet: Pet): Promise<void> {
    this.items.push(pet)

    if (this.petPhotosRepository) {
      await this.petPhotosRepository.createMany(pet.photos.getItems())
    }
  }

  async findById(id: string): Promise<Pet | null> {
    return this.items.find((item) => item.id.toValue() === id) ?? null
  }

  async findManyByCity(city: string): Promise<Pet[]> {
    return this.items.filter(
      (item) => item.city.toLowerCase() === city.toLowerCase(),
    )
  }

  async findManyByFilters(filters: PetFilters): Promise<Pet[]> {
    return this.items.filter((item) => {
      if (item.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false
      }
      if (filters.age && !item.age.equals(filters.age)) {
        return false
      }
      if (filters.size && !item.size.equals(filters.size)) {
        return false
      }
      if (
        filters.energyLevel &&
        !item.energyLevel.equals(filters.energyLevel)
      ) {
        return false
      }
      if (
        filters.independenceLevel &&
        !item.independenceLevel.equals(filters.independenceLevel)
      ) {
        return false
      }
      if (
        filters.environment &&
        !item.environment.equals(filters.environment)
      ) {
        return false
      }
      return true
    })
  }

  async findManyByOrganizationId(organizationId: string): Promise<Pet[]> {
    return this.items.filter(
      (item) => item.organizationId.toValue() === organizationId,
    )
  }

  async save(pet: Pet): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(pet.id))
    if (index >= 0) {
      this.items[index] = pet

      if (this.petPhotosRepository) {
        await this.petPhotosRepository.createMany(pet.photos.getNewItems())
        await this.petPhotosRepository.deleteMany(pet.photos.getRemovedItems())
      }
    }
  }

  async delete(pet: Pet): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(pet.id))
  }
}
