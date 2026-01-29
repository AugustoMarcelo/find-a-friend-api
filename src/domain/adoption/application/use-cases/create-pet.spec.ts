import { InMemoryPetsRepository } from 'test/repositories/in-memory-pets-repository'
import { InMemoryOrganizationsRepository } from 'test/repositories/in-memory-organizations-repository'
import { makeOrganization } from 'test/factories/make-organization'
import { CreatePetUseCase } from './create-pet'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

let petsRepository: InMemoryPetsRepository
let organizationsRepository: InMemoryOrganizationsRepository
let sut: CreatePetUseCase

describe('Create Pet', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    organizationsRepository = new InMemoryOrganizationsRepository()
    sut = new CreatePetUseCase(petsRepository, organizationsRepository)
  })

  it('should create a pet', async () => {
    const organization = makeOrganization()
    await organizationsRepository.create(organization)

    const result = await sut.execute({
      organizationId: organization.id.toValue(),
      name: 'Rex',
      about: 'A lovely dog',
      age: 'adult',
      size: 'medium',
      energyLevel: 'high',
      independenceLevel: 'medium',
      environment: 'large_space',
      photos: ['http://example.com/photo.jpg'],
      adoptionRequirements: ['Needs a backyard'],
    })

    expect(result.isRight()).toBe(true)
    expect(petsRepository.items).toHaveLength(1)
    expect(petsRepository.items[0].name).toBe('Rex')
    expect(petsRepository.items[0].city).toBe(organization.city)
  })

  it('should not create pet for non-existent organization', async () => {
    const result = await sut.execute({
      organizationId: 'non-existent-id',
      name: 'Rex',
      about: 'A lovely dog',
      age: 'adult',
      size: 'medium',
      energyLevel: 'high',
      independenceLevel: 'medium',
      environment: 'large_space',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should create pet with empty photos and requirements by default', async () => {
    const organization = makeOrganization()
    await organizationsRepository.create(organization)

    const result = await sut.execute({
      organizationId: organization.id.toValue(),
      name: 'Rex',
      about: 'A lovely dog',
      age: 'puppy',
      size: 'small',
      energyLevel: 'low',
      independenceLevel: 'low',
      environment: 'small_space',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.pet.photos.getItems()).toEqual([])
      expect(result.value.pet.adoptionRequirements).toEqual([])
    }
  })
})
