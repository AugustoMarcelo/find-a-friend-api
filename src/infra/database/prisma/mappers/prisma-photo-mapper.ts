import { Photo as PrismaPhoto } from '@prisma/client'
import { Photo } from '@/domain/adoption/enterprise/entities/photo'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export class PrismaPhotoMapper {
  static toDomain(raw: PrismaPhoto): Photo {
    return Photo.create(
      {
        petId: new UniqueEntityId(raw.petId),
        url: raw.url,
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(photo: Photo) {
    return {
      id: photo.id.toValue(),
      petId: photo.petId.toValue(),
      url: photo.url,
      createdAt: photo.createdAt,
    }
  }
}
