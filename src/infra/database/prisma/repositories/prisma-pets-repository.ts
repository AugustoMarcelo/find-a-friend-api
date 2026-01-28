import { prisma } from '../prisma-client'
import {
  PetsRepository,
  PetFilters,
} from '@/domain/adoption/application/repositories/pets-repository'
import { Pet } from '@/domain/adoption/enterprise/entities/pet'
import { PrismaPetMapper } from '../mappers/prisma-pet-mapper'

export class PrismaPetsRepository implements PetsRepository {
  async create(pet: Pet): Promise<void> {
    const data = PrismaPetMapper.toPrisma(pet)
    await prisma.pet.create({ data })
  }

  async findById(id: string): Promise<Pet | null> {
    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      return null
    }

    return PrismaPetMapper.toDomain(pet)
  }

  async findManyByCity(city: string): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      where: {
        city: {
          equals: city,
          mode: 'insensitive',
        },
      },
    })

    return pets.map(PrismaPetMapper.toDomain)
  }

  async findManyByFilters(filters: PetFilters): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      where: {
        city: {
          equals: filters.city,
          mode: 'insensitive',
        },
        ...(filters.age && { age: filters.age.getValue() }),
        ...(filters.size && { size: filters.size.getValue() }),
        ...(filters.energyLevel && {
          energyLevel: filters.energyLevel.getValue(),
        }),
        ...(filters.independenceLevel && {
          independenceLevel: filters.independenceLevel.getValue(),
        }),
        ...(filters.environment && {
          environment: filters.environment.getValue(),
        }),
      },
    })

    return pets.map(PrismaPetMapper.toDomain)
  }

  async findManyByOrganizationId(organizationId: string): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      where: { organizationId },
    })

    return pets.map(PrismaPetMapper.toDomain)
  }

  async save(pet: Pet): Promise<void> {
    const data = PrismaPetMapper.toPrisma(pet)
    await prisma.pet.update({
      where: { id: data.id },
      data,
    })
  }

  async delete(pet: Pet): Promise<void> {
    await prisma.pet.delete({
      where: { id: pet.id.toValue() },
    })
  }
}
