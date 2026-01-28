import { Either, right } from '@/core/either'
import { Pet } from '../../enterprise/entities/pet'
import { PetsRepository } from '../repositories/pets-repository'

interface ListPetsByCityRequest {
  city: string
}

type ListPetsByCityResponse = Either<null, { pets: Pet[] }>

export class ListPetsByCityUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute(
    request: ListPetsByCityRequest,
  ): Promise<ListPetsByCityResponse> {
    const pets = await this.petsRepository.findManyByCity(request.city)

    return right({ pets })
  }
}
