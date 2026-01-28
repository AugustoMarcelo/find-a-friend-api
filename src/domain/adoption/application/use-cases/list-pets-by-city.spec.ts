import { InMemoryPetsRepository } from 'test/repositories/in-memory-pets-repository'
import { makePet } from 'test/factories/make-pet'
import { ListPetsByCityUseCase } from './list-pets-by-city'

let petsRepository: InMemoryPetsRepository
let sut: ListPetsByCityUseCase

describe('List Pets By City', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    sut = new ListPetsByCityUseCase(petsRepository)
  })

  it('should list pets by city', async () => {
    const pet1 = makePet({ city: 'Sao Paulo' })
    const pet2 = makePet({ city: 'Sao Paulo' })
    const pet3 = makePet({ city: 'Rio de Janeiro' })

    await petsRepository.create(pet1)
    await petsRepository.create(pet2)
    await petsRepository.create(pet3)

    const result = await sut.execute({ city: 'Sao Paulo' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(2)
    }
  })

  it('should return empty array when no pets in city', async () => {
    const pet = makePet({ city: 'Sao Paulo' })
    await petsRepository.create(pet)

    const result = await sut.execute({ city: 'Curitiba' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(0)
    }
  })

  it('should be case insensitive', async () => {
    const pet = makePet({ city: 'Sao Paulo' })
    await petsRepository.create(pet)

    const result = await sut.execute({ city: 'sao paulo' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(1)
    }
  })
})
