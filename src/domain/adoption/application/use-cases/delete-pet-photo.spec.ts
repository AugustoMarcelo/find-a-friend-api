import { InMemoryPetsRepository } from 'test/repositories/in-memory-pets-repository'
import { InMemoryPetPhotosRepository } from 'test/repositories/in-memory-pet-photos-repository'
import { makePet } from 'test/factories/make-pet'
import { DeletePetPhotoUseCase } from './delete-pet-photo'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Photo } from '../../enterprise/entities/photo'
import { PetPhotos } from '../../enterprise/entities/pet-photos'

let petPhotosRepository: InMemoryPetPhotosRepository
let petsRepository: InMemoryPetsRepository
let sut: DeletePetPhotoUseCase

describe('Delete Pet Photo', () => {
  beforeEach(() => {
    petPhotosRepository = new InMemoryPetPhotosRepository()
    petsRepository = new InMemoryPetsRepository(petPhotosRepository)
    sut = new DeletePetPhotoUseCase(petsRepository)
  })

  it('should delete a photo from a pet', async () => {
    const organizationId = new UniqueEntityId()
    const petId = new UniqueEntityId()
    const photo = Photo.create({ petId, url: 'http://example.com/photo.jpg' })

    const pet = makePet(
      {
        organizationId,
        photos: new PetPhotos([photo]),
      },
      petId,
    )
    await petsRepository.create(pet)

    const result = await sut.execute({
      petId: pet.id.toValue(),
      photoId: photo.id.toValue(),
      organizationId: organizationId.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(petsRepository.items[0].photos.getItems()).toHaveLength(0)
  })

  it('should return error when pet is not found', async () => {
    const result = await sut.execute({
      petId: 'non-existent-id',
      photoId: 'photo-id',
      organizationId: 'org-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when organization does not match', async () => {
    const pet = makePet({ organizationId: new UniqueEntityId('org-1') })
    await petsRepository.create(pet)

    const result = await sut.execute({
      petId: pet.id.toValue(),
      photoId: 'photo-id',
      organizationId: 'different-org-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should return error when photo is not found', async () => {
    const organizationId = new UniqueEntityId()
    const pet = makePet({ organizationId })
    await petsRepository.create(pet)

    const result = await sut.execute({
      petId: pet.id.toValue(),
      photoId: 'non-existent-photo-id',
      organizationId: organizationId.toValue(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
