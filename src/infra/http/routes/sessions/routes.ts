import { FastifyInstance } from 'fastify'
import { authenticateController } from './authenticate.controller'
import { refreshController } from './refresh.controller'

export async function sessionsRoutes(app: FastifyInstance) {
  app.post(
    '/sessions',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate organization',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              issues: { type: 'object' },
            },
          },
          401: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authenticateController,
  )

  app.patch(
    '/token/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description:
          'Uses refresh token from cookie to generate a new access token',
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    refreshController,
  )
}
