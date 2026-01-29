import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ListPetsByCityUseCase } from '@/domain/adoption/application/use-cases/list-pets-by-city'
import { PrismaPetsRepository } from '@/infra/database/prisma/repositories/prisma-pets-repository'
import { PetPresenter } from '../../presenters/pet-presenter'

const listPetsByCityQuerySchema = z.object({
  city: z.string().min(2),
})

export async function listByCityController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = listPetsByCityQuerySchema.parse(request.query)

  const petsRepository = new PrismaPetsRepository()
  const useCase = new ListPetsByCityUseCase(petsRepository)

  const result = await useCase.execute({
    city: query.city,
  })

  const { pets } = result.value!

  return reply.status(200).send({
    pets: pets.map(PetPresenter.toHTTPList),
  })
}
