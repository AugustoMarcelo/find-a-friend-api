import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'
import { env } from '../env'
import { routes } from './routes'
import { ErrorMapper } from './errors'

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
  const mappedError = ErrorMapper.toHttp(error)

  if (mappedError) {
    return reply.status(mappedError.statusCode).send(mappedError.body)
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({
    message: 'Internal server error',
  })
})
