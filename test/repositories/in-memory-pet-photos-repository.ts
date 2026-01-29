import { PetPhotosRepository } from '@/domain/adoption/application/repositories/pet-photos-repository'
import { Photo } from '@/domain/adoption/enterprise/entities/photo'

export class InMemoryPetPhotosRepository implements PetPhotosRepository {
  public items: Photo[] = []

  async createMany(photos: Photo[]): Promise<void> {
    this.items.push(...photos)
  }

  async deleteMany(photos: Photo[]): Promise<void> {
    const photoIds = photos.map((photo) => photo.id.toValue())
    this.items = this.items.filter(
      (item) => !photoIds.includes(item.id.toValue()),
    )
  }

  async findManyByPetId(petId: string): Promise<Photo[]> {
    return this.items.filter((item) => item.petId.toValue() === petId)
  }

  async deleteManyByPetId(petId: string): Promise<void> {
    this.items = this.items.filter((item) => item.petId.toValue() !== petId)
  }
}
