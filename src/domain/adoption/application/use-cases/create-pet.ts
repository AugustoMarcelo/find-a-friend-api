import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Pet } from '../../enterprise/entities/pet'
import { PetsRepository } from '../repositories/pets-repository'
import { OrganizationsRepository } from '../repositories/organizations-repository'
import { PetAge } from '../../enterprise/entities/value-objects/pet-age'
import { PetSize } from '../../enterprise/entities/value-objects/pet-size'
import { EnergyLevel } from '../../enterprise/entities/value-objects/energy-level'
import { IndependenceLevel } from '../../enterprise/entities/value-objects/independence-level'
import { Environment } from '../../enterprise/entities/value-objects/environment'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Photo } from '../../enterprise/entities/photo'
import { PetPhotos } from '../../enterprise/entities/pet-photos'

interface CreatePetRequest {
  organizationId: string
  name: string
  about: string
  age: string
  size: string
  energyLevel: string
  independenceLevel: string
  environment: string
  photos?: string[]
  adoptionRequirements?: string[]
}

type CreatePetResponse = Either<ResourceNotFoundError, { pet: Pet }>

export class CreatePetUseCase {
  constructor(
    private petsRepository: PetsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(request: CreatePetRequest): Promise<CreatePetResponse> {
    const organization = await this.organizationsRepository.findById(
      request.organizationId,
    )

    if (!organization) {
      return left(new ResourceNotFoundError('Organization not found'))
    }

    const petId = new UniqueEntityId()

    const photoEntities = (request.photos ?? []).map((url) =>
      Photo.create({
        petId,
        url,
      }),
    )

    const pet = Pet.create(
      {
        organizationId: new UniqueEntityId(request.organizationId),
        name: request.name,
        about: request.about,
        age: PetAge.create(request.age),
        size: PetSize.create(request.size),
        energyLevel: EnergyLevel.create(request.energyLevel),
        independenceLevel: IndependenceLevel.create(request.independenceLevel),
        environment: Environment.create(request.environment),
        photos: new PetPhotos(photoEntities),
        adoptionRequirements: request.adoptionRequirements,
        city: organization.city,
      },
      petId,
    )

    await this.petsRepository.create(pet)

    return right({ pet })
  }
}
