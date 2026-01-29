import { InMemoryPetsRepository } from 'test/repositories/in-memory-pets-repository'
import { InMemoryPetPhotosRepository } from 'test/repositories/in-memory-pet-photos-repository'
import { makePet } from 'test/factories/make-pet'
import { UploadPetPhotoUseCase } from './upload-pet-photo'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

let petPhotosRepository: InMemoryPetPhotosRepository
let petsRepository: InMemoryPetsRepository
let sut: UploadPetPhotoUseCase

describe('Upload Pet Photo', () => {
  beforeEach(() => {
    petPhotosRepository = new InMemoryPetPhotosRepository()
    petsRepository = new InMemoryPetsRepository(petPhotosRepository)
    sut = new UploadPetPhotoUseCase(petsRepository)
  })

  it('should upload a photo to a pet', async () => {
    const organizationId = new UniqueEntityId()
    const pet = makePet({ organizationId })
    await petsRepository.create(pet)

    const result = await sut.execute({
      petId: pet.id.toValue(),
      organizationId: organizationId.toValue(),
      photoUrl: 'http://example.com/photo.jpg',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.photo.url).toBe('http://example.com/photo.jpg')
      expect(result.value.photo.petId.equals(pet.id)).toBe(true)
    }
    expect(petsRepository.items[0].photos.getItems()).toHaveLength(1)
  })

  it('should return error when pet is not found', async () => {
    const result = await sut.execute({
      petId: 'non-existent-id',
      organizationId: 'org-id',
      photoUrl: 'http://example.com/photo.jpg',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when organization does not match', async () => {
    const pet = makePet({ organizationId: new UniqueEntityId('org-1') })
    await petsRepository.create(pet)

    const result = await sut.execute({
      petId: pet.id.toValue(),
      organizationId: 'different-org-id',
      photoUrl: 'http://example.com/photo.jpg',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
