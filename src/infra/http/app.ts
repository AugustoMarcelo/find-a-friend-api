import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'
import { env } from '../env'
import { routes } from './routes'
import { ErrorMapper } from './errors'
import { httpRequestDuration, httpRequestsTotal } from '../metrics/prometheus'

export const app = fastify()

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Find a Friend API',
      description: 'REST API for pet adoption system',
      version: '1.0.0',
    },
    tags: [
      { name: 'Observability', description: 'Health and metrics endpoints' },
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
  sign: {
    expiresIn: env.JWT_EXPIRES_IN,
  },
})

app.register(fastifyCookie)

app.setValidatorCompiler(() => {
  return () => true
})

app.addHook('onRequest', (request, _reply, done) => {
  request.startTime = process.hrtime.bigint()
  done()
})

app.addHook('onResponse', (request, reply, done) => {
  const route = request.routeOptions?.url || request.url
  const method = request.method
  const statusCode = reply.statusCode.toString()

  if (route !== '/metrics' && route !== '/health') {
    const duration = Number(process.hrtime.bigint() - request.startTime) / 1e9
    httpRequestDuration.labels(method, route, statusCode).observe(duration)
    httpRequestsTotal.labels(method, route, statusCode).inc()
  }

  done()
})

app.register(routes)

app.setErrorHandler((error, request, reply) => {
  const mappedError = ErrorMapper.toHttp(error)

  if (mappedError) {
    return reply
      .status(mappedError.statusCode)
      .header('content-type', 'application/json; charset=utf-8')
      .send(JSON.stringify(mappedError.body))
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({
    message: 'Internal server error',
  })
})
