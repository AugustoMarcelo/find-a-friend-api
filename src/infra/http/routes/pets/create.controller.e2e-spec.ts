import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'
import { createAndAuthenticateOrganization } from 'test/e2e/helpers/create-and-authenticate-organization'

describe('Create Pet (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should create a pet when authenticated', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      pet: expect.objectContaining({
        id: expect.any(String),
        name: 'Buddy',
        age: 'ADULT',
        size: 'MEDIUM',
      }),
    })
  })

  it('should create a pet with photos and adoption requirements', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Max',
        about: 'A playful dog',
        age: 'PUPPY',
        size: 'SMALL',
        energyLevel: 'HIGH',
        independenceLevel: 'LOW',
        environment: 'LARGE_SPACE',
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
        ],
        adoptionRequirements: ['Large yard required', 'Active owner preferred'],
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().pet.photos).toHaveLength(2)
    expect(response.json().pet.adoptionRequirements).toHaveLength(2)
  })

  it('should inherit city from organization', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app, {
      city: 'Rio de Janeiro',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().pet.city).toBe('Rio de Janeiro')
  })

  it('should return 401 without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 401 with invalid token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: 'Bearer invalid-token',
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 400 for invalid age enum', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'INVALID',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 400 for invalid size enum', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const response = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'EXTRA_LARGE',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    expect(response.statusCode).toBe(400)
  })
})
