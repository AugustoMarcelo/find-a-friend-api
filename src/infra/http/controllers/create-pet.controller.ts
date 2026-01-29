import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { CreatePetUseCase } from '@/domain/adoption/application/use-cases/create-pet'
import { PrismaPetsRepository } from '@/infra/database/prisma/repositories/prisma-pets-repository'
import { PrismaOrganizationsRepository } from '@/infra/database/prisma/repositories/prisma-organizations-repository'
import { PrismaPetPhotosRepository } from '@/infra/database/prisma/repositories/prisma-pet-photos-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PetPresenter } from '../presenters/pet-presenter'

const createPetBodySchema = z.object({
  name: z.string().min(2),
  about: z.string().max(300),
  age: z.enum(['PUPPY', 'ADULT', 'SENIOR']),
  size: z.enum(['TINY', 'SMALL', 'MEDIUM', 'LARGE']),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  independenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  environment: z.enum(['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE']),
  photos: z.array(z.string().url()).optional(),
  adoptionRequirements: z.array(z.string()).optional(),
})

export async function createPetController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = createPetBodySchema.parse(request.body)
  const organizationId = request.user.sub

  const petPhotosRepository = new PrismaPetPhotosRepository()
  const petsRepository = new PrismaPetsRepository(petPhotosRepository)
  const organizationsRepository = new PrismaOrganizationsRepository()
  const useCase = new CreatePetUseCase(petsRepository, organizationsRepository)

  const result = await useCase.execute({
    organizationId,
    name: body.name,
    about: body.about,
    age: body.age,
    size: body.size,
    energyLevel: body.energyLevel,
    independenceLevel: body.independenceLevel,
    environment: body.environment,
    photos: body.photos,
    adoptionRequirements: body.adoptionRequirements,
  })

  if (result.isLeft()) {
    throw new ResourceNotFoundError('Organization not found')
  }

  return reply.status(201).send({
    pet: PetPresenter.toHTTP(result.value.pet),
  })
}
