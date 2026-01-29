import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { PetsRepository } from '../repositories/pets-repository'

interface DeletePetPhotoRequest {
  petId: string
  photoId: string
  organizationId: string
}

type DeletePetPhotoResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

export class DeletePetPhotoUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute(
    request: DeletePetPhotoRequest,
  ): Promise<DeletePetPhotoResponse> {
    const pet = await this.petsRepository.findById(request.petId)

    if (!pet) {
      return left(new ResourceNotFoundError('Pet not found'))
    }

    if (pet.organizationId.toValue() !== request.organizationId) {
      return left(new NotAllowedError())
    }

    const photo = pet.photos
      .getItems()
      .find((p) => p.id.toValue() === request.photoId)

    if (!photo) {
      return left(new ResourceNotFoundError('Photo not found'))
    }

    pet.removePhoto(photo)

    await this.petsRepository.save(pet)

    return right(null)
  }
}
