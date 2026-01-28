import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'
import { ZodError } from 'zod'
import { env } from '../env'
import { routes } from './routes'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'
import { OrganizationAlreadyExistsError } from '@/domain/adoption/application/use-cases/errors/organization-already-exists-error'

export const app = fastify()

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Find a Friend API',
      description: 'REST API for pet adoption system',
      version: '1.0.0',
    },
    tags: [
      { name: 'Organizations', description: 'Organization management' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Pets', description: 'Pet management and search' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})

app.register(scalar, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: env.JWT_EXPIRES_IN,
  },
})

app.register(fastifyCookie)

app.register(routes)

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.issues,
    })
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof OrganizationAlreadyExistsError) {
    return reply.status(409).send({
      message: error.message,
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({
    message: 'Internal server error',
  })
})
