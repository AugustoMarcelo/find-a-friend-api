import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { GetPetDetailsUseCase } from '@/domain/adoption/application/use-cases/get-pet-details'
import { PrismaPetsRepository } from '@/infra/database/prisma/repositories/prisma-pets-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PetPresenter } from '../../presenters/pet-presenter'

const getPetDetailsParamsSchema = z.object({
  petId: z.string().uuid(),
})

export async function getDetailsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = getPetDetailsParamsSchema.parse(request.params)

  const petsRepository = new PrismaPetsRepository()
  const useCase = new GetPetDetailsUseCase(petsRepository)

  const result = await useCase.execute({
    petId: params.petId,
  })

  if (result.isLeft()) {
    throw new ResourceNotFoundError('Pet not found')
  }

  return reply.status(200).send({
    pet: PetPresenter.toHTTP(result.value.pet),
  })
}
