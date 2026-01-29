import { FastifyInstance } from 'fastify'
import { createController } from './create.controller'

export async function organizationsRoutes(app: FastifyInstance) {
  app.post(
    '/organizations',
    {
      schema: {
        tags: ['Organizations'],
        summary: 'Register a new organization',
        body: {
          type: 'object',
          required: [
            'ownerName',
            'email',
            'cep',
            'address',
            'city',
            'state',
            'whatsapp',
            'password',
          ],
          properties: {
            ownerName: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            cep: { type: 'string', pattern: '^\\d{5}-?\\d{3}$' },
            address: { type: 'string', minLength: 5 },
            city: { type: 'string', minLength: 2 },
            state: { type: 'string', minLength: 2, maxLength: 2 },
            whatsapp: {
              type: 'string',
              pattern: '^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$',
            },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              organization: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  ownerName: { type: 'string' },
                  email: { type: 'string' },
                  cep: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  whatsapp: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              issues: { type: 'object' },
            },
          },
          409: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    createController,
  )
}
