import { FastifyInstance } from 'fastify'
import { createController } from './create.controller'
import { getDetailsController } from './get-details.controller'
import { listByCityController } from './list-by-city.controller'
import { filterController } from './filter.controller'
import { uploadPhotoController } from './upload-photo.controller'
import { deletePhotoController } from './delete-photo.controller'
import { verifyJwt } from '../../middlewares/verify-jwt'

export async function petsRoutes(app: FastifyInstance) {
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
    listByCityController,
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
    filterController,
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
                  photos: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        url: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
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
    getDetailsController,
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
                  photos: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        url: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
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
    createController,
  )

  // Pet photo routes
  app.post(
    '/pets/:petId/photos',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Pets'],
        summary: 'Upload a photo to a pet',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['petId'],
          properties: {
            petId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              photo: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  petId: { type: 'string', format: 'uuid' },
                  url: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          403: {
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
    uploadPhotoController,
  )

  app.delete(
    '/pets/:petId/photos/:photoId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Pets'],
        summary: 'Delete a photo from a pet',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['petId', 'photoId'],
          properties: {
            petId: { type: 'string', format: 'uuid' },
            photoId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            type: 'null',
          },
          401: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          403: {
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
    deletePhotoController,
  )
}
