import { Pet } from '@/domain/adoption/enterprise/entities/pet'

export class PetPresenter {
  static toHTTP(pet: Pet) {
    return {
      id: pet.id.toValue(),
      organizationId: pet.organizationId.toValue(),
      name: pet.name,
      about: pet.about,
      age: pet.age.getValue(),
      size: pet.size.getValue(),
      energyLevel: pet.energyLevel.getValue(),
      independenceLevel: pet.independenceLevel.getValue(),
      environment: pet.environment.getValue(),
      photos: pet.photos,
      adoptionRequirements: pet.adoptionRequirements,
      city: pet.city,
      createdAt: pet.createdAt,
    }
  }

  static toHTTPList(pet: Pet) {
    return {
      id: pet.id.toValue(),
      name: pet.name,
      age: pet.age.getValue(),
      size: pet.size.getValue(),
      city: pet.city,
    }
  }
}
