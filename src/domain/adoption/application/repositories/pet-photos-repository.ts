import { Photo } from '../../enterprise/entities/photo'

export interface PetPhotosRepository {
  createMany(photos: Photo[]): Promise<void>
  deleteMany(photos: Photo[]): Promise<void>
  findManyByPetId(petId: string): Promise<Photo[]>
  deleteManyByPetId(petId: string): Promise<void>
}
