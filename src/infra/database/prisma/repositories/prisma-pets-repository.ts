import { prisma } from '../prisma-client'
import {
  PetsRepository,
  PetFilters,
} from '@/domain/adoption/application/repositories/pets-repository'
import { Pet } from '@/domain/adoption/enterprise/entities/pet'
import { PrismaPetMapper } from '../mappers/prisma-pet-mapper'
import { PetPhotosRepository } from '@/domain/adoption/application/repositories/pet-photos-repository'

export class PrismaPetsRepository implements PetsRepository {
  constructor(private petPhotosRepository?: PetPhotosRepository) {}

  async create(pet: Pet): Promise<void> {
    const data = PrismaPetMapper.toPrisma(pet)

    await prisma.pet.create({ data })

    if (this.petPhotosRepository) {
      await this.petPhotosRepository.createMany(pet.photos.getItems())
    }
  }

  async findById(id: string): Promise<Pet | null> {
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { photos: true },
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
      include: { photos: true },
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
      include: { photos: true },
    })

    return pets.map(PrismaPetMapper.toDomain)
  }

  async findManyByOrganizationId(organizationId: string): Promise<Pet[]> {
    const pets = await prisma.pet.findMany({
      where: { organizationId },
      include: { photos: true },
    })

    return pets.map(PrismaPetMapper.toDomain)
  }

  async save(pet: Pet): Promise<void> {
    const data = PrismaPetMapper.toPrisma(pet)

    await prisma.pet.update({
      where: { id: data.id },
      data,
    })

    if (this.petPhotosRepository) {
      await this.petPhotosRepository.createMany(pet.photos.getNewItems())
      await this.petPhotosRepository.deleteMany(pet.photos.getRemovedItems())
    }
  }

  async delete(pet: Pet): Promise<void> {
    await prisma.pet.delete({
      where: { id: pet.id.toValue() },
    })
  }
}
