import { Pet as PrismaPet, Photo as PrismaPhoto } from '@prisma/client'
import { Pet } from '@/domain/adoption/enterprise/entities/pet'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { PetAge } from '@/domain/adoption/enterprise/entities/value-objects/pet-age'
import { PetSize } from '@/domain/adoption/enterprise/entities/value-objects/pet-size'
import { EnergyLevel } from '@/domain/adoption/enterprise/entities/value-objects/energy-level'
import { IndependenceLevel } from '@/domain/adoption/enterprise/entities/value-objects/independence-level'
import { Environment } from '@/domain/adoption/enterprise/entities/value-objects/environment'
import { PetPhotos } from '@/domain/adoption/enterprise/entities/pet-photos'
import { Photo } from '@/domain/adoption/enterprise/entities/photo'

type PrismaPetWithPhotos = PrismaPet & {
  photos: PrismaPhoto[]
}

export class PrismaPetMapper {
  static toDomain(raw: PrismaPetWithPhotos): Pet {
    const photos = raw.photos.map((photo) =>
      Photo.create(
        {
          petId: new UniqueEntityId(photo.petId),
          url: photo.url,
          createdAt: photo.createdAt,
        },
        new UniqueEntityId(photo.id),
      ),
    )

    return Pet.create(
      {
        organizationId: new UniqueEntityId(raw.organizationId),
        name: raw.name,
        about: raw.about,
        age: PetAge.create(raw.age),
        size: PetSize.create(raw.size),
        energyLevel: EnergyLevel.create(raw.energyLevel),
        independenceLevel: IndependenceLevel.create(raw.independenceLevel),
        environment: Environment.create(raw.environment),
        photos: new PetPhotos(photos),
        adoptionRequirements: raw.adoptionRequirements,
        city: raw.city,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(pet: Pet) {
    return {
      id: pet.id.toValue(),
      organizationId: pet.organizationId.toValue(),
      name: pet.name,
      about: pet.about,
      age: pet.age.getValue(),
      size: pet.size.getValue(),
      energyLevel: pet.energyLevel.getValue(),
      independenceLevel: pet.independenceLevel.getValue(),
      environment: pet.environment.getValue(),
      adoptionRequirements: pet.adoptionRequirements,
      city: pet.city,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    }
  }
}
