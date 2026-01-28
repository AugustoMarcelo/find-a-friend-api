import { InMemoryPetsRepository } from 'test/repositories/in-memory-pets-repository'
import { makePet } from 'test/factories/make-pet'
import { FilterPetsUseCase } from './filter-pets'
import { PetAge } from '../../enterprise/entities/value-objects/pet-age'
import { PetSize } from '../../enterprise/entities/value-objects/pet-size'
import { EnergyLevel } from '../../enterprise/entities/value-objects/energy-level'

let petsRepository: InMemoryPetsRepository
let sut: FilterPetsUseCase

describe('Filter Pets', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    sut = new FilterPetsUseCase(petsRepository)
  })

  it('should filter pets by city only', async () => {
    const pet1 = makePet({ city: 'Sao Paulo' })
    const pet2 = makePet({ city: 'Rio de Janeiro' })

    await petsRepository.create(pet1)
    await petsRepository.create(pet2)

    const result = await sut.execute({ city: 'Sao Paulo' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(1)
      expect(result.value.pets[0].city).toBe('Sao Paulo')
    }
  })

  it('should filter pets by city and age', async () => {
    const pet1 = makePet({ city: 'Sao Paulo', age: PetAge.puppy() })
    const pet2 = makePet({ city: 'Sao Paulo', age: PetAge.adult() })
    const pet3 = makePet({ city: 'Sao Paulo', age: PetAge.puppy() })

    await petsRepository.create(pet1)
    await petsRepository.create(pet2)
    await petsRepository.create(pet3)

    const result = await sut.execute({ city: 'Sao Paulo', age: 'puppy' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(2)
    }
  })

  it('should filter pets by city and size', async () => {
    const pet1 = makePet({ city: 'Sao Paulo', size: PetSize.small() })
    const pet2 = makePet({ city: 'Sao Paulo', size: PetSize.large() })

    await petsRepository.create(pet1)
    await petsRepository.create(pet2)

    const result = await sut.execute({ city: 'Sao Paulo', size: 'small' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(1)
    }
  })

  it('should filter pets by multiple criteria', async () => {
    const pet1 = makePet({
      city: 'Sao Paulo',
      age: PetAge.puppy(),
      size: PetSize.small(),
      energyLevel: EnergyLevel.high(),
    })
    const pet2 = makePet({
      city: 'Sao Paulo',
      age: PetAge.puppy(),
      size: PetSize.small(),
      energyLevel: EnergyLevel.low(),
    })
    const pet3 = makePet({
      city: 'Sao Paulo',
      age: PetAge.adult(),
      size: PetSize.small(),
      energyLevel: EnergyLevel.high(),
    })

    await petsRepository.create(pet1)
    await petsRepository.create(pet2)
    await petsRepository.create(pet3)

    const result = await sut.execute({
      city: 'Sao Paulo',
      age: 'puppy',
      size: 'small',
      energyLevel: 'high',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(1)
    }
  })

  it('should return empty when no pets match filters', async () => {
    const pet = makePet({ city: 'Sao Paulo', age: PetAge.adult() })
    await petsRepository.create(pet)

    const result = await sut.execute({ city: 'Sao Paulo', age: 'puppy' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pets).toHaveLength(0)
    }
  })
})
