import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Pet } from '../../enterprise/entities/pet'
import { PetsRepository } from '../repositories/pets-repository'

interface GetPetDetailsRequest {
  petId: string
}

type GetPetDetailsResponse = Either<ResourceNotFoundError, { pet: Pet }>

export class GetPetDetailsUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute(request: GetPetDetailsRequest): Promise<GetPetDetailsResponse> {
    const pet = await this.petsRepository.findById(request.petId)

    if (!pet) {
      return left(new ResourceNotFoundError('Pet not found'))
    }

    return right({ pet })
  }
}
