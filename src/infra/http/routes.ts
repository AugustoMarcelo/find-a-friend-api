import { FastifyInstance } from 'fastify'
import { createOrganizationController } from './controllers/create-organization.controller'
import { authenticateOrganizationController } from './controllers/authenticate-organization.controller'
import { refreshTokenController } from './controllers/refresh-token.controller'
import { createPetController } from './controllers/create-pet.controller'
import { getPetDetailsController } from './controllers/get-pet-details.controller'
import { listPetsByCityController } from './controllers/list-pets-by-city.controller'
import { filterPetsController } from './controllers/filter-pets.controller'
import { verifyJwt } from './middlewares/verify-jwt'

export async function routes(app: FastifyInstance) {
  // Organization routes
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
    createOrganizationController,
  )

  // Auth routes
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
    authenticateOrganizationController,
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
    refreshTokenController,
  )

  // Public pet routes
  app.get(
    '/pets',
    {
      schema: {
        tags: ['Pets'],
        summary: 'List pets by city',
        querystring: {
          type: 'object',
          required: ['city'],
          properties: {
            city: { type: 'string', minLength: 2 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              pets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    age: { type: 'string', enum: ['PUPPY', 'ADULT', 'SENIOR'] },
                    size: {
                      type: 'string',
                      enum: ['TINY', 'SMALL', 'MEDIUM', 'LARGE'],
                    },
                    city: { type: 'string' },
                  },
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
        },
      },
    },
    listPetsByCityController,
  )

  app.get(
    '/pets/filter',
    {
      schema: {
        tags: ['Pets'],
        summary: 'Filter pets by characteristics',
        querystring: {
          type: 'object',
          required: ['city'],
          properties: {
            city: { type: 'string', minLength: 2 },
            age: { type: 'string', enum: ['PUPPY', 'ADULT', 'SENIOR'] },
            size: {
              type: 'string',
              enum: ['TINY', 'SMALL', 'MEDIUM', 'LARGE'],
            },
            energyLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            independenceLevel: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
            },
            environment: {
              type: 'string',
              enum: ['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE'],
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              pets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    age: { type: 'string', enum: ['PUPPY', 'ADULT', 'SENIOR'] },
                    size: {
                      type: 'string',
                      enum: ['TINY', 'SMALL', 'MEDIUM', 'LARGE'],
                    },
                    city: { type: 'string' },
                  },
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
        },
      },
    },
    filterPetsController,
  )

  app.get(
    '/pets/:petId',
    {
      schema: {
        tags: ['Pets'],
        summary: 'Get pet details',
        params: {
          type: 'object',
          required: ['petId'],
          properties: {
            petId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              pet: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  organizationId: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  about: { type: 'string' },
                  age: { type: 'string', enum: ['PUPPY', 'ADULT', 'SENIOR'] },
                  size: {
                    type: 'string',
                    enum: ['TINY', 'SMALL', 'MEDIUM', 'LARGE'],
                  },
                  energyLevel: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                  },
                  independenceLevel: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                  },
                  environment: {
                    type: 'string',
                    enum: ['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE'],
                  },
                  photos: { type: 'array', items: { type: 'string' } },
                  adoptionRequirements: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  city: { type: 'string' },
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
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    getPetDetailsController,
  )

  // Authenticated routes
  app.post(
    '/pets',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Pets'],
        summary: 'Create a new pet',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: [
            'name',
            'about',
            'age',
            'size',
            'energyLevel',
            'independenceLevel',
            'environment',
          ],
          properties: {
            name: { type: 'string', minLength: 2 },
            about: { type: 'string', maxLength: 300 },
            age: { type: 'string', enum: ['PUPPY', 'ADULT', 'SENIOR'] },
            size: {
              type: 'string',
              enum: ['TINY', 'SMALL', 'MEDIUM', 'LARGE'],
            },
            energyLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            independenceLevel: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
            },
            environment: {
              type: 'string',
              enum: ['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE'],
            },
            photos: { type: 'array', items: { type: 'string', format: 'uri' } },
            adoptionRequirements: { type: 'array', items: { type: 'string' } },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              pet: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  organizationId: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  about: { type: 'string' },
                  age: { type: 'string', enum: ['PUPPY', 'ADULT', 'SENIOR'] },
                  size: {
                    type: 'string',
                    enum: ['TINY', 'SMALL', 'MEDIUM', 'LARGE'],
                  },
                  energyLevel: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                  },
                  independenceLevel: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                  },
                  environment: {
                    type: 'string',
                    enum: ['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE'],
                  },
                  photos: { type: 'array', items: { type: 'string' } },
                  adoptionRequirements: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  city: { type: 'string' },
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
          401: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    createPetController,
  )
}
