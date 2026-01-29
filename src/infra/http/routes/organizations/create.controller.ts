import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { CreateOrganizationUseCase } from '@/domain/adoption/application/use-cases/create-organization'
import { PrismaOrganizationsRepository } from '@/infra/database/prisma/repositories/prisma-organizations-repository'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'
import { OrganizationAlreadyExistsError } from '@/domain/adoption/application/use-cases/errors/organization-already-exists-error'
import { OrganizationPresenter } from '../../presenters/organization-presenter'

const createOrganizationBodySchema = z.object({
  ownerName: z.string().min(2),
  email: z.email(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  whatsapp: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/),
  password: z.string().min(6),
})

export async function createController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = createOrganizationBodySchema.parse(request.body)

  const organizationsRepository = new PrismaOrganizationsRepository()
  const hasher = new BcryptHasher()
  const useCase = new CreateOrganizationUseCase(organizationsRepository, hasher)

  const result = await useCase.execute({
    ownerName: body.ownerName,
    email: body.email,
    cep: body.cep,
    address: body.address,
    city: body.city,
    state: body.state,
    whatsapp: body.whatsapp,
    password: body.password,
  })

  if (result.isLeft()) {
    throw new OrganizationAlreadyExistsError()
  }

  return reply.status(201).send({
    organization: OrganizationPresenter.toHTTP(result.value.organization),
  })
}
