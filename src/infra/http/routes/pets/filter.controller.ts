import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { FilterPetsUseCase } from '@/domain/adoption/application/use-cases/filter-pets'
import { PrismaPetsRepository } from '@/infra/database/prisma/repositories/prisma-pets-repository'
import { PetPresenter } from '../../presenters/pet-presenter'

const filterPetsQuerySchema = z.object({
  city: z.string().min(2),
  age: z.enum(['PUPPY', 'ADULT', 'SENIOR']).optional(),
  size: z.enum(['TINY', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  independenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  environment: z
    .enum(['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE'])
    .optional(),
})

export async function filterController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = filterPetsQuerySchema.parse(request.query)

  const petsRepository = new PrismaPetsRepository()
  const useCase = new FilterPetsUseCase(petsRepository)

  const result = await useCase.execute({
    city: query.city,
    age: query.age,
    size: query.size,
    energyLevel: query.energyLevel,
    independenceLevel: query.independenceLevel,
    environment: query.environment,
  })

  const { pets } = result.value!

  return reply.status(200).send({
    pets: pets.map(PetPresenter.toHTTPList),
  })
}
