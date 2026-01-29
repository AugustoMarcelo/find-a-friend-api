import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AuthenticateOrganizationUseCase } from '@/domain/adoption/application/use-cases/authenticate-organization'
import { PrismaOrganizationsRepository } from '@/infra/database/prisma/repositories/prisma-organizations-repository'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'
import { env } from '@/infra/env'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function authenticateController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = authenticateBodySchema.parse(request.body)

  const organizationsRepository = new PrismaOrganizationsRepository()
  const hasher = new BcryptHasher()
  const useCase = new AuthenticateOrganizationUseCase(
    organizationsRepository,
    hasher,
  )

  const result = await useCase.execute({
    email: body.email,
    password: body.password,
  })

  if (result.isLeft()) {
    throw new InvalidCredentialsError()
  }

  const { organization } = result.value

  const accessToken = await reply.jwtSign(
    {},
    {
      sign: {
        sub: organization.id.toValue(),
        expiresIn: env.JWT_EXPIRES_IN,
      },
    },
  )

  const refreshToken = await reply.jwtSign(
    {},
    {
      sign: {
        sub: organization.id.toValue(),
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      },
    },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({
      accessToken,
    })
}
