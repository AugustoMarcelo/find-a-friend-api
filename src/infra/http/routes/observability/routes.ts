import { FastifyInstance } from 'fastify'
import { healthController } from './health.controller'
import { metricsController } from './metrics.controller'

export async function observabilityRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Observability'],
        summary: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    healthController,
  )

  app.get(
    '/metrics',
    {
      schema: {
        tags: ['Observability'],
        summary: 'Prometheus metrics endpoint',
        produces: ['text/plain'],
        response: {
          200: {
            type: 'string',
            description: 'Prometheus metrics in text format',
          },
        },
      },
    },
    metricsController,
  )
}
