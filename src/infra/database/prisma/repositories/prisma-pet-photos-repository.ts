import { prisma } from '../prisma-client'
import { PetPhotosRepository } from '@/domain/adoption/application/repositories/pet-photos-repository'
import { Photo } from '@/domain/adoption/enterprise/entities/photo'
import { PrismaPhotoMapper } from '../mappers/prisma-photo-mapper'

export class PrismaPetPhotosRepository implements PetPhotosRepository {
  async createMany(photos: Photo[]): Promise<void> {
    if (photos.length === 0) {
      return
    }

    const data = photos.map(PrismaPhotoMapper.toPrisma)

    await prisma.photo.createMany({ data })
  }

  async deleteMany(photos: Photo[]): Promise<void> {
    if (photos.length === 0) {
      return
    }

    const photoIds = photos.map((photo) => photo.id.toValue())

    await prisma.photo.deleteMany({
      where: { id: { in: photoIds } },
    })
  }

  async findManyByPetId(petId: string): Promise<Photo[]> {
    const photos = await prisma.photo.findMany({
      where: { petId },
    })

    return photos.map(PrismaPhotoMapper.toDomain)
  }

  async deleteManyByPetId(petId: string): Promise<void> {
    await prisma.photo.deleteMany({
      where: { petId },
    })
  }
}
