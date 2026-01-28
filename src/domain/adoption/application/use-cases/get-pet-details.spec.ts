import { InMemoryPetsRepository } from 'test/repositories/in-memory-pets-repository'
import { makePet } from 'test/factories/make-pet'
import { GetPetDetailsUseCase } from './get-pet-details'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

let petsRepository: InMemoryPetsRepository
let sut: GetPetDetailsUseCase

describe('Get Pet Details', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    sut = new GetPetDetailsUseCase(petsRepository)
  })

  it('should get pet details', async () => {
    const pet = makePet({ name: 'Rex' })
    await petsRepository.create(pet)

    const result = await sut.execute({ petId: pet.id.toValue() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pet.name).toBe('Rex')
      expect(result.value.pet.id.equals(pet.id)).toBe(true)
    }
  })

  it('should return error when pet not found', async () => {
    const result = await sut.execute({ petId: 'non-existent-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
