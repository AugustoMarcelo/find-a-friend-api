import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { PetsRepository } from '../repositories/pets-repository'
import { Photo } from '../../enterprise/entities/photo'

interface UploadPetPhotoRequest {
  petId: string
  organizationId: string
  photoUrl: string
}

type UploadPetPhotoResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { photo: Photo }
>

export class UploadPetPhotoUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute(
    request: UploadPetPhotoRequest,
  ): Promise<UploadPetPhotoResponse> {
    const pet = await this.petsRepository.findById(request.petId)

    if (!pet) {
      return left(new ResourceNotFoundError('Pet not found'))
    }

    if (pet.organizationId.toValue() !== request.organizationId) {
      return left(new NotAllowedError())
    }

    const photo = Photo.create({
      petId: pet.id,
      url: request.photoUrl,
    })

    pet.addPhoto(photo)

    await this.petsRepository.save(pet)

    return right({ photo })
  }
}
